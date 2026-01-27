-- ============================================
-- JobsClass: 결제 시스템 (Toss Payments)
-- ============================================

-- ============================================
-- 0. 필요한 컬럼 먼저 추가
-- ============================================
ALTER TABLE products
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- 1. orders 테이블 (주문/결제)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  
  -- 구매자
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- 상품 (정액제 서비스)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- 결제 정보
  amount INTEGER NOT NULL,
  payment_method TEXT,          -- card/transfer/virtual_account/mobile
  payment_key TEXT UNIQUE,      -- Toss에서 제공하는 고유 키
  
  -- 상태
  status TEXT DEFAULT 'pending', -- pending/paid/cancelled/refunded
  
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
  FOR SELECT USING (buyer_id = auth.uid());

DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
CREATE POLICY "orders_insert_policy" ON orders
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

COMMENT ON TABLE orders IS '서비스 구매 주문 (정액제)';

-- ============================================
-- 2. credit_transactions 테이블 (크레딧 거래 내역)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- 거래 타입
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  
  -- 크레딧 변동
  amount INTEGER NOT NULL,          -- 변동 크레딧 (+ 또는 -)
  balance_before INTEGER NOT NULL,  -- 거래 전 잔액
  balance_after INTEGER NOT NULL,   -- 거래 후 잔액
  
  -- 연결된 항목
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,      -- 크레딧 구매 시
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL, -- 제안 사용 시
  
  -- 설명
  description TEXT,
  
  -- 메타데이터
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at DESC);

-- RLS 정책
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "credit_transactions_select_policy" ON credit_transactions;
CREATE POLICY "credit_transactions_select_policy" ON credit_transactions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "credit_transactions_insert_policy" ON credit_transactions;
CREATE POLICY "credit_transactions_insert_policy" ON credit_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

COMMENT ON TABLE credit_transactions IS '크레딧 거래 내역';

-- ============================================
-- 3. 크레딧 충전 함수
-- ============================================
CREATE OR REPLACE FUNCTION charge_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_order_id UUID,
  p_description TEXT DEFAULT '크레딧 충전'
)
RETURNS void AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- 현재 잔액 조회
  SELECT COALESCE(credits, 0) INTO current_balance
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- 새 잔액 계산
  new_balance := current_balance + p_amount;
  
  -- user_profiles 업데이트
  UPDATE user_profiles
  SET credits = new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- 거래 내역 기록
  INSERT INTO credit_transactions (
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    order_id,
    description
  ) VALUES (
    p_user_id,
    'purchase',
    p_amount,
    current_balance,
    new_balance,
    p_order_id,
    p_description
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION charge_credits IS '크레딧 충전 (결제 완료 후 호출)';

-- ============================================
-- 4. 크레딧 사용 함수
-- ============================================
CREATE OR REPLACE FUNCTION use_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_proposal_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT '크레딧 사용'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- 현재 잔액 조회
  SELECT COALESCE(credits, 0) INTO current_balance
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- 잔액 부족 체크
  IF current_balance < p_amount THEN
    RAISE EXCEPTION '크레딧이 부족합니다. (현재: %, 필요: %)', current_balance, p_amount;
    RETURN FALSE;
  END IF;
  
  -- 새 잔액 계산
  new_balance := current_balance - p_amount;
  
  -- user_profiles 업데이트
  UPDATE user_profiles
  SET credits = new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- 거래 내역 기록
  INSERT INTO credit_transactions (
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    proposal_id,
    description
  ) VALUES (
    p_user_id,
    'usage',
    -p_amount,  -- 음수로 기록
    current_balance,
    new_balance,
    p_proposal_id,
    p_description
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION use_credits IS '크레딧 사용 (제안 제출 시 호출)';

-- ============================================
-- 5. 주문 번호 자동 생성 함수
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  year TEXT;
  seq_num TEXT;
  prefix TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  
  -- 크레딧 충전인지 서비스 구매인지 구분
  IF NEW.product_id IS NULL THEN
    prefix := 'CREDIT';
  ELSE
    prefix := 'ORD';
  END IF;
  
  -- 해당 연도의 주문 수 계산
  SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0')
  INTO seq_num
  FROM orders
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    AND order_number LIKE prefix || '-%';
  
  NEW.order_number := prefix || '-' || year || '-' || seq_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ============================================
-- 6. 결제 완료 후 처리 함수 (크레딧 충전)
-- ============================================
CREATE OR REPLACE FUNCTION process_credit_payment()
RETURNS TRIGGER AS $$
DECLARE
  credit_amount INTEGER;
BEGIN
  -- 결제 상태가 paid로 변경되고, product_id가 NULL이면 크레딧 충전
  IF NEW.status = 'paid' AND OLD.status != 'paid' AND NEW.product_id IS NULL THEN
    -- 금액에 따라 크레딧 계산 (10원 = 1크레딧 + 보너스)
    credit_amount := FLOOR(NEW.amount / 10);
    
    -- 보너스 크레딧 추가 (50,000원 이상 10%, 100,000원 이상 20%)
    IF NEW.amount >= 100000 THEN
      credit_amount := credit_amount + FLOOR(credit_amount * 0.2);
    ELSIF NEW.amount >= 50000 THEN
      credit_amount := credit_amount + FLOOR(credit_amount * 0.1);
    END IF;
    
    -- 크레딧 충전
    PERFORM charge_credits(
      NEW.buyer_id,
      credit_amount,
      NEW.id,
      '크레딧 충전 (' || TO_CHAR(NEW.amount, 'FM999,999,999') || '원)'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_process_credit_payment ON orders;
CREATE TRIGGER trigger_process_credit_payment
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION process_credit_payment();

-- ============================================
-- 완료!
-- ============================================
