-- ============================================
-- JobsClass 통합 마이그레이션
-- products → services 통합 및 필드 추가
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- 1. user_profiles 업데이트
-- ============================================

DO $$ 
BEGIN
  -- display_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'display_name') THEN
    ALTER TABLE user_profiles ADD COLUMN display_name TEXT;
    UPDATE user_profiles SET display_name = name WHERE display_name IS NULL;
  END IF;

  -- username
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'username') THEN
    ALTER TABLE user_profiles ADD COLUMN username TEXT UNIQUE;
  END IF;

  -- business_number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'business_number') THEN
    ALTER TABLE user_profiles ADD COLUMN business_number TEXT;
  END IF;

  -- business_registration_file
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'business_registration_file') THEN
    ALTER TABLE user_profiles ADD COLUMN business_registration_file TEXT;
  END IF;

  -- verification_status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'verification_status') THEN
    ALTER TABLE user_profiles ADD COLUMN verification_status TEXT DEFAULT 'pending';
  END IF;

  -- onboarding_complete
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'onboarding_complete') THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_complete BOOLEAN DEFAULT FALSE;
  END IF;

  -- role
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
    ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'buyer';
  END IF;

  -- subscription_plan
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'subscription_plan') THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_plan TEXT DEFAULT 'FREE';
  END IF;

  -- subscription_status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'subscription_status') THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_status TEXT DEFAULT 'active';
  END IF;
  
  RAISE NOTICE 'user_profiles updated successfully';
END $$;

-- ============================================
-- 2. services 테이블에 JobsClass 필드 추가
-- ============================================

DO $$
BEGIN
  -- category
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'category') THEN
    ALTER TABLE services ADD COLUMN category TEXT;
  END IF;

  -- subcategory
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'subcategory') THEN
    ALTER TABLE services ADD COLUMN subcategory TEXT;
  END IF;

  -- service_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'service_type') THEN
    ALTER TABLE services ADD COLUMN service_type TEXT;
  END IF;

  -- slug
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'slug') THEN
    ALTER TABLE services ADD COLUMN slug TEXT;
  END IF;

  -- features
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'features') THEN
    ALTER TABLE services ADD COLUMN features TEXT[];
  END IF;

  -- requirements
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'requirements') THEN
    ALTER TABLE services ADD COLUMN requirements TEXT[];
  END IF;

  -- deliverables
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'deliverables') THEN
    ALTER TABLE services ADD COLUMN deliverables TEXT[];
  END IF;

  -- curriculum
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'curriculum') THEN
    ALTER TABLE services ADD COLUMN curriculum JSONB;
  END IF;

  -- duration_hours
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'duration_hours') THEN
    ALTER TABLE services ADD COLUMN duration_hours INTEGER;
  END IF;

  -- duration_days
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'duration_days') THEN
    ALTER TABLE services ADD COLUMN duration_days INTEGER;
  END IF;

  -- original_price
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'original_price') THEN
    ALTER TABLE services ADD COLUMN original_price NUMERIC(12, 2);
  END IF;

  -- currency
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'currency') THEN
    ALTER TABLE services ADD COLUMN currency TEXT DEFAULT 'KRW';
  END IF;

  -- view_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'view_count') THEN
    ALTER TABLE services ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;

  -- purchase_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'purchase_count') THEN
    ALTER TABLE services ADD COLUMN purchase_count INTEGER DEFAULT 0;
  END IF;

  -- rating_average
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'rating_average') THEN
    ALTER TABLE services ADD COLUMN rating_average NUMERIC(3, 2) DEFAULT 0.0;
  END IF;

  -- rating_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'rating_count') THEN
    ALTER TABLE services ADD COLUMN rating_count INTEGER DEFAULT 0;
  END IF;

  -- partner_id (기존에 user_id로 되어있을 수 있음)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'partner_id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'user_id') THEN
      ALTER TABLE services RENAME COLUMN user_id TO partner_id;
      RAISE NOTICE 'user_id renamed to partner_id';
    ELSE
      ALTER TABLE services ADD COLUMN partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;

  RAISE NOTICE 'services table updated successfully';
END $$;

