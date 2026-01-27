-- ============================================
-- JobsClass: 결제 시스템 (Toss Payments)
-- 실제 테이블 구조 기반 - 최종 수정
-- ============================================

-- ============================================
-- 1. orders 테이블 (주문/결제) - RLS 없이 먼저 생성
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT,
  payment_key TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  toss_response JSONB,
  refund_reason TEXT,
  refunded_amount INTEGER,
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

COMMENT ON TABLE orders IS '서비스 구매 주문 (정액제)';

-- ============================================
-- 2. credit_transactions 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'refund', 'bonus', 'spend')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);

COMMENT ON TABLE credit_transactions IS '크레딧 거래 내역';

-- ============================================
-- 3. payment_transactions 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('service_purchase', 'credit_charge', 'refund')),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KRW',
  payment_key TEXT,
  order_id TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  order_record_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  response_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_partner ON payment_transactions(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_key ON payment_transactions(payment_key);

COMMENT ON TABLE payment_transactions IS '결제 거래 로그';

-- ============================================
-- 4. 이제 RLS 정책 추가 (테이블 생성 후)
-- ============================================

-- orders 테이블 RLS
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

-- credit_transactions 테이블 RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "credit_transactions_select_own" ON credit_transactions;
CREATE POLICY "credit_transactions_select_own" ON credit_transactions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "credit_transactions_insert_system" ON credit_transactions;
CREATE POLICY "credit_transactions_insert_system" ON credit_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- payment_transactions 테이블 RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_transactions_select_own" ON payment_transactions;
CREATE POLICY "payment_transactions_select_own" ON payment_transactions
  FOR SELECT USING (user_id = auth.uid() OR partner_id = auth.uid());

-- ============================================
-- 5. 뷰 및 함수
-- ============================================

-- 파트너 수익 뷰
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

-- 주문 번호 자동 생성 함수
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
