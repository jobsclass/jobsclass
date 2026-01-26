-- ============================================
-- JobsClass 2.0 통합 스키마
-- 작성일: 2026-01-26
-- 목적: JobsBuild + JobsClass-dev 통합
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Users 테이블 확장 (역할 추가)
-- ============================================

-- role 컬럼이 없으면 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE user_profiles 
      ADD COLUMN role TEXT DEFAULT 'buyer' CHECK (role IN ('partner', 'buyer', 'admin'));
    
    RAISE NOTICE '✅ user_profiles에 role 컬럼 추가됨';
  ELSE
    RAISE NOTICE '⏭️  role 컬럼이 이미 존재함';
  END IF;
END $$;

-- ============================================
-- 2. Partner Profiles 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS partner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  display_name TEXT NOT NULL,
  profile_url TEXT UNIQUE NOT NULL, -- partners/username
  tagline TEXT,
  description TEXT,
  
  -- 전문성
  expertise TEXT[], -- 전문 분야 배열
  career_years INTEGER DEFAULT 0,
  education TEXT,
  certifications TEXT[],
  
  -- 소셜 링크
  social_links JSONB, -- {linkedin, github, portfolio, etc.}
  
  -- 통계
  rating_average NUMERIC(3, 2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC(12, 2) DEFAULT 0.0,
  
  -- 구독 플랜
  plan_type TEXT DEFAULT 'FREE' CHECK (plan_type IN ('FREE', 'STARTER', 'PRO', 'ENTERPRISE')),
  plan_started_at TIMESTAMP WITH TIME ZONE,
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- 얼리버드
  early_bird BOOLEAN DEFAULT FALSE,
  early_bird_applied_at TIMESTAMP WITH TIME ZONE,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_profiles_user_id ON partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_profile_url ON partner_profiles(profile_url);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_plan_type ON partner_profiles(plan_type);

-- ============================================
-- 3. Products 테이블 생성 (services → products)
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
  product_type TEXT NOT NULL CHECK (product_type IN ('course', 'mentoring', 'ebook', 'template', 'consulting', 'coaching', 'bootcamp', 'development', 'marketing', 'design', 'content', 'digital_product')),
  
  -- 미디어
  thumbnail_url TEXT,
  images TEXT[],
  video_url TEXT,
  
  -- 상태
  is_published BOOLEAN DEFAULT FALSE,
  
  -- 메타데이터
  tags TEXT[],
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration TEXT, -- 예: "4주", "10시간"
  includes TEXT[], -- 포함 내용
  requirements TEXT[], -- 요구사항
  target_audience TEXT[], -- 대상
  
  -- 통계
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  rating_average NUMERIC(3, 2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(partner_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_products_partner_id ON products(partner_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- ============================================
-- 4. Orders 테이블 업데이트 (partner_id 추가)
-- ============================================

-- partner_id와 product_id 컬럼 추가
DO $$ 
BEGIN
  -- partner_id 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'partner_id'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    RAISE NOTICE '✅ orders에 partner_id 컬럼 추가됨';
  END IF;
  
  -- product_id 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE CASCADE;
    
    RAISE NOTICE '✅ orders에 product_id 컬럼 추가됨';
  END IF;
  
  -- commission_rate 추가 (수수료율)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'commission_rate'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN commission_rate NUMERIC(5, 2) DEFAULT 10.0;
    
    RAISE NOTICE '✅ orders에 commission_rate 컬럼 추가됨';
  END IF;
  
  -- commission_amount 추가 (수수료 금액)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'commission_amount'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN commission_amount NUMERIC(12, 2) DEFAULT 0.0;
    
    RAISE NOTICE '✅ orders에 commission_amount 컬럼 추가됨';
  END IF;
  
  -- partner_revenue 추가 (파트너 수익)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'partner_revenue'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN partner_revenue NUMERIC(12, 2) DEFAULT 0.0;
    
    RAISE NOTICE '✅ orders에 partner_revenue 컬럼 추가됨';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

-- ============================================
-- 5. Reviews 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 리뷰 내용
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  
  -- 상태
  is_visible BOOLEAN DEFAULT TRUE,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(order_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_partner_id ON reviews(partner_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ============================================
-- 6. Payouts 테이블 생성 (정산)
-- ============================================

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 금액
  amount NUMERIC(12, 2) NOT NULL,
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- 계좌 정보
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  
  -- 타임스탬프
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- 메모
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_partner_id ON payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- ============================================
-- 7. AI Usage 테이블 확장
-- ============================================

-- feature_type에 새로운 타입 추가
DO $$ 
BEGIN
  ALTER TABLE ai_usage_logs DROP CONSTRAINT IF EXISTS ai_usage_logs_feature_type_check;
  
  ALTER TABLE ai_usage_logs 
    ADD CONSTRAINT ai_usage_logs_feature_type_check 
    CHECK (feature_type IN (
      'image_generation', 
      'copywriting', 
      'website_generation', 
      'thumbnail', 
      'description', 
      'blog', 
      'price_recommendation',
      'learning_path',
      'consultation'
    ));
  
  RAISE NOTICE '✅ ai_usage_logs feature_type 업데이트됨';
END $$;

-- ============================================
-- 8. Buyer Learning Profiles 테이블 생성 (AI 추천용)
-- ============================================

CREATE TABLE IF NOT EXISTS buyer_learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  category TEXT NOT NULL,
  current_level TEXT NOT NULL CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),
  goals TEXT[],
  
  -- 선호도
  learning_style TEXT CHECK (learning_style IN ('video', 'text', 'practice', 'mixed')),
  time_commitment TEXT, -- 주당 시간
  budget_min INTEGER,
  budget_max INTEGER,
  
  -- 배경
  experience TEXT,
  challenges TEXT[],
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buyer_learning_profiles_buyer_id ON buyer_learning_profiles(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_learning_profiles_category ON buyer_learning_profiles(category);

-- ============================================
-- 9. AI Recommendations 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES buyer_learning_profiles(id) ON DELETE SET NULL,
  
  -- AI 추천 결과
  diagnosis JSONB NOT NULL,
  learning_path JSONB NOT NULL,
  recommended_products JSONB NOT NULL,
  roadmap JSONB,
  
  -- 메타 정보
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_buyer_id ON ai_recommendations(buyer_id, created_at DESC);

-- ============================================
-- 10. AI Consultation Sessions 테이블 생성 (챗봇)
-- ============================================

CREATE TABLE IF NOT EXISTS ai_consultation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 대화 내용
  messages JSONB NOT NULL DEFAULT '[]',
  
  -- 추천 결과
  recommended_products UUID[],
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  
  -- 통계
  message_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  
  -- 타임스탬프
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_consultation_sessions_buyer_id ON ai_consultation_sessions(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_consultation_sessions_status ON ai_consultation_sessions(status);

-- ============================================
-- 11. Subscription Plans 테이블 생성 (플랜 정의)
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 플랜 정보
  name TEXT NOT NULL UNIQUE, -- FREE, STARTER, PRO, ENTERPRISE
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- 가격
  price INTEGER NOT NULL, -- 월 비용 (원)
  platform_fee_rate NUMERIC(5, 2) NOT NULL, -- 플랫폼 수수료 (%)
  
  -- 제한사항
  max_products INTEGER,
  max_storage_gb INTEGER,
  
  -- AI 할당량
  ai_thumbnail_quota INTEGER,
  ai_description_quota INTEGER,
  ai_blog_quota INTEGER,
  ai_price_quota INTEGER,
  ai_consultation_quota INTEGER,
  
  -- 기능 플래그
  custom_domain BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  analytics_advanced BOOLEAN DEFAULT FALSE,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);

-- ============================================
-- 12. Partner Subscriptions 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS partner_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  
  -- 현재 사용량
  ai_thumbnail_used INTEGER DEFAULT 0,
  ai_description_used INTEGER DEFAULT 0,
  ai_blog_used INTEGER DEFAULT 0,
  ai_price_used INTEGER DEFAULT 0,
  ai_consultation_used INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  
  -- 구독 기간
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- 결제 정보
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method TEXT,
  billing_key TEXT,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_partner_id ON partner_subscriptions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_plan_id ON partner_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_status ON partner_subscriptions(status);

-- ============================================
-- 13. AI Usage Monthly 테이블 생성 (월별 집계)
-- ============================================

CREATE TABLE IF NOT EXISTS ai_usage_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL, -- '2026-01'
  
  -- 사용량
  thumbnail_count INTEGER DEFAULT 0,
  description_count INTEGER DEFAULT 0,
  blog_count INTEGER DEFAULT 0,
  price_count INTEGER DEFAULT 0,
  
  -- 총계
  total_tokens INTEGER DEFAULT 0,
  total_cost_krw NUMERIC(10, 2) DEFAULT 0,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(partner_id, year_month)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_monthly_partner_id ON ai_usage_monthly(partner_id, year_month DESC);

-- ============================================
-- 트리거: updated_at 자동 업데이트
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 모든 테이블에 updated_at 트리거 적용
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
      AND table_schema = 'public'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at 
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', tbl, tbl, tbl, tbl);
    
    RAISE NOTICE '✅ %에 updated_at 트리거 추가됨', tbl;
  END LOOP;
END $$;

-- ============================================
-- RLS 정책 설정
-- ============================================

-- Partner Profiles
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view partner profiles"
  ON partner_profiles FOR SELECT
  USING (true);

CREATE POLICY "Partners can update own profile"
  ON partner_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Partners can create own profile"
  ON partner_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published products"
  ON products FOR SELECT
  USING (is_published = true OR partner_id = auth.uid());

CREATE POLICY "Partners can create own products"
  ON products FOR INSERT
  WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can update own products"
  ON products FOR UPDATE
  USING (partner_id = auth.uid());

CREATE POLICY "Partners can delete own products"
  ON products FOR DELETE
  USING (partner_id = auth.uid());

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible reviews"
  ON reviews FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Buyers can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Buyers can update own reviews"
  ON reviews FOR UPDATE
  USING (buyer_id = auth.uid());

-- Payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own payouts"
  ON payouts FOR SELECT
  USING (partner_id = auth.uid());

CREATE POLICY "Partners can create payout requests"
  ON payouts FOR INSERT
  WITH CHECK (partner_id = auth.uid());

-- Buyer Learning Profiles
ALTER TABLE buyer_learning_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can manage own learning profile"
  ON buyer_learning_profiles FOR ALL
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- AI Recommendations
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own recommendations"
  ON ai_recommendations FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY "System can create recommendations"
  ON ai_recommendations FOR INSERT
  WITH CHECK (true);

-- AI Consultation Sessions
ALTER TABLE ai_consultation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can manage own sessions"
  ON ai_consultation_sessions FOR ALL
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- Partner Subscriptions
ALTER TABLE partner_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own subscription"
  ON partner_subscriptions FOR SELECT
  USING (partner_id = auth.uid());

CREATE POLICY "Partners can update own subscription"
  ON partner_subscriptions FOR UPDATE
  USING (partner_id = auth.uid());

CREATE POLICY "System can create subscriptions"
  ON partner_subscriptions FOR INSERT
  WITH CHECK (true);

-- AI Usage Monthly
ALTER TABLE ai_usage_monthly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own AI usage"
  ON ai_usage_monthly FOR SELECT
  USING (partner_id = auth.uid());

CREATE POLICY "System can manage AI usage"
  ON ai_usage_monthly FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 초기 데이터: 구독 플랜
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
  RAISE NOTICE '생성된 테이블:';
  RAISE NOTICE '  1. partner_profiles - 파트너 프로필';
  RAISE NOTICE '  2. products - 상품';
  RAISE NOTICE '  3. reviews - 리뷰';
  RAISE NOTICE '  4. payouts - 정산';
  RAISE NOTICE '  5. buyer_learning_profiles - 구매자 학습 프로필';
  RAISE NOTICE '  6. ai_recommendations - AI 추천';
  RAISE NOTICE '  7. ai_consultation_sessions - AI 챗봇';
  RAISE NOTICE '  8. subscription_plans - 구독 플랜';
  RAISE NOTICE '  9. partner_subscriptions - 파트너 구독';
  RAISE NOTICE '  10. ai_usage_monthly - AI 사용량 월별 집계';
  RAISE NOTICE '';
  RAISE NOTICE '업데이트된 테이블:';
  RAISE NOTICE '  - user_profiles (role 추가)';
  RAISE NOTICE '  - orders (partner_id, product_id, commission 추가)';
  RAISE NOTICE '  - ai_usage_logs (feature_type 확장)';
  RAISE NOTICE '';
  RAISE NOTICE '다음 단계:';
  RAISE NOTICE '  1. Supabase에서 이 스키마 실행';
  RAISE NOTICE '  2. 마켓플레이스 페이지 추가';
  RAISE NOTICE '  3. 파트너 프로필 페이지 추가';
  RAISE NOTICE '  4. AI 기능 통합';
  RAISE NOTICE '';
END $$;
