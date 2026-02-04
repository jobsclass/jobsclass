-- ============================================
-- JobsClass 정확한 마이그레이션
-- 기존 user_profiles 구조에 맞춤
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- 1. user_profiles 테이블에 필요한 컬럼 추가
-- ============================================

-- 기존 컬럼: user_id, email, name, phone, avatar_url, is_verified, is_active, created_at, updated_at
-- 추가 필요: display_name, username, business_number, business_registration_file, verification_status, onboarding_complete, role

DO $$ 
BEGIN
  -- display_name (name을 그대로 사용할 수도 있지만 호환성을 위해 추가)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'display_name') THEN
    ALTER TABLE user_profiles ADD COLUMN display_name TEXT;
    -- 기존 name 값을 display_name으로 복사
    UPDATE user_profiles SET display_name = name WHERE display_name IS NULL;
    RAISE NOTICE '✅ Added display_name';
  END IF;

  -- username (profile URL용)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'username') THEN
    ALTER TABLE user_profiles ADD COLUMN username TEXT UNIQUE;
    RAISE NOTICE '✅ Added username';
  END IF;

  -- business_number (사업자등록번호)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'business_number') THEN
    ALTER TABLE user_profiles ADD COLUMN business_number TEXT;
    RAISE NOTICE '✅ Added business_number';
  END IF;

  -- business_registration_file (사업자등록증)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'business_registration_file') THEN
    ALTER TABLE user_profiles ADD COLUMN business_registration_file TEXT;
    RAISE NOTICE '✅ Added business_registration_file';
  END IF;

  -- verification_status (검증 상태)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'verification_status') THEN
    ALTER TABLE user_profiles ADD COLUMN verification_status TEXT DEFAULT 'pending';
    RAISE NOTICE '✅ Added verification_status';
  END IF;

  -- onboarding_complete (온보딩 완료)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'onboarding_complete') THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_complete BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ Added onboarding_complete';
  END IF;

  -- role (partner/buyer/admin)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
    ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'buyer';
    RAISE NOTICE '✅ Added role';
  END IF;

  -- subscription_plan (구독 플랜)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'subscription_plan') THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_plan TEXT DEFAULT 'FREE';
    RAISE NOTICE '✅ Added subscription_plan';
  END IF;

  -- subscription_status (구독 상태)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'subscription_status') THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_status TEXT DEFAULT 'active';
    RAISE NOTICE '✅ Added subscription_status';
  END IF;
END $$;

-- Indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_number ON user_profiles(business_number);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_status ON user_profiles(verification_status);

-- ============================================
-- 2. services 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Classification
  category TEXT NOT NULL,
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

-- Indexes for services
CREATE INDEX IF NOT EXISTS idx_services_partner_id ON services(partner_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_service_type ON services(service_type);
CREATE INDEX IF NOT EXISTS idx_services_published ON services(is_published, is_active);
CREATE INDEX IF NOT EXISTS idx_services_price ON services(price);
CREATE INDEX IF NOT EXISTS idx_services_rating ON services(rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_services_title_search ON services USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_description_search ON services USING gin(description gin_trgm_ops);

-- ============================================
-- 3. carts 테이블 생성
-- ============================================

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

-- ============================================
-- 4. orders 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  
  -- Parties
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  
  -- Pricing (10% platform fee)
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  platform_fee NUMERIC(12, 2) NOT NULL CHECK (platform_fee >= 0),
  partner_amount NUMERIC(12, 2) NOT NULL CHECK (partner_amount >= 0),
  
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

-- ============================================
-- 5. service_reviews 테이블 생성
-- ============================================

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
  
  UNIQUE(order_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_service_reviews_service_id ON service_reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_service_reviews_buyer_id ON service_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_service_reviews_rating ON service_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_service_reviews_created_at ON service_reviews(created_at DESC);

-- ============================================
-- 6. updated_at 트리거 함수
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
  tables TEXT[] := ARRAY['services', 'carts', 'orders', 'service_reviews'];
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

-- ============================================
-- 7. RLS 정책 설정
-- ============================================

-- user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles" 
  ON user_profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" 
  ON user_profiles FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published services" ON services;
CREATE POLICY "Anyone can view published services"
  ON services FOR SELECT
  USING (is_published = true AND is_active = true OR partner_id = auth.uid());

DROP POLICY IF EXISTS "Partners can manage own services" ON services;
CREATE POLICY "Partners can manage own services"
  ON services FOR ALL
  USING (partner_id = auth.uid())
  WITH CHECK (partner_id = auth.uid());

-- carts
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart" ON carts;
CREATE POLICY "Users can manage own cart"
  ON carts FOR ALL
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (client_id = auth.uid() OR partner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- service_reviews
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view visible reviews" ON service_reviews;
CREATE POLICY "Anyone can view visible reviews"
  ON service_reviews FOR SELECT
  USING (is_visible = true);

DROP POLICY IF EXISTS "Buyers can manage own reviews" ON service_reviews;
CREATE POLICY "Buyers can manage own reviews"
  ON service_reviews FOR ALL
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- ============================================
-- 8. 통계 업데이트 트리거
-- ============================================

-- 주문 완료 시 서비스 통계 업데이트
CREATE OR REPLACE FUNCTION update_service_stats_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE services
    SET purchase_count = purchase_count + 1
    WHERE id = NEW.service_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_service_stats ON orders;
CREATE TRIGGER trigger_update_service_stats
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_service_stats_on_order();

-- 리뷰 작성 시 서비스 평점 업데이트
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

-- ============================================
-- 완료 메시지
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ JobsClass 마이그레이션 완료! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE '업데이트된 테이블:';
  RAISE NOTICE '  - user_profiles (9개 컬럼 추가)';
  RAISE NOTICE '';
  RAISE NOTICE '새로 생성된 테이블:';
  RAISE NOTICE '  - services (지식서비스)';
  RAISE NOTICE '  - carts (장바구니)';
  RAISE NOTICE '  - orders (주문, 10% 수수료)';
  RAISE NOTICE '  - service_reviews (리뷰)';
  RAISE NOTICE '';
  RAISE NOTICE '추가 기능:';
  RAISE NOTICE '  - 자동 통계 업데이트 트리거';
  RAISE NOTICE '  - RLS 보안 정책';
  RAISE NOTICE '  - 검색 인덱스';
  RAISE NOTICE '';
END $$;
