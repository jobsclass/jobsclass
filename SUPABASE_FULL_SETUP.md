# 🗄️ Supabase 전체 스키마 설정 가이드

## ⚠️ 중요: 이 작업을 반드시 먼저 해야 합니다!

현재 DB에 테이블이 없거나 컬럼이 누락되어 있습니다.
**전체 스키마를 처음부터 실행**해야 합니다.

---

## 📝 Step 1: Supabase 대시보드 열기

1. 브라우저에서 https://supabase.com/dashboard 접속
2. 프로젝트 선택: **pzjedtgqrqcipfmtkoce**

---

## 📝 Step 2: SQL Editor 열기

왼쪽 메뉴에서:
- **SQL Editor** 클릭
- **New query** 버튼 클릭

---

## 📝 Step 3: 전체 스키마 SQL 실행

아래 **전체 SQL**을 복사해서 실행하세요:

```sql
-- ============================================
-- JobsBuild SaaS Platform - Database Schema
-- Phase 1: 웹빌더 SaaS (마켓플레이스 제외)
-- ============================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Partner Profiles (파트너 정보)
-- ============================================
CREATE TABLE IF NOT EXISTS partner_profiles (
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
CREATE INDEX IF NOT EXISTS idx_partner_profiles_user_id ON partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_profile_url ON partner_profiles(profile_url);

-- ============================================
-- 2. Services (서비스 상품)
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- 카테고리 (8개 대분류)
  category_1 TEXT CHECK (
    category_1 IN (
      'it-dev',
      'design-creative',
      'business-marketing',
      'finance-investment',
      'startup-sidejob',
      'life-hobby',
      'self-improvement',
      'consulting'
    )
  ),
  
  -- 세부 분류 (Depth 2)
  category_2 TEXT CHECK (
    category_2 IN (
      'web-dev', 'app-dev', 'data-ai', 'game-dev', 'programming-basics',
      'uiux', 'graphic', 'video', '3d',
      'sns-marketing', 'performance-marketing', 'branding', 'content-creation',
      'stock', 'realestate', 'economy',
      'online-business', 'offline-business', 'freelance',
      'cooking', 'fitness', 'craft', 'pet',
      'language', 'reading', 'psychology', 'career',
      'legal', 'tax', 'labor', 'patent'
    )
  ),
  
  -- 태그 (검색 및 필터링용)
  tags JSONB,
  
  -- 가격
  base_price NUMERIC(12, 2),
  discount_price NUMERIC(12, 2),
  
  -- 기본 정보
  instructor_name TEXT NOT NULL,
  instructor_bio TEXT,
  thumbnail_url TEXT,
  
  -- 추가 정보 (JSONB)
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_services_partner_id ON services(partner_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category_1 ON services(category_1);
CREATE INDEX IF NOT EXISTS idx_services_category_2 ON services(category_2);
CREATE INDEX IF NOT EXISTS idx_services_is_published ON services(is_published);
CREATE INDEX IF NOT EXISTS idx_services_tags ON services USING GIN (tags);

-- ============================================
-- 3. Course Videos (온라인 강의 영상)
-- ============================================
CREATE TABLE IF NOT EXISTS course_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  vimeo_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_videos_service_id ON course_videos(service_id);
CREATE INDEX IF NOT EXISTS idx_course_videos_order ON course_videos(service_id, order_index);

-- ============================================
-- 4. Buyers (구매자 - 파트너별 독립)
-- ============================================
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, email)
);

CREATE INDEX IF NOT EXISTS idx_buyers_partner_id ON buyers(partner_id);
CREATE INDEX IF NOT EXISTS idx_buyers_email ON buyers(partner_id, email);

-- ============================================
-- 5. Carts (장바구니)
-- ============================================
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(buyer_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_carts_buyer_id ON carts(buyer_id);

-- ============================================
-- 6. Orders (주문)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  final_amount NUMERIC(12, 2) NOT NULL,
  coupon_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  payment_method TEXT,
  payment_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ============================================
-- 7. Enrollments (수강 등록)
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
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

CREATE INDEX IF NOT EXISTS idx_enrollments_buyer_id ON enrollments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_service_id ON enrollments(service_id);

-- ============================================
-- 8. Coupons (쿠폰)
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
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

CREATE INDEX IF NOT EXISTS idx_coupons_partner_id ON coupons(partner_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(partner_id, code);

-- ============================================
-- 9. Coupon Usage (쿠폰 사용 이력)
-- ============================================
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_buyer_id ON coupon_usage(buyer_id);

-- ============================================
-- 10. Refund Requests (환불 요청)
-- ============================================
CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refund_requests_order_id ON refund_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);

-- ============================================
-- Functions & Triggers
-- ============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_partner_profiles_updated_at ON partner_profiles;
CREATE TRIGGER update_partner_profiles_updated_at
    BEFORE UPDATE ON partner_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at
    BEFORE UPDATE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_refund_requests_updated_at ON refund_requests;
CREATE TRIGGER update_refund_requests_updated_at
    BEFORE UPDATE ON refund_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (Row Level Security)
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
DROP POLICY IF EXISTS "Partners can view own profile" ON partner_profiles;
CREATE POLICY "Partners can view own profile" ON partner_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Partners can update own profile" ON partner_profiles;
CREATE POLICY "Partners can update own profile" ON partner_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view published partner profiles" ON partner_profiles;
CREATE POLICY "Public can view published partner profiles" ON partner_profiles
    FOR SELECT USING (true);

-- Services Policies
DROP POLICY IF EXISTS "Partners can manage own services" ON services;
CREATE POLICY "Partners can manage own services" ON services
    FOR ALL USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Public can view published services" ON services;
CREATE POLICY "Public can view published services" ON services
    FOR SELECT USING (is_published = true);

-- Course Videos Policies
DROP POLICY IF EXISTS "Partners can manage own course videos" ON course_videos;
CREATE POLICY "Partners can manage own course videos" ON course_videos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM services
            WHERE services.id = course_videos.service_id
            AND services.partner_id = auth.uid()
        )
    );

-- Orders Policies
DROP POLICY IF EXISTS "Partners can view own orders" ON orders;
CREATE POLICY "Partners can view own orders" ON orders
    FOR SELECT USING (auth.uid() = partner_id);

-- Coupons Policies
DROP POLICY IF EXISTS "Partners can manage own coupons" ON coupons;
CREATE POLICY "Partners can manage own coupons" ON coupons
    FOR ALL USING (auth.uid() = partner_id);

-- ============================================
-- 완료!
-- ============================================

-- 검증 쿼리
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = tables.table_name) as column_count
FROM information_schema.tables tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

---

## ✅ 확인 방법

마지막 SELECT 쿼리 결과에서 다음 10개 테이블이 보여야 합니다:
- `buyers`
- `carts`
- `coupon_usage`
- `coupons`
- `course_videos`
- `enrollments`
- `orders`
- `partner_profiles`
- `refund_requests`
- `services`

---

## 🎉 완료!

이제 다시 사이트에서 회원가입을 시도하세요!

---

## 🔧 문제 해결

### Q: "permission denied" 오류가 납니다
A: Supabase 대시보드에 올바른 계정으로 로그인되어 있는지 확인하세요.

### Q: 기존 데이터가 사라질까요?
A: `CREATE TABLE IF NOT EXISTS`를 사용하므로 기존 테이블이 있으면 건너뜁니다.

### Q: 테이블이 이미 있다고 합니다
A: 정상입니다! 그대로 진행하세요.

---

**완료 후 회원가입을 다시 시도하세요!** 🚀
