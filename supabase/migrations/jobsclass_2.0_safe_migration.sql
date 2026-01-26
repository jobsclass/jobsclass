-- ============================================
-- JobsClass 2.0 안전한 마이그레이션
-- 작성일: 2026-01-26
-- 목적: 기존 테이블 구조 유지하며 필요한 기능만 추가
-- ============================================

-- ============================================
-- 1. user_profiles에 role 컬럼 추가
-- ============================================

DO $$ 
BEGIN
  -- role 컬럼 추가 (partner/buyer/admin)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE user_profiles 
      ADD COLUMN role TEXT DEFAULT 'buyer';
    
    RAISE NOTICE '✅ user_profiles에 role 컬럼 추가됨';
  ELSE
    RAISE NOTICE '⏭️  role 컬럼이 이미 존재함';
  END IF;

  -- role CHECK 제약조건 추가
  BEGIN
    ALTER TABLE user_profiles 
      DROP CONSTRAINT IF EXISTS user_profiles_role_check;
    
    ALTER TABLE user_profiles 
      ADD CONSTRAINT user_profiles_role_check 
      CHECK (role IN ('partner', 'buyer', 'admin'));
    
    RAISE NOTICE '✅ role CHECK 제약조건 추가됨';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '⏭️  role CHECK 제약조건 이미 존재';
  END;

  -- partner 관련 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'profile_url'
  ) THEN
    ALTER TABLE user_profiles 
      ADD COLUMN profile_url TEXT UNIQUE;
    
    RAISE NOTICE '✅ user_profiles에 profile_url 컬럼 추가됨';
  END IF;

  -- 통계 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'rating_average'
  ) THEN
    ALTER TABLE user_profiles 
      ADD COLUMN rating_average NUMERIC(3, 2) DEFAULT 0.0;
    
    RAISE NOTICE '✅ user_profiles에 rating_average 추가됨';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'rating_count'
  ) THEN
    ALTER TABLE user_profiles 
      ADD COLUMN rating_count INTEGER DEFAULT 0;
    
    RAISE NOTICE '✅ user_profiles에 rating_count 추가됨';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'total_sales'
  ) THEN
    ALTER TABLE user_profiles 
      ADD COLUMN total_sales INTEGER DEFAULT 0;
    
    RAISE NOTICE '✅ user_profiles에 total_sales 추가됨';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'total_revenue'
  ) THEN
    ALTER TABLE user_profiles 
      ADD COLUMN total_revenue NUMERIC(12, 2) DEFAULT 0.0;
    
    RAISE NOTICE '✅ user_profiles에 total_revenue 추가됨';
  END IF;

  -- 얼리버드 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'early_bird'
  ) THEN
    ALTER TABLE user_profiles 
      ADD COLUMN early_bird BOOLEAN DEFAULT FALSE;
    
    RAISE NOTICE '✅ user_profiles에 early_bird 추가됨';
  END IF;
END $$;

-- ============================================
-- 2. orders 테이블에 partner_id 추가
-- ============================================

DO $$ 
BEGIN
  -- partner_id 추가 (판매자 정보)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'partner_id'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    RAISE NOTICE '✅ orders에 partner_id 추가됨';
  END IF;

  -- commission_rate 추가 (수수료율)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'commission_rate'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN commission_rate NUMERIC(5, 2) DEFAULT 10.0;
    
    RAISE NOTICE '✅ orders에 commission_rate 추가됨';
  END IF;

  -- commission_amount 추가 (수수료 금액)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'commission_amount'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN commission_amount NUMERIC(12, 2) DEFAULT 0.0;
    
    RAISE NOTICE '✅ orders에 commission_amount 추가됨';
  END IF;

  -- partner_revenue 추가 (파트너 수익)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'partner_revenue'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN partner_revenue NUMERIC(12, 2) DEFAULT 0.0;
    
    RAISE NOTICE '✅ orders에 partner_revenue 추가됨';
  END IF;
END $$;

-- ============================================
-- 3. services 테이블에 추가 컬럼 (products 호환)
-- ============================================

