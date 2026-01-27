-- ============================================
-- JobsClass: 가격 책정 모델 & 견적 시스템
-- 기존 quotation_requests 유지, 추가 테이블만 생성
-- RLS 정책 순서 수정
-- ============================================

-- ============================================
-- 1. pricing_model ENUM 생성
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_model') THEN
    CREATE TYPE pricing_model AS ENUM (
      'fixed',           -- 정액제 (즉시 구매 가능)
      'negotiable'       -- 협의 후 결정 (견적 필요)
    );
  END IF;
END $$;

-- ============================================
-- 2. products 테이블에 pricing_model 추가
-- ============================================
ALTER TABLE products
ADD COLUMN IF NOT EXISTS pricing_model pricing_model DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS base_price INTEGER,
ADD COLUMN IF NOT EXISTS price_range_min INTEGER,
ADD COLUMN IF NOT EXISTS price_range_max INTEGER,
ADD COLUMN IF NOT EXISTS consultation_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_quotation BOOLEAN DEFAULT false;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_products_pricing_model ON products(pricing_model);

COMMENT ON COLUMN products.pricing_model IS '가격 책정 모델: fixed(정액제) 또는 negotiable(협의)';
COMMENT ON COLUMN products.base_price IS '협의형 서비스의 시작 가격 (참고용)';
COMMENT ON COLUMN products.price_range_min IS '최소 가격 (협의 시 참고)';
COMMENT ON COLUMN products.price_range_max IS '최대 가격 (협의 시 참고)';

-- ============================================
-- 3. quotation_proposals (견적 제안) - 기존 quotation_requests에 대한 파트너의 응답
-- ============================================
CREATE TABLE IF NOT EXISTS quotation_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES quotation_requests(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 제안 정보
  proposal_title TEXT NOT NULL,
  proposal_description TEXT NOT NULL,
  proposed_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KRW',
  
  -- 작업 항목
  work_items JSONB, -- [{name, description, amount}]
  
  -- 일정
  estimated_duration TEXT,
  delivery_date DATE,
  
  -- 조건
  terms TEXT,
  payment_terms TEXT,
  
  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quotation_proposals_request ON quotation_proposals(request_id);
CREATE INDEX IF NOT EXISTS idx_quotation_proposals_partner ON quotation_proposals(partner_id);
CREATE INDEX IF NOT EXISTS idx_quotation_proposals_status ON quotation_proposals(status);

COMMENT ON TABLE quotation_proposals IS '견적 제안 (파트너가 quotation_requests에 응답)';

-- ============================================
-- 4. contracts (계약) - 테이블만 먼저 생성
-- ============================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES quotation_proposals(id) ON DELETE RESTRICT,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- 계약 정보
  contract_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KRW',
  
  -- 계약서
  contract_document JSONB,
  signed_document_url TEXT,
  
  -- 서명
  partner_signed BOOLEAN DEFAULT FALSE,
  client_signed BOOLEAN DEFAULT FALSE,
  partner_signed_at TIMESTAMPTZ,
  client_signed_at TIMESTAMPTZ,
  
  -- 일정
  start_date DATE,
  end_date DATE,
  
  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'disputed')),
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contracts_proposal ON contracts(proposal_id);
CREATE INDEX IF NOT EXISTS idx_contracts_partner ON contracts(partner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

COMMENT ON TABLE contracts IS '계약서 (견적 제안 승인 후 생성)';

-- ============================================
-- 5. RLS 정책 (테이블 생성 후)
-- ============================================

-- quotation_proposals RLS
ALTER TABLE quotation_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quotation_proposals_select_involved" ON quotation_proposals;
CREATE POLICY "quotation_proposals_select_involved" ON quotation_proposals
  FOR SELECT USING (
    quotation_proposals.partner_id = auth.uid() OR 
    quotation_proposals.request_id IN (SELECT id FROM quotation_requests WHERE client_id = auth.uid())
  );

DROP POLICY IF EXISTS "quotation_proposals_insert_partner" ON quotation_proposals;
CREATE POLICY "quotation_proposals_insert_partner" ON quotation_proposals
  FOR INSERT WITH CHECK (quotation_proposals.partner_id = auth.uid());

DROP POLICY IF EXISTS "quotation_proposals_update_partner" ON quotation_proposals;
CREATE POLICY "quotation_proposals_update_partner" ON quotation_proposals
  FOR UPDATE USING (quotation_proposals.partner_id = auth.uid());

-- contracts RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contracts_select_involved" ON contracts;
CREATE POLICY "contracts_select_involved" ON contracts
  FOR SELECT USING (
    contracts.partner_id = auth.uid() OR 
    contracts.client_id = auth.uid()
  );

DROP POLICY IF EXISTS "contracts_insert_involved" ON contracts;
CREATE POLICY "contracts_insert_involved" ON contracts
  FOR INSERT WITH CHECK (
    contracts.partner_id = auth.uid() OR 
    contracts.client_id = auth.uid()
  );

-- ============================================
-- 6. 함수
-- ============================================

-- 계약서 번호 자동 생성
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  year TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(contract_number FROM 9) AS INTEGER)), 0) + 1
  INTO next_num
  FROM contracts
  WHERE contract_number LIKE 'CT-' || year || '-%';
  
  RETURN 'CT-' || year || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_contract_number IS '계약서 번호 자동 생성 (CT-YYYY-0001)';

-- ============================================
-- 완료!
-- ============================================
