-- ============================================
-- JobsClass Safe Migration
-- 기존 테이블 구조 확인 후 안전하게 업데이트
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- 1. user_profiles 테이블 업데이트
-- ============================================

DO $$ 
BEGIN
  -- Ensure user_profiles exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    CREATE TABLE user_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      display_name TEXT,
      email TEXT,
      username TEXT UNIQUE,
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;

  -- Add missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'business_number') THEN
    ALTER TABLE user_profiles ADD COLUMN business_number TEXT;
    RAISE NOTICE '✅ Added business_number';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'business_registration_file') THEN
    ALTER TABLE user_profiles ADD COLUMN business_registration_file TEXT;
    RAISE NOTICE '✅ Added business_registration_file';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'verification_status') THEN
    ALTER TABLE user_profiles ADD COLUMN verification_status TEXT DEFAULT 'pending';
    RAISE NOTICE '✅ Added verification_status';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'onboarding_complete') THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_complete BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ Added onboarding_complete';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
    ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'buyer';
    RAISE NOTICE '✅ Added role';
  END IF;
END $$;

-- Indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_number ON user_profiles(business_number);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_status ON user_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- ============================================
-- 2. services 테이블 처리
-- ============================================

DO $$
BEGIN
  -- Check if services table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services') THEN
    RAISE NOTICE 'services table already exists, updating...';
    
    -- Add missing columns to existing services table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'category') THEN
      ALTER TABLE services ADD COLUMN category TEXT;
      RAISE NOTICE '✅ Added category to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'subcategory') THEN
      ALTER TABLE services ADD COLUMN subcategory TEXT;
      RAISE NOTICE '✅ Added subcategory to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'service_type') THEN
      ALTER TABLE services ADD COLUMN service_type TEXT;
      RAISE NOTICE '✅ Added service_type to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'slug') THEN
      ALTER TABLE services ADD COLUMN slug TEXT;
      RAISE NOTICE '✅ Added slug to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'features') THEN
      ALTER TABLE services ADD COLUMN features TEXT[];
      RAISE NOTICE '✅ Added features to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'requirements') THEN
      ALTER TABLE services ADD COLUMN requirements TEXT[];
      RAISE NOTICE '✅ Added requirements to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'deliverables') THEN
      ALTER TABLE services ADD COLUMN deliverables TEXT[];
      RAISE NOTICE '✅ Added deliverables to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'curriculum') THEN
      ALTER TABLE services ADD COLUMN curriculum JSONB;
      RAISE NOTICE '✅ Added curriculum to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'duration_hours') THEN
      ALTER TABLE services ADD COLUMN duration_hours INTEGER;
      RAISE NOTICE '✅ Added duration_hours to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'duration_days') THEN
      ALTER TABLE services ADD COLUMN duration_days INTEGER;
      RAISE NOTICE '✅ Added duration_days to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'original_price') THEN
      ALTER TABLE services ADD COLUMN original_price NUMERIC(12, 2);
      RAISE NOTICE '✅ Added original_price to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'currency') THEN
      ALTER TABLE services ADD COLUMN currency TEXT DEFAULT 'KRW';
      RAISE NOTICE '✅ Added currency to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'view_count') THEN
      ALTER TABLE services ADD COLUMN view_count INTEGER DEFAULT 0;
      RAISE NOTICE '✅ Added view_count to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'purchase_count') THEN
      ALTER TABLE services ADD COLUMN purchase_count INTEGER DEFAULT 0;
      RAISE NOTICE '✅ Added purchase_count to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'rating_average') THEN
      ALTER TABLE services ADD COLUMN rating_average NUMERIC(3, 2) DEFAULT 0.0;
      RAISE NOTICE '✅ Added rating_average to services';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'rating_count') THEN
      ALTER TABLE services ADD COLUMN rating_count INTEGER DEFAULT 0;
      RAISE NOTICE '✅ Added rating_count to services';
    END IF;
    
  ELSE
    -- Create new services table
    CREATE TABLE services (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT NOT NULL,
      thumbnail_url TEXT,
      
      category TEXT NOT NULL,
      subcategory TEXT,
      service_type TEXT NOT NULL,
      
      price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
      original_price NUMERIC(12, 2),
      currency TEXT DEFAULT 'KRW',
      
      duration_hours INTEGER,
      duration_days INTEGER,
      
      features TEXT[],
      requirements TEXT[],
      deliverables TEXT[],
      curriculum JSONB,
      
      is_active BOOLEAN DEFAULT TRUE,
      is_published BOOLEAN DEFAULT FALSE,
      
      view_count INTEGER DEFAULT 0,
      purchase_count INTEGER DEFAULT 0,
      rating_average NUMERIC(3, 2) DEFAULT 0.0,
      rating_count INTEGER DEFAULT 0,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    RAISE NOTICE '✅ Created services table';
  END IF;
END $$;

-- Indexes for services
CREATE INDEX IF NOT EXISTS idx_services_partner_id ON services(partner_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_service_type ON services(service_type);
CREATE INDEX IF NOT EXISTS idx_services_published ON services(is_published);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);

-- ============================================
-- 3. carts 테이블
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
-- 4. orders 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  platform_fee NUMERIC(12, 2) NOT NULL CHECK (platform_fee >= 0),
  partner_amount NUMERIC(12, 2) NOT NULL CHECK (partner_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending',
  delivery_started_at TIMESTAMPTZ,
  delivery_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_id ON orders(service_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 5. service_reviews 테이블
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

-- user_profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- services policies
DROP POLICY IF EXISTS "Anyone can view published services" ON services;
CREATE POLICY "Anyone can view published services" ON services FOR SELECT 
  USING (is_published = true OR partner_id = auth.uid());

DROP POLICY IF EXISTS "Partners can manage own services" ON services;
CREATE POLICY "Partners can manage own services" ON services FOR ALL 
  USING (partner_id = auth.uid()) WITH CHECK (partner_id = auth.uid());

-- carts policies
DROP POLICY IF EXISTS "Users can manage own cart" ON carts;
CREATE POLICY "Users can manage own cart" ON carts FOR ALL 
  USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

-- orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT 
  USING (client_id = auth.uid() OR partner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders FOR INSERT 
  WITH CHECK (client_id = auth.uid());

-- service_reviews policies
DROP POLICY IF EXISTS "Anyone can view visible reviews" ON service_reviews;
CREATE POLICY "Anyone can view visible reviews" ON service_reviews FOR SELECT 
  USING (is_visible = true);

DROP POLICY IF EXISTS "Buyers can manage own reviews" ON service_reviews;
CREATE POLICY "Buyers can manage own reviews" ON service_reviews FOR ALL 
  USING (buyer_id = auth.uid()) WITH CHECK (buyer_id = auth.uid());

-- ============================================
-- Success
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ JobsClass Safe Migration Complete! ✅✅✅';
  RAISE NOTICE '';
END $$;