DO $$ 
BEGIN
  -- tags 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'tags'
  ) THEN
    ALTER TABLE services 
      ADD COLUMN tags TEXT[];
    
    RAISE NOTICE '✅ services에 tags 추가됨';
  END IF;

  -- difficulty_level 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'difficulty_level'
  ) THEN
    ALTER TABLE services 
      ADD COLUMN difficulty_level TEXT;
    
    RAISE NOTICE '✅ services에 difficulty_level 추가됨';
  END IF;

  -- duration 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'duration'
  ) THEN
    ALTER TABLE services 
      ADD COLUMN duration TEXT;
    
    RAISE NOTICE '✅ services에 duration 추가됨';
  END IF;

  -- rating 관련 컬럼
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'rating_average'
  ) THEN
    ALTER TABLE services 
      ADD COLUMN rating_average NUMERIC(3, 2) DEFAULT 0.0;
    
    RAISE NOTICE '✅ services에 rating_average 추가됨';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'rating_count'
  ) THEN
    ALTER TABLE services 
      ADD COLUMN rating_count INTEGER DEFAULT 0;
    
    RAISE NOTICE '✅ services에 rating_count 추가됨';
  END IF;

  -- view_count 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE services 
      ADD COLUMN view_count INTEGER DEFAULT 0;
    
    RAISE NOTICE '✅ services에 view_count 추가됨';
  END IF;

  -- purchase_count 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'purchase_count'
  ) THEN
    ALTER TABLE services 
      ADD COLUMN purchase_count INTEGER DEFAULT 0;
    
    RAISE NOTICE '✅ services에 purchase_count 추가됨';
  END IF;
END $$;

-- ============================================
-- 4. Reviews 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
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
    RAISE NOTICE 'reviews rating constraint already exists';
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
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
    RAISE NOTICE 'payouts status constraint already exists';
END $$;

CREATE INDEX IF NOT EXISTS idx_payouts_partner_id ON payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- ============================================
-- 6. Buyer Learning Profiles 테이블 생성
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
    RAISE NOTICE 'buyer_learning_profiles current_level constraint already exists';
END $$;

CREATE INDEX IF NOT EXISTS idx_buyer_learning_profiles_buyer_id ON buyer_learning_profiles(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_learning_profiles_category ON buyer_learning_profiles(category);

-- ============================================
-- 7. AI Recommendations 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES buyer_learning_profiles(id) ON DELETE SET NULL,
  
  diagnosis JSONB NOT NULL,
  learning_path JSONB NOT NULL,
  recommended_services JSONB NOT NULL,
  roadmap JSONB,
  
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_buyer_id ON ai_recommendations(buyer_id, created_at DESC);

-- ============================================
-- 8. AI Consultation Sessions 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS ai_consultation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  messages JSONB NOT NULL DEFAULT '[]',
  recommended_services UUID[],
  
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
    RAISE NOTICE 'ai_consultation_sessions status constraint already exists';
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_consultation_sessions_buyer_id ON ai_consultation_sessions(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_consultation_sessions_status ON ai_consultation_sessions(status);

-- ============================================
-- 9. ai_usage_logs feature_type 확장
-- ============================================

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
  
  RAISE NOTICE '✅ ai_usage_logs feature_type 확장됨';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⏭️  ai_usage_logs feature_type 확장 실패 (무시)';
END $$;

-- ============================================
-- 10. 트리거: updated_at 자동 업데이트
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
  tables TEXT[] := ARRAY['reviews', 'payouts', 'buyer_learning_profiles'];
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
-- 11. RLS 정책 설정
-- ============================================

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

-- ============================================
-- 완료 메시지
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ JobsClass 2.0 마이그레이션 완료! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE '업데이트된 테이블:';
  RAISE NOTICE '  - user_profiles (role, profile_url, 통계 컬럼 추가)';
  RAISE NOTICE '  - orders (partner_id, commission 컬럼 추가)';
  RAISE NOTICE '  - services (tags, rating, view_count 등 추가)';
  RAISE NOTICE '';
  RAISE NOTICE '새로 생성된 테이블:';
  RAISE NOTICE '  1. reviews - 리뷰';
  RAISE NOTICE '  2. payouts - 정산';
  RAISE NOTICE '  3. buyer_learning_profiles - 구매자 학습 프로필';
  RAISE NOTICE '  4. ai_recommendations - AI 추천';
  RAISE NOTICE '  5. ai_consultation_sessions - AI 챗봇';
  RAISE NOTICE '';
  RAISE NOTICE '다음 단계:';
  RAISE NOTICE '  1. 회원가입 시 role 선택 (partner/buyer)';
  RAISE NOTICE '  2. 마켓플레이스 페이지에서 services 조회';
  RAISE NOTICE '  3. 파트너 프로필 페이지 추가';
  RAISE NOTICE '';
END $$;
