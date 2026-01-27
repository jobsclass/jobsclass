-- ============================================
-- 주문 및 결제 시스템 스키마 (수정본)
-- ============================================

-- 1. customers 테이블 업데이트 (이미 존재하는 테이블)
-- service_id 컬럼이 없다면 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'service_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN service_id UUID REFERENCES services(id) ON DELETE SET NULL;
    CREATE INDEX idx_customers_service_id ON customers(service_id);
  END IF;
  
  -- status 컬럼이 없다면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'status'
  ) THEN
    ALTER TABLE customers ADD COLUMN status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed', 'cancelled'));
    CREATE INDEX idx_customers_status ON customers(status);
  END IF;
  
  -- message 컬럼이 없다면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'message'
  ) THEN
    ALTER TABLE customers ADD COLUMN message TEXT;
  END IF;
  
  -- company 컬럼이 없다면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'company'
  ) THEN
    ALTER TABLE customers ADD COLUMN company TEXT;
  END IF;
END $$;

COMMENT ON COLUMN customers.status IS 'new: 신규, contacted: 연락함, completed: 완료, cancelled: 취소';

-- ============================================

-- 2. 주문 테이블
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE, -- 주문번호 (예: ORD-20260125-001)
  
  -- 관계
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 판매자
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- 구매자 (선택, 비회원 가능)
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE, -- 구매한 서비스
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL, -- 문의 고객과 연결
  
  -- 구매자 정보 (비회원 포함)
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  
  -- 가격 정보
  amount DECIMAL(10, 2) NOT NULL, -- 결제 금액
  currency TEXT NOT NULL DEFAULT 'KRW',
  discount_amount DECIMAL(10, 2) DEFAULT 0, -- 할인 금액
  final_amount DECIMAL(10, 2) NOT NULL, -- 최종 결제 금액
  
  -- 주문 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'cancelled', 'refunded')),
  
  -- 결제 정보
  payment_method TEXT, -- 'card', 'transfer', 'virtual_account', etc.
  payment_id TEXT, -- Toss Payments 결제 ID
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- 메타데이터
  notes TEXT, -- 주문 메모
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_id ON orders(service_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

COMMENT ON TABLE orders IS '주문 관리';
COMMENT ON COLUMN orders.status IS 'pending: 결제대기, paid: 결제완료, completed: 완료, cancelled: 취소, refunded: 환불';

-- ============================================

-- 3. 결제 내역 테이블
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Toss Payments 정보
  payment_key TEXT NOT NULL UNIQUE, -- Toss 결제 키
  transaction_key TEXT, -- 거래 키
  method TEXT NOT NULL, -- 결제 수단
  
  -- 금액 정보
  total_amount DECIMAL(10, 2) NOT NULL,
  vat DECIMAL(10, 2) DEFAULT 0, -- 부가세
  supply_amount DECIMAL(10, 2), -- 공급가액
  
  -- 결제 상태
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'in_progress', 'waiting_for_deposit', 'done', 'cancelled', 'partial_cancelled', 'aborted', 'expired')),
  
  -- 카드 정보 (카드 결제 시)
  card_issuer TEXT, -- 카드사
  card_number TEXT, -- 마스킹된 카드번호
  
  -- 가상계좌 정보 (가상계좌 시)
  virtual_account_bank TEXT,
  virtual_account_number TEXT,
  virtual_account_holder TEXT,
  virtual_account_due_date TIMESTAMP WITH TIME ZONE,
  
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

COMMENT ON TABLE payments IS 'Toss Payments 결제 내역';
COMMENT ON COLUMN payments.status IS 'ready: 준비, done: 완료, cancelled: 취소, expired: 만료';

-- ============================================

