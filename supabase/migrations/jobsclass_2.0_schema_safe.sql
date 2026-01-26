-- ============================================
-- JobsClass 2.0 통합 스키마 (안전 버전)
-- 작성일: 2026-01-26
-- 목적: 기존 테이블과 충돌 없이 안전하게 통합
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Partner Profiles 테이블 생성/업데이트
-- ============================================

CREATE TABLE IF NOT EXISTS partner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  display_name TEXT NOT NULL,
  profile_url TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  
  -- 전문성
  expertise TEXT[],
  career_years INTEGER DEFAULT 0,
  education TEXT,
  certifications TEXT[],
  
  -- 소셜 링크
  social_links JSONB,
  
  -- 통계
  rating_average NUMERIC(3, 2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC(12, 2) DEFAULT 0.0,
  
  -- 구독 플랜
  plan_type TEXT DEFAULT 'FREE',
  plan_started_at TIMESTAMP WITH TIME ZONE,
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- 얼리버드
  early_bird BOOLEAN DEFAULT FALSE,
  early_bird_applied_at TIMESTAMP WITH TIME ZONE,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- plan_type에 CHECK 제약조건 추가 (이미 있으면 무시)
DO $$ 
BEGIN
  ALTER TABLE partner_profiles 
    DROP CONSTRAINT IF EXISTS partner_profiles_plan_type_check;
  
  ALTER TABLE partner_profiles 
    ADD CONSTRAINT partner_profiles_plan_type_check 
    CHECK (plan_type IN ('FREE', 'STARTER', 'PRO', 'ENTERPRISE'));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'plan_type constraint already exists or cannot be added';
END $$;

CREATE INDEX IF NOT EXISTS idx_partner_profiles_user_id ON partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_profile_url ON partner_profiles(profile_url);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_plan_type ON partner_profiles(plan_type);

-- ============================================
-- 2. Products 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- 카테고리
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- 가격
  price NUMERIC(12, 2) NOT NULL,
  discount_price NUMERIC(12, 2),
  currency TEXT DEFAULT 'KRW',
  
  -- 타입
  product_type TEXT NOT NULL,
  
  -- 미디어
  thumbnail_url TEXT,
  images TEXT[],
  video_url TEXT,
  
  -- 상태
  is_published BOOLEAN DEFAULT FALSE,
  
  -- 메타데이터
  tags TEXT[],
  difficulty_level TEXT,
  duration TEXT,
  includes TEXT[],
  requirements TEXT[],
  target_audience TEXT[],
  
  -- 통계
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  rating_average NUMERIC(3, 2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- product_type CHECK 제약조건
DO $$ 
BEGIN
  ALTER TABLE products 
    DROP CONSTRAINT IF EXISTS products_product_type_check;
  
  ALTER TABLE products 
    ADD CONSTRAINT products_product_type_check 
    CHECK (product_type IN ('course', 'mentoring', 'ebook', 'template', 'consulting', 'coaching', 'bootcamp', 'development', 'marketing', 'design', 'content', 'digital_product'));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'product_type constraint already exists';
END $$;

-- difficulty_level CHECK 제약조건
DO $$ 
BEGIN
  ALTER TABLE products 
    DROP CONSTRAINT IF EXISTS products_difficulty_level_check;
  
  ALTER TABLE products 
    ADD CONSTRAINT products_difficulty_level_check 
    CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced') OR difficulty_level IS NULL);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'difficulty_level constraint already exists';
END $$;

-- UNIQUE 제약조건
DO $$ 
BEGIN
  ALTER TABLE products 
    DROP CONSTRAINT IF EXISTS products_partner_id_slug_key;
  
  ALTER TABLE products 
    ADD CONSTRAINT products_partner_id_slug_key 
    UNIQUE(partner_id, slug);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'unique constraint already exists';
END $$;

CREATE INDEX IF NOT EXISTS idx_products_partner_id ON products(partner_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- ============================================
-- 3. Orders 테이블 컬럼 추가
-- ============================================

DO $$ 
BEGIN
  -- partner_id 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'partner_id'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ orders에 partner_id 추가됨';
  END IF;
  
  -- product_id 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ orders에 product_id 추가됨';
  END IF;
  
  -- commission_rate 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'commission_rate'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN commission_rate NUMERIC(5, 2) DEFAULT 10.0;
    RAISE NOTICE '✅ orders에 commission_rate 추가됨';
  END IF;
  
  -- commission_amount 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'commission_amount'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN commission_amount NUMERIC(12, 2) DEFAULT 0.0;
    RAISE NOTICE '✅ orders에 commission_amount 추가됨';
  END IF;
  
  -- partner_revenue 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'partner_revenue'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN partner_revenue NUMERIC(12, 2) DEFAULT 0.0;
    RAISE NOTICE '✅ orders에 partner_revenue 추가됨';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

-- ============================================
-- 4. Reviews 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 리뷰 내용
  rating INTEGER NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  
  -- 상태
  is_visible BOOLEAN DEFAULT TRUE,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- rating CHECK 제약조건
DO $$ 
BEGIN
  ALTER TABLE reviews 
    DROP CONSTRAINT IF EXISTS reviews_rating_check;
  
  ALTER TABLE reviews 
    ADD CONSTRAINT reviews_rating_check 
    CHECK (rating >= 1 AND rating <= 5);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'rating constraint already exists';
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_partner_id ON reviews(partner_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ============================================
-- 5. Payouts 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 금액
  amount NUMERIC(12, 2) NOT NULL,
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- 계좌 정보
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  
  -- 타임스탬프
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- status CHECK 제약조건
DO $$ 
BEGIN
  ALTER TABLE payouts 
    DROP CONSTRAINT IF EXISTS payouts_status_check;
  
  ALTER TABLE payouts 
    ADD CONSTRAINT payouts_status_check 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'status constraint already exists';
END $$;

CREATE INDEX IF NOT EXISTS idx_payouts_partner_id ON payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- ============================================
-- 6. Subscription Plans 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  
  price INTEGER NOT NULL,
  platform_fee_rate NUMERIC(5, 2) NOT NULL,
  
  max_products INTEGER,
  max_storage_gb INTEGER,
  
  ai_thumbnail_quota INTEGER,
  ai_description_quota INTEGER,
  ai_blog_quota INTEGER,
  ai_price_quota INTEGER,
  ai_consultation_quota INTEGER,
  
  custom_domain BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  analytics_advanced BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);

-- ============================================
-- 7. Partner Subscriptions 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS partner_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  status TEXT NOT NULL DEFAULT 'active',
  
  ai_thumbnail_used INTEGER DEFAULT 0,
  ai_description_used INTEGER DEFAULT 0,
  ai_blog_used INTEGER DEFAULT 0,
  ai_price_used INTEGER DEFAULT 0,
  ai_consultation_used INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method TEXT,
  billing_key TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- status CHECK 제약조건
DO $$ 
BEGIN
  ALTER TABLE partner_subscriptions 
    DROP CONSTRAINT IF EXISTS partner_subscriptions_status_check;
  
  ALTER TABLE partner_subscriptions 
    ADD CONSTRAINT partner_subscriptions_status_check 
    CHECK (status IN ('active', 'cancelled', 'expired', 'paused'));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'status constraint already exists';
END $$;

CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_partner_id ON partner_subscriptions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_plan_id ON partner_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_status ON partner_subscriptions(status);

-- ============================================
-- 8. Buyer Learning Profiles 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS buyer_learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  category TEXT NOT NULL,
  current_level TEXT NOT NULL,
  goals TEXT[],
  
  learning_style TEXT,
  time_commitment TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  
  experience TEXT,
  challenges TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- current_level CHECK
DO $$ 
BEGIN
  ALTER TABLE buyer_learning_profiles 
    DROP CONSTRAINT IF EXISTS buyer_learning_profiles_current_level_check;
  
  ALTER TABLE buyer_learning_profiles 
    ADD CONSTRAINT buyer_learning_profiles_current_level_check 
    CHECK (current_level IN ('beginner', 'intermediate', 'advanced'));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'current_level constraint already exists';
END $$;

-- learning_style CHECK
DO $$ 
BEGIN
  ALTER TABLE buyer_learning_profiles 
    DROP CONSTRAINT IF EXISTS buyer_learning_profiles_learning_style_check;
  
  ALTER TABLE buyer_learning_profiles 
    ADD CONSTRAINT buyer_learning_profiles_learning_style_check 
    CHECK (learning_style IN ('video', 'text', 'practice', 'mixed') OR learning_style IS NULL);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'learning_style constraint already exists';
END $$;

CREATE INDEX IF NOT EXISTS idx_buyer_learning_profiles_buyer_id ON buyer_learning_profiles(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_learning_profiles_category ON buyer_learning_profiles(category);

-- ============================================
-- 9. AI Recommendations 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES buyer_learning_profiles(id) ON DELETE SET NULL,
  
  diagnosis JSONB NOT NULL,
  learning_path JSONB NOT NULL,
  recommended_products JSONB NOT NULL,
  roadmap JSONB,
  
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_buyer_id ON ai_recommendations(buyer_id, created_at DESC);

-- ============================================
-- 10. AI Consultation Sessions 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS ai_consultation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  messages JSONB NOT NULL DEFAULT '[]',
  recommended_products UUID[],
  
  status TEXT NOT NULL DEFAULT 'active',
  
  message_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- status CHECK
DO $$ 
BEGIN
  ALTER TABLE ai_consultation_sessions 
    DROP CONSTRAINT IF EXISTS ai_consultation_sessions_status_check;
  
  ALTER TABLE ai_consultation_sessions 
    ADD CONSTRAINT ai_consultation_sessions_status_check 
    CHECK (status IN ('active', 'completed', 'abandoned'));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'status constraint already exists';
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_consultation_sessions_buyer_id ON ai_consultation_sessions(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_consultation_sessions_status ON ai_consultation_sessions(status);

-- ============================================
-- 11. AI Usage Monthly 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS ai_usage_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL,
  
  thumbnail_count INTEGER DEFAULT 0,
  description_count INTEGER DEFAULT 0,
  blog_count INTEGER DEFAULT 0,
  price_count INTEGER DEFAULT 0,
  
  total_tokens INTEGER DEFAULT 0,
  total_cost_krw NUMERIC(10, 2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UNIQUE 제약조건
DO $$ 
BEGIN
  ALTER TABLE ai_usage_monthly 
    DROP CONSTRAINT IF EXISTS ai_usage_monthly_partner_id_year_month_key;
  
  ALTER TABLE ai_usage_monthly 
    ADD CONSTRAINT ai_usage_monthly_partner_id_year_month_key 
    UNIQUE(partner_id, year_month);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'unique constraint already exists';
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_usage_monthly_partner_id ON ai_usage_monthly(partner_id, year_month DESC);

-- ============================================
-- 12. 트리거: updated_at 자동 업데이트
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['partner_profiles', 'products', 'reviews', 'payouts', 'subscription_plans', 'partner_subscriptions', 'buyer_learning_profiles', 'ai_usage_monthly'];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at 
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', tbl, tbl, tbl, tbl);
    
    RAISE NOTICE '✅ % 트리거 추가됨', tbl;
  END LOOP;
END $$;

-- ============================================
-- 13. RLS 정책 설정
-- ============================================

-- Partner Profiles
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view partner profiles" ON partner_profiles;
CREATE POLICY "Anyone can view partner profiles"
  ON partner_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Partners can update own profile" ON partner_profiles;
CREATE POLICY "Partners can update own profile"
  ON partner_profiles FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Partners can create own profile" ON partner_profiles;
CREATE POLICY "Partners can create own profile"
  ON partner_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published products" ON products;
CREATE POLICY "Anyone can view published products"
  ON products FOR SELECT
  USING (is_published = true OR partner_id = auth.uid());

DROP POLICY IF EXISTS "Partners can create own products" ON products;
CREATE POLICY "Partners can create own products"
  ON products FOR INSERT
  WITH CHECK (partner_id = auth.uid());

DROP POLICY IF EXISTS "Partners can update own products" ON products;
CREATE POLICY "Partners can update own products"
  ON products FOR UPDATE
  USING (partner_id = auth.uid());

DROP POLICY IF EXISTS "Partners can delete own products" ON products;
CREATE POLICY "Partners can delete own products"
  ON products FOR DELETE
  USING (partner_id = auth.uid());

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view visible reviews" ON reviews;
CREATE POLICY "Anyone can view visible reviews"
  ON reviews FOR SELECT
  USING (is_visible = true);

DROP POLICY IF EXISTS "Buyers can create reviews" ON reviews;
CREATE POLICY "Buyers can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Buyers can update own reviews" ON reviews;
CREATE POLICY "Buyers can update own reviews"
  ON reviews FOR UPDATE
  USING (buyer_id = auth.uid());

-- Payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can view own payouts" ON payouts;
CREATE POLICY "Partners can view own payouts"
  ON payouts FOR SELECT
  USING (partner_id = auth.uid());

DROP POLICY IF EXISTS "Partners can create payout requests" ON payouts;
CREATE POLICY "Partners can create payout requests"
  ON payouts FOR INSERT
  WITH CHECK (partner_id = auth.uid());

-- Buyer Learning Profiles
ALTER TABLE buyer_learning_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers can manage own learning profile" ON buyer_learning_profiles;
CREATE POLICY "Buyers can manage own learning profile"
  ON buyer_learning_profiles FOR ALL
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- AI Recommendations
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers can view own recommendations" ON ai_recommendations;
CREATE POLICY "Buyers can view own recommendations"
  ON ai_recommendations FOR SELECT
  USING (buyer_id = auth.uid());

DROP POLICY IF EXISTS "System can create recommendations" ON ai_recommendations;
CREATE POLICY "System can create recommendations"
  ON ai_recommendations FOR INSERT
  WITH CHECK (true);

-- AI Consultation Sessions
ALTER TABLE ai_consultation_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers can manage own sessions" ON ai_consultation_sessions;
CREATE POLICY "Buyers can manage own sessions"
  ON ai_consultation_sessions FOR ALL
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- Partner Subscriptions
ALTER TABLE partner_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can view own subscription" ON partner_subscriptions;
CREATE POLICY "Partners can view own subscription"
  ON partner_subscriptions FOR SELECT
  USING (partner_id = auth.uid());

DROP POLICY IF EXISTS "Partners can update own subscription" ON partner_subscriptions;
CREATE POLICY "Partners can update own subscription"
  ON partner_subscriptions FOR UPDATE
  USING (partner_id = auth.uid());

DROP POLICY IF EXISTS "System can create subscriptions" ON partner_subscriptions;
CREATE POLICY "System can create subscriptions"
  ON partner_subscriptions FOR INSERT
  WITH CHECK (true);

-- AI Usage Monthly
ALTER TABLE ai_usage_monthly ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can view own AI usage" ON ai_usage_monthly;
CREATE POLICY "Partners can view own AI usage"
  ON ai_usage_monthly FOR SELECT
  USING (partner_id = auth.uid());

DROP POLICY IF EXISTS "System can manage AI usage" ON ai_usage_monthly;
CREATE POLICY "System can manage AI usage"
  ON ai_usage_monthly FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 14. 초기 데이터: 구독 플랜
-- ============================================

INSERT INTO subscription_plans (name, display_name, description, price, platform_fee_rate, max_products, max_storage_gb, ai_thumbnail_quota, ai_description_quota, ai_blog_quota, ai_price_quota, ai_consultation_quota, custom_domain, priority_support, analytics_advanced)
VALUES 
  ('FREE', '무료 플랜', '테스트 및 소규모 운영', 0, 15.00, 3, 1, 0, 0, 0, 0, 0, false, false, false),
  ('STARTER', '스타터 플랜', '개인 파트너를 위한 플랜', 29000, 10.00, 20, 5, 10, 30, 10, 30, 0, false, false, false),
  ('PRO', '프로 플랜', '전문 파트너를 위한 플랜', 79000, 7.00, 100, 50, 50, 150, 50, 150, 50, true, true, true),
  ('ENTERPRISE', '엔터프라이즈 플랜', '기업 및 대규모 운영', 300000, 5.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, true, true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 완료 메시지
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ JobsClass 2.0 스키마 통합 완료! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE '생성된 테이블 (10개):';
  RAISE NOTICE '  1. partner_profiles';
  RAISE NOTICE '  2. products';
  RAISE NOTICE '  3. reviews';
  RAISE NOTICE '  4. payouts';
  RAISE NOTICE '  5. buyer_learning_profiles';
  RAISE NOTICE '  6. ai_recommendations';
  RAISE NOTICE '  7. ai_consultation_sessions';
  RAISE NOTICE '  8. subscription_plans';
  RAISE NOTICE '  9. partner_subscriptions';
  RAISE NOTICE '  10. ai_usage_monthly';
  RAISE NOTICE '';
  RAISE NOTICE '업데이트된 테이블:';
  RAISE NOTICE '  - orders (partner_id, product_id, commission 컬럼 추가)';
  RAISE NOTICE '';
END $$;
