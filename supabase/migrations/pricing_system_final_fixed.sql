-- ============================================
-- JobsClass: 가격 책정 모델 & 견적 시스템
-- 기존 테이블 구조 100% 반영
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
-- 3. quotation_proposals (견적 제안)
-- quotation_requests에 대한 파트너의 응답
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
  work_items JSONB,
  
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
-- 4. contracts 테이블 인덱스만 추가 (이미 존재함)
-- ============================================
-- 기존 contracts 테이블 사용 (quotation_id 컬럼 사용)
CREATE INDEX IF NOT EXISTS idx_contracts_quotation ON contracts(quotation_id);
CREATE INDEX IF NOT EXISTS idx_contracts_partner ON contracts(partner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- ============================================
-- 5. RLS 정책
-- ============================================

-- quotation_proposals RLS
ALTER TABLE quotation_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quotation_proposals_all" ON quotation_proposals;
CREATE POLICY "quotation_proposals_all" ON quotation_proposals
  FOR ALL USING (
    partner_id = auth.uid() OR 
    request_id IN (SELECT id FROM quotation_requests WHERE client_id = auth.uid())
  );

-- contracts RLS (이미 존재할 수 있으므로 조건부 활성화)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'contracts'
  ) THEN
    ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DROP POLICY IF EXISTS "contracts_all" ON contracts;
CREATE POLICY "contracts_all" ON contracts
  FOR ALL USING (
    partner_id = auth.uid() OR 
    client_id = auth.uid()
  );

-- ============================================
-- 6. 함수
-- ============================================

-- 계약서 번호 자동 생성 (이미 존재할 수 있음)
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
