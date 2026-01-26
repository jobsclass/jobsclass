-- ============================================
-- JobsClass 2.0: AI 크레딧 시스템
-- 등급제 폐지 → 매출 쉐어 10% 고정 + AI 크레딧
-- ============================================

-- ============================================
-- 1. AI 크레딧 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS ai_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 100, -- 현재 보유 크레딧 (신규 가입 시 100 크레딧 무료 제공)
  total_purchased INTEGER DEFAULT 0, -- 총 구매 크레딧
  total_used INTEGER DEFAULT 0, -- 총 사용 크레딧
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_credits_user ON ai_credits(user_id);

-- ============================================
-- 2. 크레딧 거래 내역
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- purchase/usage/refund/bonus
  amount INTEGER NOT NULL, -- 양수: 충전, 음수: 사용
  balance_after INTEGER NOT NULL, -- 거래 후 잔액
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- ============================================
-- 3. 크레딧 충전 상품
-- ============================================
CREATE TABLE IF NOT EXISTS credit_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  credits INTEGER NOT NULL, -- 지급 크레딧
  price INTEGER NOT NULL, -- 가격 (원)
  bonus_credits INTEGER DEFAULT 0, -- 보너스 크레딧
  is_popular BOOLEAN DEFAULT false,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 크레딧 패키지 데이터
INSERT INTO credit_packages (id, name, name_ko, credits, price, bonus_credits, is_popular, features)
VALUES 
  ('starter', 'STARTER', '스타터', 100, 10000, 0, false, 
   '["AI 프로필 생성 1회", "AI 니즈 매칭 10회", "기본 AI 기능"]'::jsonb),
  ('basic', 'BASIC', '베이직', 300, 27000, 30, true, 
   '["AI 프로필 생성 3회", "AI 니즈 매칭 30회", "보너스 +10%"]'::jsonb),
  ('pro', 'PRO', '프로', 1000, 80000, 200, false, 
   '["AI 프로필 생성 10회", "AI 니즈 매칭 100회", "보너스 +20%"]'::jsonb),
  ('unlimited', 'UNLIMITED', '무제한', 5000, 300000, 1500, false, 
   '["AI 프로필 무제한", "AI 니즈 매칭 500회", "보너스 +30%", "우선 지원"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  credits = EXCLUDED.credits,
  price = EXCLUDED.price,
  bonus_credits = EXCLUDED.bonus_credits,
  features = EXCLUDED.features;

-- ============================================
-- 4. 크레딧 충전 결제 내역
-- ============================================
CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  package_id TEXT NOT NULL REFERENCES credit_packages(id),
  credits_purchased INTEGER NOT NULL,
  bonus_credits INTEGER DEFAULT 0,
  amount_paid INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'card',
  payment_status TEXT DEFAULT 'pending', -- pending/completed/failed/refunded
  payment_key TEXT,
  order_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_purchases_user ON credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(payment_status);

-- ============================================
-- 5. AI 기능별 크레딧 비용
-- ============================================
CREATE TABLE IF NOT EXISTS ai_feature_costs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  cost_per_use INTEGER NOT NULL, -- 1회 사용 비용
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 AI 기능 비용
INSERT INTO ai_feature_costs (id, name, name_ko, cost_per_use, description)
VALUES 
  ('profile_generation', 'Profile Generation', 'AI 프로필 생성', 100, '파트너/클라이언트 프로필 자동 생성'),
  ('need_matching', 'Need Matching', 'AI 니즈 매칭', 10, '니즈와 서비스 자동 매칭'),
  ('description_improvement', 'Description Improvement', 'AI 설명 개선', 20, '니즈/서비스 설명 개선 제안'),
  ('thumbnail_generation', 'Thumbnail Generation', 'AI 썸네일 생성', 50, '서비스 썸네일 이미지 생성'),
  ('price_recommendation', 'Price Recommendation', 'AI 가격 추천', 30, '적정 가격 추천')
ON CONFLICT (id) DO UPDATE SET
  cost_per_use = EXCLUDED.cost_per_use,
  description = EXCLUDED.description;

-- ============================================
-- 6. user_profiles 확장 (크레딧 관련)
-- ============================================
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS revenue_share_rate DECIMAL(5,2) DEFAULT 10.00, -- 매출 쉐어 고정 10%
ADD COLUMN IF NOT EXISTS free_credits_used BOOLEAN DEFAULT false; -- 무료 크레딧 사용 여부

-- 기존 partner_plan 관련 컬럼 제거는 하지 않음 (데이터 보존)

-- ============================================
-- 7. RLS 정책
-- ============================================

-- ai_credits: 본인 것만 조회
ALTER TABLE ai_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own credits" ON ai_credits 
  FOR SELECT USING (auth.uid() = user_id);

-- credit_transactions: 본인 것만 조회
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON credit_transactions 
  FOR SELECT USING (auth.uid() = user_id);

-- credit_packages: 모두 읽기 가능
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view credit packages" ON credit_packages 
  FOR SELECT USING (true);

-- ai_feature_costs: 모두 읽기 가능
ALTER TABLE ai_feature_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view AI feature costs" ON ai_feature_costs 
  FOR SELECT USING (true);

-- credit_purchases: 본인 것만 조회
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own purchases" ON credit_purchases 
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 8. 트리거: 크레딧 거래 시 잔액 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_credit_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- ai_credits 테이블 업데이트
  IF NEW.amount > 0 THEN
    -- 충전
    UPDATE ai_credits
    SET 
      amount = amount + NEW.amount,
      total_purchased = total_purchased + NEW.amount,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSE
    -- 사용
    UPDATE ai_credits
    SET 
      amount = amount + NEW.amount, -- amount는 음수
      total_used = total_used + ABS(NEW.amount),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_credit_balance
AFTER INSERT ON credit_transactions
FOR EACH ROW
EXECUTE FUNCTION update_credit_balance();

-- ============================================
-- 9. 트리거: 신규 가입 시 무료 크레딧 지급
-- ============================================
CREATE OR REPLACE FUNCTION give_welcome_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- ai_credits 레코드 생성
  INSERT INTO ai_credits (user_id, amount, total_purchased)
  VALUES (NEW.user_id, 50, 0); -- 가입 축하 50크레딧
  
  -- 거래 내역 생성
  INSERT INTO credit_transactions (user_id, type, amount, balance_after, description)
  VALUES (NEW.user_id, 'bonus', 50, 50, '🎉 가입 축하 무료 크레딧');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_give_welcome_credits
AFTER INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION give_welcome_credits();

-- ============================================
-- 10. 함수: 크레딧 사용
-- ============================================
CREATE OR REPLACE FUNCTION use_credits(
  p_user_id UUID,
  p_feature_id TEXT,
  p_amount INTEGER,
  p_description TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- 현재 잔액 조회
  SELECT amount INTO v_current_balance
  FROM ai_credits
  WHERE user_id = p_user_id;
  
  -- 잔액 부족
  IF v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- 거래 내역 생성 (음수로 저장)
  INSERT INTO credit_transactions (
    user_id, 
    type, 
    amount, 
    balance_after, 
    description,
    metadata
  )
  VALUES (
    p_user_id,
    'usage',
    -p_amount,
    v_current_balance - p_amount,
    p_description,
    jsonb_build_object('feature_id', p_feature_id)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 완료!
-- ============================================
