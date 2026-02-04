-- ============================================
-- JobsClass v2.0 Complete Migration
-- Created: 2026-02-04
-- Purpose: 지식서비스 마켓플레이스 완전한 구조
-- Features:
--   - 파트너-클라이언트 분리 구조
--   - 10% 플랫폼 수수료 / 90% 파트너 수령
--   - 7가지 서비스 유형 지원
--   - 8개 카테고리 시스템
--   - 장바구니, 주문, 리뷰 시스템
--   - AI 상담 기능 준비
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- 1. ENUMS (Type Definitions)
-- ============================================

-- Service Types (7가지)
DO $$ BEGIN
  CREATE TYPE service_type_enum AS ENUM (
    'online-course',        -- 온라인 강의
    'coaching',             -- 1:1 코칭/멘토링
    'consulting',           -- 컨설팅
    'ebook',                -- 전자책
    'template',             -- 템플릿/도구
    'service',              -- 전문 서비스
    'community'             -- 커뮤니티/멤버십
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Categories (8개)
DO $$ BEGIN
  CREATE TYPE category_enum AS ENUM (
    'it-dev',               -- IT·개발
    'design-creative',      -- 디자인·크리에이티브
    'business-marketing',   -- 비즈니스·마케팅
    'finance-investment',   -- 재테크·금융
    'startup-sidejob',      -- 창업·부업
    'life-hobby',           -- 라이프·취미
    'self-improvement',     -- 자기계발·교양
    'consulting'            -- 전문 컨설팅
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Order Status
DO $$ BEGIN
  CREATE TYPE order_status_enum AS ENUM (
    'pending',              -- 결제 대기
    'paid',                 -- 결제 완료
    'processing',           -- 처리 중
    'completed',            -- 완료
    'cancelled',            -- 취소
    'refunded'              -- 환불
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Payment Status
DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. CORE TABLES
-- ============================================

-- 2.1 Partner Profiles (파트너 프로필)
CREATE TABLE IF NOT EXISTS partner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  display_name TEXT NOT NULL,
  profile_url TEXT UNIQUE NOT NULL, -- jobsclass.kr/partners/{profile_url}
  bio TEXT,
  avatar_url TEXT,
  tagline TEXT,
  
  -- Professional Info
  expertise TEXT[],
  career_years INTEGER DEFAULT 0,
  
  -- Statistics
  rating_average NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC(12, 2) DEFAULT 0.0,
  service_count INTEGER DEFAULT 0,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_profiles_user_id ON partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_profile_url ON partner_profiles(profile_url);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_rating ON partner_profiles(rating_average DESC);

-- 2.2 Clients (구매자 프로필)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Preferences
  interests TEXT[],
  
  -- Statistics
  total_purchases INTEGER DEFAULT 0,
  total_spent NUMERIC(12, 2) DEFAULT 0.0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- 2.3 Services (지식서비스)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Classification
  category TEXT NOT NULL, -- Using TEXT instead of ENUM for flexibility
  subcategory TEXT,
  service_type TEXT NOT NULL,
  
  -- Pricing
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(12, 2) CHECK (original_price IS NULL OR original_price >= price),
  currency TEXT DEFAULT 'KRW',
  
  -- Duration/Delivery
  duration_hours INTEGER,
  duration_days INTEGER,
  
  -- Details
  features TEXT[],
  requirements TEXT[],
  deliverables TEXT[],
  curriculum JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT FALSE,
  
  -- Statistics
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  rating_average NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(partner_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_services_partner_id ON services(partner_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_service_type ON services(service_type);
CREATE INDEX IF NOT EXISTS idx_services_published ON services(is_published, is_active);
CREATE INDEX IF NOT EXISTS idx_services_price ON services(price);
CREATE INDEX IF NOT EXISTS idx_services_rating ON services(rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);

-- Text search index
CREATE INDEX IF NOT EXISTS idx_services_title_search ON services USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_description_search ON services USING gin(description gin_trgm_ops);

-- 2.4 Carts (장바구니)
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(client_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_carts_client_id ON carts(client_id);
CREATE INDEX IF NOT EXISTS idx_carts_service_id ON carts(service_id);

-- 2.5 Orders (주문)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- JC-20260204-XXXX
  
  -- Parties
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  
  -- Pricing (10% platform fee)
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  platform_fee NUMERIC(12, 2) NOT NULL CHECK (platform_fee >= 0), -- 10%
  partner_amount NUMERIC(12, 2) NOT NULL CHECK (partner_amount >= 0), -- 90%
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Delivery
  delivery_started_at TIMESTAMPTZ,
  delivery_completed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_id ON orders(service_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 2.6 Service Reviews (서비스 리뷰)
CREATE TABLE IF NOT EXISTS service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  
  -- Status
  is_visible BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(order_id, buyer_id) -- One review per order
);

CREATE INDEX IF NOT EXISTS idx_service_reviews_service_id ON service_reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_service_reviews_buyer_id ON service_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_service_reviews_rating ON service_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_service_reviews_created_at ON service_reviews(created_at DESC);

-- 2.7 Notifications (알림)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  type TEXT NOT NULL, -- 'order', 'review', 'system', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 2.8 Payouts (정산)
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Amount
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  
  -- Bank Info
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  
  -- Processing
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_partner_id ON payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_requested_at ON payouts(requested_at DESC);

-- 2.9 Coupons (쿠폰)
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Discount
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed'
  discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
  min_purchase_amount NUMERIC(12, 2) DEFAULT 0,
  max_discount_amount NUMERIC(12, 2),
  
  -- Limits
  usage_limit INTEGER, -- null = unlimited
  used_count INTEGER DEFAULT 0,
  
  -- Validity
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);

-- ============================================
-- 3. AI CONSULTATION TABLES (준비)
-- ============================================

-- 3.1 AI Consultation Sessions (AI 상담 세션)
CREATE TABLE IF NOT EXISTS ai_consultation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Chat Data
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_services UUID[], -- Array of service IDs
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, abandoned
  
  -- Metrics
  message_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_consultation_sessions_buyer_id ON ai_consultation_sessions(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_consultation_sessions_status ON ai_consultation_sessions(status);

-- 3.2 AI Recommendations (AI 추천)
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES ai_consultation_sessions(id) ON DELETE SET NULL,
  
  -- Recommendation Data
  recommendations JSONB NOT NULL,
  learning_path JSONB,
  
  -- Metrics
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_buyer_id ON ai_recommendations(buyer_id, created_at DESC);

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- 4.1 Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'partner_profiles',
    'clients',
    'services',
    'carts',
    'orders',
    'service_reviews',
    'payouts',
    'coupons'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at 
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', tbl, tbl, tbl, tbl);
  END LOOP;
END $$;

-- 4.2 Update service statistics when order is completed
CREATE OR REPLACE FUNCTION update_service_stats_on_order_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE services
    SET purchase_count = purchase_count + 1
    WHERE id = NEW.service_id;
    
    UPDATE partner_profiles
    SET 
      total_sales = total_sales + 1,
      total_revenue = total_revenue + NEW.partner_amount
    WHERE user_id = NEW.partner_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_service_stats ON orders;
CREATE TRIGGER trigger_update_service_stats
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_service_stats_on_order_complete();

-- 4.3 Update service rating when review is created/updated
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC(3,2);
  review_count INTEGER;
BEGIN
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM service_reviews
  WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
    AND is_visible = TRUE;
  
  UPDATE services
  SET 
    rating_average = avg_rating,
    rating_count = review_count
  WHERE id = COALESCE(NEW.service_id, OLD.service_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_service_rating ON service_reviews;
CREATE TRIGGER trigger_update_service_rating
AFTER INSERT OR UPDATE OR DELETE ON service_reviews
FOR EACH ROW
EXECUTE FUNCTION update_service_rating();

-- 4.4 Update partner rating when reviews change
CREATE OR REPLACE FUNCTION update_partner_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC(3,2);
  review_count INTEGER;
  partner_user_id UUID;
BEGIN
  -- Get partner_id from service
  SELECT partner_id INTO partner_user_id
  FROM services
  WHERE id = COALESCE(NEW.service_id, OLD.service_id);
  
  -- Calculate average rating across all partner's services
  SELECT 
    COALESCE(AVG(s.rating_average), 0),
    COALESCE(SUM(s.rating_count), 0)
  INTO avg_rating, review_count
  FROM services s
  WHERE s.partner_id = partner_user_id
    AND s.rating_count > 0;
  
  UPDATE partner_profiles
  SET 
    rating_average = avg_rating,
    rating_count = review_count
  WHERE user_id = partner_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_partner_rating ON service_reviews;
CREATE TRIGGER trigger_update_partner_rating
AFTER INSERT OR UPDATE OR DELETE ON service_reviews
FOR EACH ROW
EXECUTE FUNCTION update_partner_rating();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_consultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Partner Profiles Policies
DROP POLICY IF EXISTS "Anyone can view partner profiles" ON partner_profiles;
CREATE POLICY "Anyone can view partner profiles"
  ON partner_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage own partner profile" ON partner_profiles;
CREATE POLICY "Users can manage own partner profile"
  ON partner_profiles FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Clients Policies
DROP POLICY IF EXISTS "Users can view own client profile" ON clients;
CREATE POLICY "Users can view own client profile"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own client profile" ON clients;
CREATE POLICY "Users can manage own client profile"
  ON clients FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Services Policies
DROP POLICY IF EXISTS "Anyone can view published services" ON services;
CREATE POLICY "Anyone can view published services"
  ON services FOR SELECT
  USING (is_published = true AND is_active = true OR partner_id = auth.uid());

DROP POLICY IF EXISTS "Partners can manage own services" ON services;
CREATE POLICY "Partners can manage own services"
  ON services FOR ALL
  USING (partner_id = auth.uid())
  WITH CHECK (partner_id = auth.uid());

-- Carts Policies
DROP POLICY IF EXISTS "Users can manage own cart" ON carts;
CREATE POLICY "Users can manage own cart"
  ON carts FOR ALL
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Orders Policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (client_id = auth.uid() OR partner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Reviews Policies
DROP POLICY IF EXISTS "Anyone can view visible reviews" ON service_reviews;
CREATE POLICY "Anyone can view visible reviews"
  ON service_reviews FOR SELECT
  USING (is_visible = true);

DROP POLICY IF EXISTS "Buyers can manage own reviews" ON service_reviews;
CREATE POLICY "Buyers can manage own reviews"
  ON service_reviews FOR ALL
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Payouts Policies
DROP POLICY IF EXISTS "Partners can view own payouts" ON payouts;
CREATE POLICY "Partners can view own payouts"
  ON payouts FOR SELECT
  USING (partner_id = auth.uid());

DROP POLICY IF EXISTS "Partners can create payout requests" ON payouts;
CREATE POLICY "Partners can create payout requests"
  ON payouts FOR INSERT
  WITH CHECK (partner_id = auth.uid());

-- AI Sessions Policies
DROP POLICY IF EXISTS "Users can manage own AI sessions" ON ai_consultation_sessions;
CREATE POLICY "Users can manage own AI sessions"
  ON ai_consultation_sessions FOR ALL
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- AI Recommendations Policies
DROP POLICY IF EXISTS "Users can view own recommendations" ON ai_recommendations;
CREATE POLICY "Users can view own recommendations"
  ON ai_recommendations FOR SELECT
  USING (buyer_id = auth.uid());

-- ============================================
-- 6. UTILITY FUNCTIONS
-- ============================================

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_date TEXT;
  random_suffix TEXT;
BEGIN
  order_date := TO_CHAR(NOW(), 'YYYYMMDD');
  random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
  RETURN 'JC-' || order_date || '-' || random_suffix;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ JobsClass v2.0 Migration Complete! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE 'Core Tables (9):';
  RAISE NOTICE '  1. partner_profiles  - 파트너 프로필';
  RAISE NOTICE '  2. clients           - 구매자 프로필';
  RAISE NOTICE '  3. services          - 지식서비스';
  RAISE NOTICE '  4. carts             - 장바구니';
  RAISE NOTICE '  5. orders            - 주문 (10% 수수료)';
  RAISE NOTICE '  6. service_reviews   - 서비스 리뷰';
  RAISE NOTICE '  7. notifications     - 알림';
  RAISE NOTICE '  8. payouts           - 정산';
  RAISE NOTICE '  9. coupons           - 쿠폰';
  RAISE NOTICE '';
  RAISE NOTICE 'AI Tables (2):';
  RAISE NOTICE '  10. ai_consultation_sessions';
  RAISE NOTICE '  11. ai_recommendations';
  RAISE NOTICE '';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '  ✓ 7가지 서비스 유형';
  RAISE NOTICE '  ✓ 8개 카테고리';
  RAISE NOTICE '  ✓ 10% 플랫폼 수수료 / 90% 파트너 수령';
  RAISE NOTICE '  ✓ 자동 통계 업데이트 (주문, 리뷰, 평점)';
  RAISE NOTICE '  ✓ Row Level Security 적용';
  RAISE NOTICE '  ✓ 텍스트 검색 인덱스';
  RAISE NOTICE '';
END $$;
