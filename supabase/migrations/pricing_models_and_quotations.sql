-- ============================================
-- JobsClass: 가격 책정 모델 & 견적 시스템
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
ADD COLUMN IF NOT EXISTS base_price INTEGER, -- 시작 가격 (협의형의 경우 참고용)
ADD COLUMN IF NOT EXISTS price_range_min INTEGER, -- 최소 가격
ADD COLUMN IF NOT EXISTS price_range_max INTEGER, -- 최대 가격
ADD COLUMN IF NOT EXISTS consultation_required BOOLEAN DEFAULT false, -- 상담 필수 여부
ADD COLUMN IF NOT EXISTS custom_quotation BOOLEAN DEFAULT false; -- 맞춤 견적 제공 여부

-- price 컬럼 nullable로 변경 (협의형의 경우 null 가능)
ALTER TABLE products ALTER COLUMN price DROP NOT NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_products_pricing_model ON products(pricing_model);

COMMENT ON COLUMN products.pricing_model IS '가격 책정 모델: fixed(정액제) 또는 negotiable(협의)';
COMMENT ON COLUMN products.base_price IS '협의형 서비스의 시작 가격 (참고용)';
COMMENT ON COLUMN products.price_range_min IS '최소 가격 (협의 시 참고)';
COMMENT ON COLUMN products.price_range_max IS '최대 가격 (협의 시 참고)';

-- ============================================
-- 3. quotation_requests (견적 요청)
-- ============================================
CREATE TABLE IF NOT EXISTS quotation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 프로젝트 정보
  project_title TEXT NOT NULL,
  project_description TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  deadline DATE,
  
  -- 요구사항 (JSON 형태로 유연하게 저장)
  requirements JSONB DEFAULT '[]'::jsonb,
  reference_urls JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- 연락 선호도
  contact_preference TEXT DEFAULT 'message', -- message/email/phone
  
  -- 상태
  status TEXT DEFAULT 'pending', -- pending/quoted/accepted/rejected/cancelled
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_quotation_requests_product ON quotation_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_client ON quotation_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_status ON quotation_requests(status);

-- RLS 정책
ALTER TABLE quotation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quotation_requests_select_policy" ON quotation_requests;
CREATE POLICY "quotation_requests_select_policy" ON quotation_requests
  FOR SELECT USING (
    client_id = auth.uid() OR 
    product_id IN (SELECT id FROM products WHERE partner_id = auth.uid())
  );

DROP POLICY IF EXISTS "quotation_requests_insert_policy" ON quotation_requests;
CREATE POLICY "quotation_requests_insert_policy" ON quotation_requests
  FOR INSERT WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "quotation_requests_update_policy" ON quotation_requests;
CREATE POLICY "quotation_requests_update_policy" ON quotation_requests
  FOR UPDATE USING (client_id = auth.uid());

