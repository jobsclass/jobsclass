-- ============================================
-- Supabase 완전 초기화 및 재생성
-- ============================================

-- 1. 모든 정책 삭제
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Partners can view own profile" ON ' || r.tablename || ' CASCADE';
        EXECUTE 'DROP POLICY IF EXISTS "Partners can insert own profile" ON ' || r.tablename || ' CASCADE';
        EXECUTE 'DROP POLICY IF EXISTS "Partners can update own profile" ON ' || r.tablename || ' CASCADE';
        EXECUTE 'DROP POLICY IF EXISTS "Public can view published partner profiles" ON ' || r.tablename || ' CASCADE';
        EXECUTE 'DROP POLICY IF EXISTS "Partners can manage own services" ON ' || r.tablename || ' CASCADE';
        EXECUTE 'DROP POLICY IF EXISTS "Public can view published services" ON ' || r.tablename || ' CASCADE';
        EXECUTE 'DROP POLICY IF EXISTS "Partners can manage own course videos" ON ' || r.tablename || ' CASCADE';
        EXECUTE 'DROP POLICY IF EXISTS "Partners can view own orders" ON ' || r.tablename || ' CASCADE';
        EXECUTE 'DROP POLICY IF EXISTS "Partners can manage own coupons" ON ' || r.tablename || ' CASCADE';
    END LOOP;
END $$;

-- 2. 모든 테이블 삭제
DROP TABLE IF EXISTS refund_requests CASCADE;
DROP TABLE IF EXISTS coupon_usage CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS buyers CASCADE;
DROP TABLE IF EXISTS course_videos CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS partner_profiles CASCADE;

-- 3. UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 테이블 생성
-- ============================================

-- partner_profiles
CREATE TABLE partner_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  profile_url TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'FREE',
  early_bird BOOLEAN DEFAULT FALSE,
  early_bird_applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_partner_profiles_user_id ON partner_profiles(user_id);
CREATE INDEX idx_partner_profiles_profile_url ON partner_profiles(profile_url);

-- services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  category_1 TEXT,
  category_2 TEXT,
  tags JSONB,
  base_price NUMERIC(12, 2),
  discount_price NUMERIC(12, 2),
  instructor_name TEXT NOT NULL,
  instructor_bio TEXT,
  thumbnail_url TEXT,
  curriculum JSONB,
  schedule JSONB,
  requirements TEXT[],
  expected_outcomes TEXT[],
  portfolio_images TEXT[],
  channel_stats JSONB,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, slug)
);

CREATE INDEX idx_services_partner_id ON services(partner_id);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_is_published ON services(is_published);

-- course_videos
CREATE TABLE course_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  vimeo_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_course_videos_service_id ON course_videos(service_id);

-- buyers
CREATE TABLE buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, email)
);

CREATE INDEX idx_buyers_partner_id ON buyers(partner_id);

-- carts
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(buyer_id, service_id)
);

CREATE INDEX idx_carts_buyer_id ON carts(buyer_id);

-- orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  final_amount NUMERIC(12, 2) NOT NULL,
  coupon_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_partner_id ON orders(partner_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);

-- enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  started_watching BOOLEAN DEFAULT FALSE,
  progress JSONB,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id, service_id, buyer_id)
);

CREATE INDEX idx_enrollments_buyer_id ON enrollments(buyer_id);

-- coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC(12, 2) NOT NULL,
  min_purchase_amount NUMERIC(12, 2),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, code)
);

CREATE INDEX idx_coupons_partner_id ON coupons(partner_id);

-- coupon_usage
CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);

-- refund_requests
CREATE TABLE refund_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refund_requests_order_id ON refund_requests(order_id);

-- ============================================
-- RLS 비활성화 (일단 개발 단계에서는 끄기)
-- ============================================
ALTER TABLE partner_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE buyers DISABLE ROW LEVEL SECURITY;
ALTER TABLE carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 스키마 새로고침
-- ============================================
NOTIFY pgrst, 'reload schema';

-- ============================================
-- 확인
-- ============================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = tables.table_name) as column_count
FROM information_schema.tables tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;
