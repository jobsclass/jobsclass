-- ============================================
-- JobsClass MVP 통합 마이그레이션
-- 작성일: 2025-01-27
-- 목적: 런칭을 위한 필수 기능 DB 구조 완성
-- ============================================
-- 
-- 실행 순서:
-- 1. ENUM 타입 생성
-- 2. products 테이블 확장 (가격 모델)
-- 3. 견적/계약 테이블 생성
-- 4. 결제/크레딧 테이블 생성
-- 5. 인덱스 및 최적화
-- 6. RLS 정책 추가
-- 7. 뷰 및 함수 생성
--
-- ============================================

-- ============================================
-- SECTION 1: ENUM 타입 생성
-- ============================================

-- 1.1 service_type ENUM (10가지 서비스 타입)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
    CREATE TYPE service_type AS ENUM (
      'online_course',          -- 온라인 강의
      'one_on_one_mentoring',   -- 1:1 멘토링
      'group_coaching',         -- 그룹 코칭
      'digital_product',        -- 디지털 콘텐츠
      'project_service',        -- 프로젝트 대행
      'consulting',             -- 컨설팅
      'agency_service',         -- 대행 서비스
      'premium_membership',     -- 프리미엄 멤버십
      'live_workshop',          -- 라이브 워크샵
      'promotion_service'       -- 홍보/마케팅 서비스
    );
  END IF;
END $$;

-- 1.2 pricing_model ENUM (가격 모델)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_model') THEN
    CREATE TYPE pricing_model AS ENUM (
      'fixed',           -- 정액제 (즉시 구매)
      'negotiable'       -- 협의제 (견적 필요)
    );
  END IF;
END $$;

COMMENT ON TYPE service_type IS '10가지 서비스 타입';
COMMENT ON TYPE pricing_model IS '가격 책정 모델: fixed(정액제) 또는 negotiable(협의)';

-- ============================================
-- SECTION 2: products 테이블 확장
-- ============================================

-- 2.1 기존 products 테이블에 컬럼 추가
ALTER TABLE products
ADD COLUMN IF NOT EXISTS pricing_model pricing_model DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS base_price INTEGER,
ADD COLUMN IF NOT EXISTS price_range_min INTEGER,
ADD COLUMN IF NOT EXISTS price_range_max INTEGER,
ADD COLUMN IF NOT EXISTS consultation_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_quotation BOOLEAN DEFAULT false;

COMMENT ON COLUMN products.pricing_model IS '가격 책정 모델: fixed(정액제) 또는 negotiable(협의)';
COMMENT ON COLUMN products.base_price IS '협의형 서비스의 시작 가격 (참고용)';
COMMENT ON COLUMN products.price_range_min IS '최소 가격 (협의 시 참고)';
COMMENT ON COLUMN products.price_range_max IS '최대 가격 (협의 시 참고)';
COMMENT ON COLUMN products.consultation_required IS '상담 필수 여부';
COMMENT ON COLUMN products.custom_quotation IS '맞춤 견적 제공 여부';

-- ============================================
-- SECTION 3: 견적/계약 테이블 생성
-- ============================================

-- 3.1 quotation_requests (견적 요청)
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

COMMENT ON TABLE quotation_requests IS '견적 요청 (협의형 서비스용)';

-- 3.2 quotations (견적서)
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

COMMENT ON TABLE quotations IS '견적서 (파트너가 작성)';

-- 3.3 contracts (계약)
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

COMMENT ON TABLE contracts IS '계약서 (견적 승인 후 생성)';

-- ============================================
-- SECTION 4: 결제/크레딧 테이블 생성
-- ============================================

-- 4.1 orders (주문/결제)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- 금액
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KRW',
  
  -- 결제 정보
  payment_method TEXT,
  payment_key TEXT UNIQUE,
  
  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  
  -- Toss Payments 응답
  toss_response JSONB,
  
  -- 환불 정보
  refund_reason TEXT,
  refunded_amount INTEGER,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_key ON orders(payment_key);

COMMENT ON TABLE orders IS '서비스 구매 주문 (정액제)';

-- 4.2 credit_transactions (크레딧 거래 내역)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 거래 유형
  type TEXT NOT NULL CHECK (type IN ('purchase', 'refund', 'bonus', 'spend')),
  
  -- 금액
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  
  -- 설명
  description TEXT,
  
  -- 관련 주문
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- 메타데이터
  metadata JSONB,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);

COMMENT ON TABLE credit_transactions IS '크레딧 거래 내역';