-- ============================================
-- 4. quotations (견적서)
-- ============================================
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES quotation_requests(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 견적 정보
  quotation_number TEXT UNIQUE, -- QT-2024-0001 형식
  total_price INTEGER NOT NULL,
  
  -- 상세 항목 (JSON 배열)
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- 예시: [{ category: "기본 개발", items: [{ name: "...", price: 100000 }] }]
  
  -- 일정
  timeline JSONB,
  -- 예시: { planning: "1주", development: "6주", testing: "1주", total: "8주" }
  
  -- 조건
  terms JSONB,
  -- 예시: { payment_schedule: [...], revisions: 2, warranty: "3개월" }
  
  -- 유효기간
  valid_until DATE,
  
  -- 상태
  status TEXT DEFAULT 'pending', -- pending/accepted/rejected/expired
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

-- 견적서 번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TRIGGER AS $$
DECLARE
  year TEXT;
  seq_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  
  -- 해당 연도의 견적서 수 계산
  SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0')
  INTO seq_num
  FROM quotations
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  NEW.quotation_number := 'QT-' || year || '-' || seq_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_quotation_number ON quotations;
CREATE TRIGGER trigger_generate_quotation_number
  BEFORE INSERT ON quotations
  FOR EACH ROW
  WHEN (NEW.quotation_number IS NULL)
  EXECUTE FUNCTION generate_quotation_number();

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_quotations_request ON quotations(request_id);
CREATE INDEX IF NOT EXISTS idx_quotations_partner ON quotations(partner_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);

-- RLS 정책
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quotations_select_policy" ON quotations;
CREATE POLICY "quotations_select_policy" ON quotations
  FOR SELECT USING (
    partner_id = auth.uid() OR
    request_id IN (SELECT id FROM quotation_requests WHERE client_id = auth.uid())
  );

DROP POLICY IF EXISTS "quotations_insert_policy" ON quotations;
CREATE POLICY "quotations_insert_policy" ON quotations
  FOR INSERT WITH CHECK (partner_id = auth.uid());

DROP POLICY IF EXISTS "quotations_update_policy" ON quotations;
CREATE POLICY "quotations_update_policy" ON quotations
  FOR UPDATE USING (partner_id = auth.uid());

-- ============================================
-- 5. quotation_messages (견적 협의 메시지)
-- ============================================
CREATE TABLE IF NOT EXISTS quotation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_quotation_messages_quotation ON quotation_messages(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_messages_created ON quotation_messages(created_at);

-- RLS 정책
ALTER TABLE quotation_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quotation_messages_select_policy" ON quotation_messages;
CREATE POLICY "quotation_messages_select_policy" ON quotation_messages
  FOR SELECT USING (
    sender_id = auth.uid() OR
    quotation_id IN (
      SELECT q.id FROM quotations q
      JOIN quotation_requests qr ON q.request_id = qr.id
      WHERE q.partner_id = auth.uid() OR qr.client_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "quotation_messages_insert_policy" ON quotation_messages;
CREATE POLICY "quotation_messages_insert_policy" ON quotation_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- ============================================
-- 6. contracts (계약서)
-- ============================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE RESTRICT,
  client_id UUID REFERENCES user_profiles(id) ON DELETE RESTRICT,
  partner_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- 계약 정보
  contract_number TEXT UNIQUE, -- CT-2024-0001 형식
  agreed_price INTEGER NOT NULL,
  
  -- 결제 일정 (단계별)
  payment_schedule JSONB NOT NULL,
  -- 예시: [{ stage: "계약금", percentage: 30, amount: 1350000 }]
  
  -- 납품물
  deliverables JSONB NOT NULL,
  
  -- 약관
  terms_and_conditions TEXT,
  
  -- 서명
  client_signed_at TIMESTAMPTZ,
  partner_signed_at TIMESTAMPTZ,
  
  -- 상태
  status TEXT DEFAULT 'draft', -- draft/active/completed/cancelled/disputed
  
  -- 시작/완료 일자
  start_date DATE,
  end_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 계약서 번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
DECLARE
  year TEXT;
  seq_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  
  SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0')
  INTO seq_num
  FROM contracts
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  NEW.contract_number := 'CT-' || year || '-' || seq_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_contract_number ON contracts;
CREATE TRIGGER trigger_generate_contract_number
  BEFORE INSERT ON contracts
  FOR EACH ROW
  WHEN (NEW.contract_number IS NULL)
  EXECUTE FUNCTION generate_contract_number();

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_contracts_quotation ON contracts(quotation_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_partner ON contracts(partner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- RLS 정책
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contracts_select_policy" ON contracts;
CREATE POLICY "contracts_select_policy" ON contracts
  FOR SELECT USING (client_id = auth.uid() OR partner_id = auth.uid());

DROP POLICY IF EXISTS "contracts_insert_policy" ON contracts;
CREATE POLICY "contracts_insert_policy" ON contracts
  FOR INSERT WITH CHECK (client_id = auth.uid() OR partner_id = auth.uid());

DROP POLICY IF EXISTS "contracts_update_policy" ON contracts;
CREATE POLICY "contracts_update_policy" ON contracts
  FOR UPDATE USING (client_id = auth.uid() OR partner_id = auth.uid());

-- ============================================
-- 7. project_milestones (마일스톤)
-- ============================================
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  
  -- 마일스톤 정보
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  
  -- 진행률
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- 상태
  status TEXT DEFAULT 'pending', -- pending/in_progress/completed/overdue
  
  -- 완료 시간
  completed_at TIMESTAMPTZ,
  
  -- 정렬 순서
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_milestones_contract ON project_milestones(contract_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON project_milestones(status);

-- RLS 정책
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "milestones_select_policy" ON project_milestones;
CREATE POLICY "milestones_select_policy" ON project_milestones
  FOR SELECT USING (
    contract_id IN (
      SELECT id FROM contracts WHERE client_id = auth.uid() OR partner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "milestones_insert_policy" ON project_milestones;
CREATE POLICY "milestones_insert_policy" ON project_milestones
  FOR INSERT WITH CHECK (
    contract_id IN (SELECT id FROM contracts WHERE partner_id = auth.uid())
  );

DROP POLICY IF EXISTS "milestones_update_policy" ON project_milestones;
CREATE POLICY "milestones_update_policy" ON project_milestones
  FOR UPDATE USING (
    contract_id IN (SELECT id FROM contracts WHERE partner_id = auth.uid())
  );

-- ============================================
-- 8. deliveries (납품)
-- ============================================
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
  
  -- 납품 정보
  title TEXT NOT NULL,
  description TEXT,
  files JSONB DEFAULT '[]'::jsonb, -- 파일 URL 배열
  
  -- 제출 시간
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  review_deadline TIMESTAMPTZ,
  
  -- 검수 상태
  status TEXT DEFAULT 'pending_review', -- pending_review/revision_requested/approved
  review_feedback TEXT,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_deliveries_contract ON deliveries(contract_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_milestone ON deliveries(milestone_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

-- RLS 정책
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deliveries_select_policy" ON deliveries;
CREATE POLICY "deliveries_select_policy" ON deliveries
  FOR SELECT USING (
    contract_id IN (
      SELECT id FROM contracts WHERE client_id = auth.uid() OR partner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "deliveries_insert_policy" ON deliveries;
CREATE POLICY "deliveries_insert_policy" ON deliveries
  FOR INSERT WITH CHECK (
    contract_id IN (SELECT id FROM contracts WHERE partner_id = auth.uid())
  );

DROP POLICY IF EXISTS "deliveries_update_policy" ON deliveries;
CREATE POLICY "deliveries_update_policy" ON deliveries
  FOR UPDATE USING (
    contract_id IN (SELECT id FROM contracts WHERE client_id = auth.uid() OR partner_id = auth.uid())
  );

-- ============================================
-- 9. 트리거: updated_at 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_quotation_requests_updated_at ON quotation_requests;
CREATE TRIGGER trigger_quotation_requests_updated_at
  BEFORE UPDATE ON quotation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_quotations_updated_at ON quotations;
CREATE TRIGGER trigger_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_contracts_updated_at ON contracts;
CREATE TRIGGER trigger_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_milestones_updated_at ON project_milestones;
CREATE TRIGGER trigger_milestones_updated_at
  BEFORE UPDATE ON project_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 완료!
-- ============================================
