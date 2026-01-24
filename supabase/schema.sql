-- ============================================
-- Corefy SaaS Platform - Database Schema
-- Phase 1: 웹빌더 SaaS (마켓플레이스 제외)
-- ============================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Partner Profiles (파트너 정보)
-- ============================================
CREATE TABLE partner_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  profile_url TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'FREE' CHECK (subscription_plan IN ('FREE', 'STARTER', 'PRO')),
  early_bird BOOLEAN DEFAULT FALSE,
  early_bird_applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_partner_profiles_user_id ON partner_profiles(user_id);
CREATE INDEX idx_partner_profiles_profile_url ON partner_profiles(profile_url);

-- ============================================
-- 2. Services (서비스 상품)
-- ============================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- 카테고리 (8개 대분류)
  category_1 TEXT NOT NULL CHECK (
    category_1 IN (
      'it-dev',                -- IT·개발
      'design-creative',       -- 디자인·크리에이티브
      'business-marketing',    -- 비즈니스·마케팅
      'finance-investment',    -- 재테크·금융
      'startup-sidejob',       -- 창업·부업
      'life-hobby',            -- 라이프·취미
      'self-improvement',      -- 자기계발·교양
      'consulting'             -- 전문 컨설팅
    )
  ),
  
  -- 세부 분류 (Depth 2)
  category_2 TEXT CHECK (
    category_2 IN (
      -- IT·개발
      'web-dev', 'app-dev', 'data-ai', 'game-dev', 'programming-basics',
      -- 디자인·크리에이티브
      'uiux', 'graphic', 'video', '3d',
      -- 비즈니스·마케팅
      'sns-marketing', 'performance-marketing', 'branding', 'content-creation',
      -- 재테크·금융
      'stock', 'realestate', 'economy',
      -- 창업·부업
      'online-business', 'offline-business', 'freelance',
      -- 라이프·취미
      'cooking', 'fitness', 'craft', 'pet',
      -- 자기계발·교양
      'language', 'reading', 'psychology', 'career',
      -- 전문 컨설팅
      'legal', 'tax', 'labor', 'patent'
    )
  ),
  
  -- 태그 (검색 및 필터링용)
  tags JSONB,
  
  -- 가격 (기본값, pricing 테이블에서 상세 설정)
  base_price NUMERIC(12, 2),
  discount_price NUMERIC(12, 2),
  
  -- 기본 정보
  instructor_name TEXT NOT NULL,
  instructor_bio TEXT,
  thumbnail_url TEXT,
  
  -- 추가 정보 (JSONB)
  curriculum JSONB,              -- 커리큘럼
  schedule JSONB,                -- 일정
  requirements TEXT[],           -- 선수 지식
  expected_outcomes TEXT[],      -- 기대 효과
  portfolio_images TEXT[],       -- 포트폴리오 (전문 서비스용)
  channel_stats JSONB,           -- 채널 통계 (협업용)
  
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, slug)
);

-- Indexes
CREATE INDEX idx_services_partner_id ON services(partner_id);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_category_1 ON services(category_1);
CREATE INDEX idx_services_category_2 ON services(category_2);
CREATE INDEX idx_services_is_published ON services(is_published);

-- ============================================
-- 3. Course Videos (온라인 강의 영상)
-- ============================================
CREATE TABLE course_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  vimeo_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_course_videos_service_id ON course_videos(service_id);
CREATE INDEX idx_course_videos_order ON course_videos(service_id, order_index);

-- ============================================
-- 3-1. Service Pricing (서비스 가격 모델)
-- ============================================
CREATE TABLE service_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE UNIQUE,
  
  -- 가격 모델
  pricing_model TEXT NOT NULL CHECK (
    pricing_model IN ('fixed', 'hourly', 'daily', 'package', 'quote', 'subscription')
  ),
  
  -- 고정가
  fixed_price NUMERIC(12, 2),
  
  -- 시간당/일당
  hourly_rate NUMERIC(12, 2),
  daily_rate NUMERIC(12, 2),
  
  -- 패키지 (JSONB)
  packages JSONB, -- [{ name, price, features[], duration_days }]
  
  -- 구독
  subscription_monthly NUMERIC(12, 2),
  subscription_yearly NUMERIC(12, 2),
  
  -- 추가 정보
  delivery_days INTEGER,
  revisions_included INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_service_pricing_service_id ON service_pricing(service_id);

-- ============================================
-- 4. Buyers (구매자 - 파트너별 독립)
-- ============================================
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

-- Index
CREATE INDEX idx_buyers_partner_id ON buyers(partner_id);
CREATE INDEX idx_buyers_email ON buyers(partner_id, email);

-- ============================================
-- 5. Carts (장바구니)
-- ============================================
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(buyer_id, service_id)
);

-- Index
CREATE INDEX idx_carts_buyer_id ON carts(buyer_id);

-- ============================================
-- 6. Orders (주문)
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  final_amount NUMERIC(12, 2) NOT NULL,
  coupon_id UUID REFERENCES coupons(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'completed', 'cancelled', 'refunded')
  ),
  payment_method TEXT,
  payment_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_partner_id ON orders(partner_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================
-- 7. Enrollments (온라인 강의 수강)
-- ============================================
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  started_watching BOOLEAN DEFAULT FALSE,
  progress JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id, service_id, buyer_id)
);

-- Index
CREATE INDEX idx_enrollments_buyer_id ON enrollments(buyer_id);
CREATE INDEX idx_enrollments_service_id ON enrollments(service_id);

-- ============================================
-- 8. Coupons (쿠폰)
-- ============================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
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

-- Index
CREATE INDEX idx_coupons_partner_id ON coupons(partner_id);
CREATE INDEX idx_coupons_code ON coupons(partner_id, code);

-- ============================================
-- 9. Coupon Usage (쿠폰 사용 내역)
-- ============================================
CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_buyer_id ON coupon_usage(buyer_id);

-- ============================================
-- 10. Refund Requests (환불 요청)
-- ============================================
CREATE TABLE refund_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected')
  ),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_refund_requests_order_id ON refund_requests(order_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_partner_profiles_updated_at BEFORE UPDATE ON partner_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refund_requests_updated_at BEFORE UPDATE ON refund_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Partner Profiles Policies
CREATE POLICY "Partners can view own profile" ON partner_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners can update own profile" ON partner_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published partner profiles" ON partner_profiles
  FOR SELECT USING (true);

-- Services Policies
CREATE POLICY "Partners can manage own services" ON services
  FOR ALL USING (auth.uid() = partner_id);

CREATE POLICY "Anyone can view published services" ON services
  FOR SELECT USING (is_published = true);

-- Course Videos Policies
CREATE POLICY "Partners can manage own course videos" ON course_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM services 
      WHERE services.id = course_videos.service_id 
      AND services.partner_id = auth.uid()
    )
  );

-- Orders Policies
CREATE POLICY "Partners can view own orders" ON orders
  FOR SELECT USING (auth.uid() = partner_id);

-- Coupons Policies
CREATE POLICY "Partners can manage own coupons" ON coupons
  FOR ALL USING (auth.uid() = partner_id);

-- Note: Buyers, Carts, Enrollments will use JWT-based authentication
-- Additional RLS policies will be added in application logic