-- 4.3 payment_transactions (결제 거래 로그)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- 거래 유형
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('service_purchase', 'credit_charge', 'refund')),
  
  -- 금액
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KRW',
  
  -- 결제 정보
  payment_key TEXT,
  order_id TEXT,
  
  -- 관련 정보
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  order_record_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- 응답 데이터
  response_data JSONB,
  error_message TEXT,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_partner ON payment_transactions(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_key ON payment_transactions(payment_key);

COMMENT ON TABLE payment_transactions IS '결제 거래 로그 (모든 결제 추적)';

-- ============================================
-- SECTION 5: 인덱스 및 최적화
-- ============================================

-- 5.1 products 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_products_service_type ON products(service_type);
CREATE INDEX IF NOT EXISTS idx_products_pricing_model ON products(pricing_model);
CREATE INDEX IF NOT EXISTS idx_products_created_at_desc ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_user_published ON products(user_id, is_published);
CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(price) WHERE price IS NOT NULL;

-- 5.2 전문 검색 인덱스 (Full-text search)
CREATE INDEX IF NOT EXISTS idx_products_search ON products 
USING gin(to_tsvector('simple', COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- 5.3 updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- products 테이블 트리거
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- quotation_requests 테이블 트리거
DROP TRIGGER IF EXISTS update_quotation_requests_updated_at ON quotation_requests;
CREATE TRIGGER update_quotation_requests_updated_at
  BEFORE UPDATE ON quotation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SECTION 6: RLS 정책
-- ============================================

-- 6.1 products 테이블 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 published 서비스 조회 가능
DROP POLICY IF EXISTS "products_select_published" ON products;
CREATE POLICY "products_select_published" ON products
  FOR SELECT USING (is_published = true);

-- 파트너는 자신의 서비스 모두 조회 가능
DROP POLICY IF EXISTS "products_select_own" ON products;
CREATE POLICY "products_select_own" ON products
  FOR SELECT USING (user_id = auth.uid());

-- 파트너는 자신의 서비스 생성 가능
DROP POLICY IF EXISTS "products_insert_own" ON products;
CREATE POLICY "products_insert_own" ON products
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 파트너는 자신의 서비스 수정 가능
DROP POLICY IF EXISTS "products_update_own" ON products;
CREATE POLICY "products_update_own" ON products
  FOR UPDATE USING (user_id = auth.uid());

-- 파트너는 자신의 서비스 삭제 가능
DROP POLICY IF EXISTS "products_delete_own" ON products;
CREATE POLICY "products_delete_own" ON products
  FOR DELETE USING (user_id = auth.uid());

-- 6.2 quotation_requests RLS
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

-- 6.3 quotations RLS
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

-- 6.4 contracts RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contracts_select_involved" ON contracts;
CREATE POLICY "contracts_select_involved" ON contracts
  FOR SELECT USING (partner_id = auth.uid() OR client_id = auth.uid());

-- 6.5 orders RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_policy" ON orders;
CREATE POLICY "orders_select_policy" ON orders
  FOR SELECT USING (
    buyer_id = auth.uid() OR 
    product_id IN (SELECT id FROM products WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
CREATE POLICY "orders_insert_policy" ON orders
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- 6.6 credit_transactions RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "credit_transactions_select_own" ON credit_transactions;
CREATE POLICY "credit_transactions_select_own" ON credit_transactions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "credit_transactions_insert_system" ON credit_transactions;
CREATE POLICY "credit_transactions_insert_system" ON credit_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 6.7 payment_transactions RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_transactions_select_own" ON payment_transactions;
CREATE POLICY "payment_transactions_select_own" ON payment_transactions
  FOR SELECT USING (user_id = auth.uid() OR partner_id = auth.uid());

-- ============================================
-- SECTION 7: 뷰 및 함수
-- ============================================

-- 7.1 서비스 검색 함수
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT DEFAULT NULL,
  filter_service_type TEXT DEFAULT NULL,
  filter_is_published BOOLEAN DEFAULT TRUE,
  min_price INTEGER DEFAULT NULL,
  max_price INTEGER DEFAULT NULL,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'DESC',
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  price INTEGER,
  service_type TEXT,
  is_published BOOLEAN,
  view_count INTEGER,
  purchase_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.title,
    p.description,
    p.price,
    p.service_type::TEXT,
    p.is_published,
    p.view_count,
    p.purchase_count,
    p.created_at
  FROM products p
  WHERE 
    (filter_is_published IS NULL OR p.is_published = filter_is_published)
    AND (filter_service_type IS NULL OR p.service_type::TEXT = filter_service_type)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (
      search_query IS NULL OR
      to_tsvector('simple', COALESCE(p.title, '') || ' ' || COALESCE(p.description, ''))
      @@ plainto_tsquery('simple', search_query)
    )
  ORDER BY
    CASE WHEN sort_by = 'created_at' AND sort_order = 'DESC' THEN p.created_at END DESC,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'ASC' THEN p.created_at END ASC,
    CASE WHEN sort_by = 'price' AND sort_order = 'DESC' THEN p.price END DESC,
    CASE WHEN sort_by = 'price' AND sort_order = 'ASC' THEN p.price END ASC,
    CASE WHEN sort_by = 'view_count' AND sort_order = 'DESC' THEN p.view_count END DESC,
    CASE WHEN sort_by = 'purchase_count' AND sort_order = 'DESC' THEN p.purchase_count END DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_products IS '서비스 검색 및 필터링 함수';

-- 7.2 파트너 수익 뷰
CREATE OR REPLACE VIEW partner_earnings_view AS
SELECT 
  p.user_id as partner_id,
  up.display_name as partner_name,
  COUNT(DISTINCT p.id) as total_products,
  SUM(p.view_count) as total_views,
  SUM(p.purchase_count) as total_purchases,
  COALESCE(SUM(p.price * p.purchase_count), 0) as estimated_revenue
FROM products p
JOIN user_profiles up ON p.user_id = up.user_id
WHERE p.is_published = true
GROUP BY p.user_id, up.display_name;

COMMENT ON VIEW partner_earnings_view IS '파트너별 수익 통계';

-- 7.3 파트너 결제 수익 요약 뷰
CREATE OR REPLACE VIEW partner_earnings_summary AS
SELECT 
  pt.partner_id,
  up.display_name as partner_name,
  COUNT(*) as total_transactions,
  SUM(CASE WHEN pt.status = 'completed' THEN pt.amount ELSE 0 END) as total_earnings,
  SUM(CASE WHEN pt.status = 'completed' AND pt.created_at >= NOW() - INTERVAL '30 days' 
      THEN pt.amount ELSE 0 END) as earnings_last_30_days,
  SUM(CASE WHEN pt.status = 'completed' AND pt.created_at >= NOW() - INTERVAL '7 days' 
      THEN pt.amount ELSE 0 END) as earnings_last_7_days
FROM payment_transactions pt
JOIN user_profiles up ON pt.partner_id = up.user_id
WHERE pt.transaction_type = 'service_purchase'
GROUP BY pt.partner_id, up.display_name;

COMMENT ON VIEW partner_earnings_summary IS '파트너 결제 수익 요약';

-- 7.4 자동 번호 생성 함수들
-- 견적서 번호
DROP FUNCTION IF EXISTS generate_quotation_number();
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

COMMENT ON FUNCTION generate_quotation_number IS '견적서 번호 자동 생성 (QT-YYYY-0001)';

-- 계약서 번호
DROP FUNCTION IF EXISTS generate_contract_number();
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

-- 주문 번호
DROP FUNCTION IF EXISTS generate_order_number();
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  prefix TEXT;
BEGIN
  prefix := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM LENGTH(prefix) + 1) AS INTEGER)), 0) + 1
  INTO next_num
  FROM orders
  WHERE order_number LIKE prefix || '%';
  
  RETURN prefix || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_order_number IS '주문 번호 자동 생성 (ORD-YYYYMMDD-000001)';

-- ============================================
-- 완료!
-- ============================================

-- 마이그레이션 완료 확인
DO $$
BEGIN
  RAISE NOTICE '✅ JobsClass MVP 통합 마이그레이션 완료!';
  RAISE NOTICE '📊 생성된 테이블:';
  RAISE NOTICE '  - products (확장됨)';
  RAISE NOTICE '  - quotation_requests';
  RAISE NOTICE '  - quotations';
  RAISE NOTICE '  - contracts';
  RAISE NOTICE '  - orders';
  RAISE NOTICE '  - credit_transactions';
  RAISE NOTICE '  - payment_transactions';
  RAISE NOTICE '🔒 RLS 정책 적용됨';
  RAISE NOTICE '📈 검색 함수 및 뷰 생성됨';
  RAISE NOTICE '✨ 런칭 준비 완료!';
END $$;
