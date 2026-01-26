-- ============================================
-- 주문 및 결제 시스템 스키마 (v2 - 최종 수정본)
-- ============================================

-- 1. customers 테이블 업데이트 (이미 존재하는 테이블)
DO $$ 
BEGIN
  -- service_id 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'service_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN service_id UUID REFERENCES services(id) ON DELETE SET NULL;
    CREATE INDEX idx_customers_service_id ON customers(service_id);
  END IF;
  
  -- status 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'status'
  ) THEN
    ALTER TABLE customers ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
    CREATE INDEX idx_customers_status ON customers(status);
  END IF;
  
  -- status 제약조건 추가
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'customers_status_check'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_status_check 
      CHECK (status IN ('new', 'contacted', 'completed', 'cancelled'));
  END IF;
  
  -- message 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'message'
  ) THEN
    ALTER TABLE customers ADD COLUMN message TEXT;
  END IF;
  
  -- company 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'company'
  ) THEN
    ALTER TABLE customers ADD COLUMN company TEXT;
  END IF;
END $$;

-- ============================================

-- 2. 주문 테이블
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  
  -- 관계 (user_id = 판매자)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- 구매자 정보
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  
  -- 가격 정보
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KRW',
  
  -- 주문 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'cancelled', 'refunded')),
  
  -- 결제 정보
  payment_method TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- 메타데이터
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_id ON orders(service_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================

-- 3. 결제 내역 테이블
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Toss Payments 정보
  payment_key TEXT NOT NULL UNIQUE,
  method TEXT NOT NULL,
  
  -- 금액 정보
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- 결제 상태
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'in_progress', 'waiting_for_deposit', 'done', 'cancelled', 'partial_cancelled', 'aborted', 'expired')),
  
  -- 타임스탬프
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- 원본 응답 저장
  raw_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_key ON payments(payment_key);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================

-- 4. 구독 정보 테이블
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 플랜 정보
  plan TEXT NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'STARTER', 'PRO')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  
  -- 가격 정보
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KRW',
  
  -- 구독 기간
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- AI 사용량 (월별 리셋)
  ai_images_used INTEGER NOT NULL DEFAULT 0,
  ai_copywriting_used INTEGER NOT NULL DEFAULT 0,
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 결제 정보
  billing_key TEXT,
  next_billing_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================

-- 5. AI 사용 내역 테이블
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- AI 기능 타입
  feature_type TEXT NOT NULL CHECK (feature_type IN ('image_generation', 'copywriting', 'website_generation')),
  
  -- 비용 정보
  cost_usd DECIMAL(10, 6) NOT NULL,
  cost_krw DECIMAL(10, 2),
  
  -- 메타데이터
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_feature_type ON ai_usage_logs(feature_type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);

-- ============================================

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================

-- RLS 정책 설정
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Orders 정책 (기존 정책 삭제 후 재생성)
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their orders as seller" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders as buyer" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Sellers can update their orders" ON orders;

CREATE POLICY "Users can view their orders"
  ON orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their orders"
  ON orders FOR UPDATE
  USING (user_id = auth.uid());

-- Payments 정책
DROP POLICY IF EXISTS "Users can view payments for their orders" ON payments;
DROP POLICY IF EXISTS "System can manage payments" ON payments;

CREATE POLICY "Users can view their payments"
  ON payments FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage payments"
  ON payments FOR ALL
  USING (true)
  WITH CHECK (true);

-- Subscriptions 정책
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "System can create subscriptions" ON subscriptions;

CREATE POLICY "Users can view their subscription"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their subscription"
  ON subscriptions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

-- AI Usage Logs 정책
DROP POLICY IF EXISTS "Users can view their own AI usage" ON ai_usage_logs;
DROP POLICY IF EXISTS "System can log AI usage" ON ai_usage_logs;

CREATE POLICY "Users can view their AI usage"
  ON ai_usage_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can log AI usage"
  ON ai_usage_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 완료 메시지
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ 마이그레이션 3 완료! (v2)';
  RAISE NOTICE '';
  RAISE NOTICE '업데이트된 테이블:';
  RAISE NOTICE '  - customers (status, service_id, company, message 추가)';
  RAISE NOTICE '';
  RAISE NOTICE '생성된 테이블:';
  RAISE NOTICE '  - orders (주문 관리 - user_id 사용)';
  RAISE NOTICE '  - payments (결제 내역)';
  RAISE NOTICE '  - subscriptions (구독 관리)';
  RAISE NOTICE '  - ai_usage_logs (AI 사용 로그)';
  RAISE NOTICE '';
  RAISE NOTICE '주요 변경사항:';
  RAISE NOTICE '  - orders.seller_id → orders.user_id로 변경';
  RAISE NOTICE '  - orders.buyer_id 제거 (비회원 주문 지원)';
  RAISE NOTICE '  - 간소화된 스키마로 복잡도 감소';
END $$;
