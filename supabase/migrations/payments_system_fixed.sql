-- ============================================
-- JobsClass: 결제 시스템 (Toss Payments)
-- 실제 테이블 구조 기반
-- ============================================

-- ============================================
-- 1. orders 테이블 (주문/결제)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  
  -- 구매자 (user_profiles의 user_id 사용)
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- 상품 (정액제 서비스)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- 결제 정보
  amount INTEGER NOT NULL,
  payment_method TEXT,          -- card/transfer/virtual_account/mobile
  payment_key TEXT UNIQUE,      -- Toss에서 제공하는 고유 키
  
  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  
  -- Toss 응답 원본 저장
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

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_key ON orders(payment_key);

-- RLS 정책
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

COMMENT ON TABLE orders IS '서비스 구매 주문 (정액제)';

-- ============================================
-- 2. credit_transactions 테이블 (크레딧 거래 내역)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 거래 정보
  type TEXT NOT NULL CHECK (type IN ('purchase', 'refund', 'bonus', 'spend')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  
  -- 설명
  description TEXT,
  
  -- 관련 주문 (크레딧 구매인 경우)
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- 메타데이터
  metadata JSONB,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);

-- RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "credit_transactions_select_own" ON credit_transactions;
CREATE POLICY "credit_transactions_select_own" ON credit_transactions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "credit_transactions_insert_system" ON credit_transactions;
CREATE POLICY "credit_transactions_insert_system" ON credit_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

COMMENT ON TABLE credit_transactions IS '크레딧 거래 내역';

-- ============================================
-- 3. payment_transactions 테이블 (결제 거래 로그)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 사용자
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- 거래 정보
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('service_purchase', 'credit_charge', 'refund')),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KRW',
  
  -- Toss Payments 정보
  payment_key TEXT,
  order_id TEXT,
  
  -- 관련 레코드
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

-- RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_transactions_select_own" ON payment_transactions;
CREATE POLICY "payment_transactions_select_own" ON payment_transactions
  FOR SELECT USING (
    user_id = auth.uid() OR 
    partner_id = auth.uid()
  );

COMMENT ON TABLE payment_transactions IS '결제 거래 로그';

-- ============================================
-- 4. 파트너 수익 뷰
-- ============================================
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

COMMENT ON VIEW partner_earnings_summary IS '파트너 수익 요약';

-- ============================================
-- 5. 주문 번호 자동 생성 함수
-- ============================================
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