-- Indexes for services
CREATE INDEX IF NOT EXISTS idx_services_partner_id ON services(partner_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_service_type ON services(service_type);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_title_search ON services USING gin(to_tsvector('english', title));

-- ============================================
-- 3. carts 테이블 업데이트
-- ============================================

DO $$
BEGIN
  -- service_id가 없으면 추가 (product_id → service_id)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carts' AND column_name = 'service_id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carts' AND column_name = 'product_id') THEN
      ALTER TABLE carts RENAME COLUMN product_id TO service_id;
      RAISE NOTICE 'carts: product_id renamed to service_id';
    ELSE
      ALTER TABLE carts ADD COLUMN service_id UUID REFERENCES services(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- client_id가 없으면 추가 (user_id → client_id)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carts' AND column_name = 'client_id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carts' AND column_name = 'user_id') THEN
      ALTER TABLE carts RENAME COLUMN user_id TO client_id;
      RAISE NOTICE 'carts: user_id renamed to client_id';
    ELSE
      ALTER TABLE carts ADD COLUMN client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;

  RAISE NOTICE 'carts table updated successfully';
END $$;

CREATE INDEX IF NOT EXISTS idx_carts_client_id ON carts(client_id);
CREATE INDEX IF NOT EXISTS idx_carts_service_id ON carts(service_id);

-- ============================================
-- 4. orders 테이블 업데이트 (10% 수수료)
-- ============================================

DO $$
BEGIN
  -- service_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'service_id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'product_id') THEN
      ALTER TABLE orders RENAME COLUMN product_id TO service_id;
      RAISE NOTICE 'orders: product_id renamed to service_id';
    ELSE
      ALTER TABLE orders ADD COLUMN service_id UUID REFERENCES services(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- client_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'client_id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'buyer_id') THEN
      ALTER TABLE orders RENAME COLUMN buyer_id TO client_id;
    END IF;
  END IF;

  -- partner_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'partner_id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'seller_id') THEN
      ALTER TABLE orders RENAME COLUMN seller_id TO partner_id;
    ELSE
      ALTER TABLE orders ADD COLUMN partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- platform_fee (10%)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'platform_fee') THEN
    ALTER TABLE orders ADD COLUMN platform_fee NUMERIC(12, 2) DEFAULT 0;
  END IF;

  -- partner_amount (90%)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'partner_amount') THEN
    ALTER TABLE orders ADD COLUMN partner_amount NUMERIC(12, 2) DEFAULT 0;
  END IF;

  -- order_number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_number') THEN
    ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE;
  END IF;

  RAISE NOTICE 'orders table updated successfully';
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_id ON orders(service_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- ============================================
-- 5. service_reviews 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_reviews_service_id ON service_reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_service_reviews_buyer_id ON service_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_service_reviews_created_at ON service_reviews(created_at DESC);

-- ============================================
-- 6. RLS 정책
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;

-- user_profiles
DROP POLICY IF EXISTS "Public profiles are viewable" ON user_profiles;
CREATE POLICY "Public profiles are viewable" ON user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- services
DROP POLICY IF EXISTS "Public services viewable" ON services;
CREATE POLICY "Public services viewable" ON services FOR SELECT USING (is_published = true OR partner_id = auth.uid());

DROP POLICY IF EXISTS "Partners manage own services" ON services;
CREATE POLICY "Partners manage own services" ON services FOR ALL USING (partner_id = auth.uid()) WITH CHECK (partner_id = auth.uid());

-- carts
DROP POLICY IF EXISTS "Users manage own cart" ON carts;
CREATE POLICY "Users manage own cart" ON carts FOR ALL USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

-- orders
DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (client_id = auth.uid() OR partner_id = auth.uid());

DROP POLICY IF EXISTS "Users create orders" ON orders;
CREATE POLICY "Users create orders" ON orders FOR INSERT WITH CHECK (client_id = auth.uid());

-- service_reviews
DROP POLICY IF EXISTS "Public reviews viewable" ON service_reviews;
CREATE POLICY "Public reviews viewable" ON service_reviews FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Buyers manage own reviews" ON service_reviews;
CREATE POLICY "Buyers manage own reviews" ON service_reviews FOR ALL USING (buyer_id = auth.uid()) WITH CHECK (buyer_id = auth.uid());

-- ============================================
-- 완료
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'JobsClass Integration Complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Updated:';
  RAISE NOTICE '  - user_profiles: 9 fields added';
  RAISE NOTICE '  - services: JobsClass v2.0 fields added';
  RAISE NOTICE '  - carts: product_id renamed to service_id';
  RAISE NOTICE '  - orders: 10%% commission fields added';
  RAISE NOTICE '  - service_reviews: created';
  RAISE NOTICE '';
END $$;
