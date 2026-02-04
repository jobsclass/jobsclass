-- ============================================
-- JobsClass Integration Migration
-- 기존 스키마 + 새로운 JobsClass v2.0 스키마 통합
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- 1. user_profiles 테이블 업데이트 (기존 유지 + 추가)
-- ============================================

DO $$ 
BEGIN
  -- business_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'business_number'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN business_number TEXT;
  END IF;

  -- business_registration_file
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'business_registration_file'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN business_registration_file TEXT;
  END IF;

  -- verification_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN verification_status TEXT DEFAULT 'pending';
  END IF;

  -- onboarding_complete
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'onboarding_complete'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_complete BOOLEAN DEFAULT FALSE;
  END IF;

  -- role (partner/buyer/admin)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'buyer';
  END IF;
END $$;

-- Indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_number ON user_profiles(business_number);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_status ON user_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- ============================================
-- 2. services 테이블 생성 (JobsClass v2.0)
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
-- 4. orders 테이블 생성/업데이트
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    CREATE TABLE orders (
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
    
    CREATE INDEX idx_orders_client_id ON orders(client_id);
    CREATE INDEX idx_orders_partner_id ON orders(partner_id);
    CREATE INDEX idx_orders_service_id ON orders(service_id);
    CREATE INDEX idx_orders_status ON orders(status);
    CREATE INDEX idx_orders_order_number ON orders(order_number);
    CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
  END IF;
END $$;

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
-- 6. updated_at 트리거
-- ============================================

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
-- 7. RLS 정책
-- ============================================

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
-- Success
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ JobsClass Integration Migration Complete! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE 'Updated Tables:';
  RAISE NOTICE '  - user_profiles (added business fields)';
  RAISE NOTICE '';
  RAISE NOTICE 'New Tables:';
  RAISE NOTICE '  - services';
  RAISE NOTICE '  - carts';
  RAISE NOTICE '  - orders';
  RAISE NOTICE '  - service_reviews';
  RAISE NOTICE '';
END $$;
