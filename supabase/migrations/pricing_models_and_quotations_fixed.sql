-- ============================================
-- JobsClass: 가격 책정 모델 & 견적 시스템
-- 실제 테이블 구조 기반 수정
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
-- 3. quotation_requests (견적 요청)
-- user_id 사용 (partner_id 대신)
-- ============================================
CREATE TABLE IF NOT EXISTS quotation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 프로젝트 정보
  project_title TEXT NOT NULL,
  project_description TEXT NOT NULL,
  budget_range TEXT,
  timeline TEXT,
  requirements JSONB,
  
  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'cancelled')),
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotation_requests_product ON quotation_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_client ON quotation_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_status ON quotation_requests(status);

-- RLS
ALTER TABLE quotation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quotation_requests_select_own" ON quotation_requests;
CREATE POLICY "quotation_requests_select_own" ON quotation_requests
  FOR SELECT USING (
    client_id = auth.uid() OR 
    product_id IN (SELECT id FROM products WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "quotation_requests_insert_own" ON quotation_requests;
CREATE POLICY "quotation_requests_insert_own" ON quotation_requests
  FOR INSERT WITH CHECK (client_id = auth.uid());

COMMENT ON TABLE quotation_requests IS '견적 요청 (협의형 서비스)';

-- ============================================
-- 4. quotations (견적서)
-- ============================================
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_request_id UUID REFERENCES quotation_requests(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 견적 정보
  quotation_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KRW',
  
  -- 작업 항목
  items JSONB, -- [{name, description, amount, quantity}]
  
  -- 일정
  estimated_duration TEXT,
  delivery_date DATE,
  
  -- 조건
  terms_and_conditions TEXT,
  payment_terms TEXT,
  
  -- 상태
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  
  -- 유효기간
  valid_until DATE,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quotations_request ON quotations(quotation_request_id);
CREATE INDEX IF NOT EXISTS idx_quotations_partner ON quotations(partner_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);

-- 견적서 번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  year TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(quotation_number FROM 9) AS INTEGER)), 0) + 1
  INTO next_num
  FROM quotations
  WHERE quotation_number LIKE 'QT-' || year || '-%';
  
  RETURN 'QT-' || year || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quotations_select_involved" ON quotations;
CREATE POLICY "quotations_select_involved" ON quotations
  FOR SELECT USING (
    partner_id = auth.uid() OR 
    quotation_request_id IN (SELECT id FROM quotation_requests WHERE client_id = auth.uid())
  );

DROP POLICY IF EXISTS "quotations_insert_partner" ON quotations;
CREATE POLICY "quotations_insert_partner" ON quotations
  FOR INSERT WITH CHECK (partner_id = auth.uid());

DROP POLICY IF EXISTS "quotations_update_partner" ON quotations;
CREATE POLICY "quotations_update_partner" ON quotations
  FOR UPDATE USING (partner_id = auth.uid());

COMMENT ON TABLE quotations IS '견적서 (파트너가 작성)';

-- ============================================
-- 5. contracts (계약)
-- ============================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE RESTRICT,
  partner_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  client_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  
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

CREATE INDEX IF NOT EXISTS idx_contracts_quotation ON contracts(quotation_id);
CREATE INDEX IF NOT EXISTS idx_contracts_partner ON contracts(partner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

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

-- RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contracts_select_involved" ON contracts;
CREATE POLICY "contracts_select_involved" ON contracts
  FOR SELECT USING (partner_id = auth.uid() OR client_id = auth.uid());

COMMENT ON TABLE contracts IS '계약서 (견적 승인 후 생성)';
