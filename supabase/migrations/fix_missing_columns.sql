-- ============================================
-- 누락된 컬럼 추가 및 수정
-- ============================================

-- 1. products 테이블에 필요한 컬럼 추가
ALTER TABLE products
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS product_type TEXT,
ADD COLUMN IF NOT EXISTS service_type TEXT;

-- 2. orders 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT,
  payment_key TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  toss_response JSONB,
  refund_reason TEXT,
  refunded_amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- 3. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_products_partner_id ON products(partner_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);

-- 4. RLS 정책
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_policy" ON orders;
CREATE POLICY "orders_select_policy" ON orders
  FOR SELECT USING (buyer_id = auth.uid());

DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
CREATE POLICY "orders_insert_policy" ON orders
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

COMMENT ON TABLE orders IS '주문 테이블';