-- 4. 구독 정보 테이블 (확장)
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
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- AI 사용량 (월별 리셋)
  ai_images_used INTEGER NOT NULL DEFAULT 0, -- 이번 달 사용한 AI 이미지 수
  ai_copywriting_used INTEGER NOT NULL DEFAULT 0, -- 이번 달 사용한 AI 카피라이팅 수
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 마지막 리셋 시각
  
  -- 결제 정보
  payment_method TEXT, -- 등록된 결제 수단
  billing_key TEXT, -- Toss 자동결제 키
  next_billing_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

COMMENT ON TABLE subscriptions IS '구독 관리 및 AI 사용량 추적';
COMMENT ON COLUMN subscriptions.plan IS 'FREE: 무료 (웹사이트 1개), STARTER: ₩9,900 (웹사이트 3개, AI 제한), PRO: ₩29,900 (웹사이트 10개, AI 무제한)';

-- ============================================

-- 5. 구독 결제 내역 테이블
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 결제 정보
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KRW',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  
  -- 기간
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  
  -- Toss Payments 연동
  payment_id TEXT,
  payment_key TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- 메타데이터
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_invoices_subscription_id ON subscription_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_user_id ON subscription_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_status ON subscription_invoices(status);

COMMENT ON TABLE subscription_invoices IS '구독 결제 내역 (월별)';

-- ============================================

-- 6. AI 사용 내역 테이블 (상세 추적)
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- AI 기능 타입
  feature_type TEXT NOT NULL CHECK (feature_type IN ('image_generation', 'copywriting', 'website_generation')),
  
  -- 비용 정보
  cost_usd DECIMAL(10, 6) NOT NULL, -- 실제 OpenAI 비용 (USD)
  cost_krw DECIMAL(10, 2), -- 원화 환산 비용
  
  -- 메타데이터
  metadata JSONB, -- { "prompt": "...", "model": "dall-e-3", "size": "1024x1024" }
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_feature_type ON ai_usage_logs(feature_type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);

COMMENT ON TABLE ai_usage_logs IS 'AI 기능 사용 내역 추적 (비용 분석용)';

-- ============================================

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- customers 테이블 트리거 (이미 존재할 수 있음)
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

DROP TRIGGER IF EXISTS update_subscription_invoices_updated_at ON subscription_invoices;
CREATE TRIGGER update_subscription_invoices_updated_at BEFORE UPDATE ON subscription_invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================

-- RLS 정책 설정
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Orders 정책
CREATE POLICY "Users can view their own orders as buyer"
  ON orders FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY "Users can view their orders as seller"
  ON orders FOR SELECT
  USING (seller_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sellers can update their orders"
  ON orders FOR UPDATE
  USING (seller_id = auth.uid());

-- Payments 정책
CREATE POLICY "Users can view payments for their orders"
  ON payments FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
    )
  );

CREATE POLICY "System can manage payments"
  ON payments FOR ALL
  USING (true)
  WITH CHECK (true);

-- Subscriptions 정책
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

-- Subscription Invoices 정책
CREATE POLICY "Users can view their own invoices"
  ON subscription_invoices FOR SELECT
  USING (user_id = auth.uid());

-- AI Usage Logs 정책
CREATE POLICY "Users can view their own AI usage"
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
  RAISE NOTICE '✅ 마이그레이션 3 완료!';
  RAISE NOTICE '';
  RAISE NOTICE '업데이트된 테이블:';
  RAISE NOTICE '  - customers (status, service_id, company, message 컬럼 추가)';
  RAISE NOTICE '';
  RAISE NOTICE '생성된 테이블:';
  RAISE NOTICE '  - orders (주문 관리)';
  RAISE NOTICE '  - payments (Toss Payments 결제 내역)';
  RAISE NOTICE '  - subscriptions (구독 관리)';
  RAISE NOTICE '  - subscription_invoices (구독 결제 내역)';
  RAISE NOTICE '  - ai_usage_logs (AI 사용 내역)';
  RAISE NOTICE '';
  RAISE NOTICE '다음 단계: Vercel 배포 및 환경 변수 설정';
END $$;
