-- ============================================
-- Corefy 웹빌더 - 완전한 데이터베이스 스키마
-- 웹사이트 빌더 + 상품 + 블로그 + 포트폴리오 + 고객 관리 + 결제
-- ============================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 사용자 프로필 (확장)
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE, -- URL용 (corefy.com/username)
  avatar_url TEXT,
  job_title TEXT, -- 직함 (예: 프리랜서 디자이너, 마케팅 전문가)
  
  -- 소개
  bio TEXT, -- 자기소개 (에디터)
  tagline TEXT, -- 한 줄 소개
  
  -- 전문 분야
  expertise TEXT[], -- ['웹 디자인', 'UI/UX', '브랜딩']
  
  -- SNS 링크
  social_links JSONB, -- { "instagram": "...", "youtube": "...", "linkedin": "..." }
  
  -- 연락처
  phone TEXT,
  website_url TEXT,
  location TEXT, -- 지역
  
  -- 구독 정보
  subscription_plan TEXT NOT NULL DEFAULT 'FREE' CHECK (subscription_plan IN ('FREE', 'STARTER', 'PRO')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);

-- ============================================
-- 2. 경력 사항
-- ============================================
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL이면 현재 재직중
  is_current BOOLEAN DEFAULT FALSE,
  
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_experiences_user_id ON experiences(user_id);

-- ============================================
-- 3. 학력 사항
-- ============================================
CREATE TABLE educations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  school TEXT NOT NULL,
  degree TEXT, -- 학위 (학사, 석사, 박사)
  field TEXT, -- 전공
  description TEXT,
  start_date DATE,
  end_date DATE,
  
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_educations_user_id ON educations(user_id);

-- ============================================
-- 4. 자격증/수상
-- ============================================
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  issuer TEXT, -- 발급 기관
  issued_date DATE,
  expiry_date DATE, -- 만료일 (NULL이면 무제한)
  credential_id TEXT, -- 자격증 번호
  credential_url TEXT, -- 증명 URL
  
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_certifications_user_id ON certifications(user_id);

-- ============================================
-- 5. 웹사이트 설정
-- ============================================
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  
  -- 섹션 설정
  sections_enabled JSONB NOT NULL DEFAULT '{
    "hero": true,
    "profile": true,
    "products": true,
    "blog": false,
    "portfolio": false,
    "contact": true
  }',
  sections_order TEXT[] DEFAULT ARRAY['hero', 'profile', 'products', 'contact'],
  
  -- 디자인 설정
  settings JSONB NOT NULL DEFAULT '{
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#8B5CF6",
      "accent": "#F59E0B",
      "text": "#1F2937",
      "background": "#FFFFFF"
    },
    "fonts": {
      "heading": "Pretendard",
      "body": "Pretendard"
    },
    "layout": {
      "headerStyle": "fixed",
      "footerStyle": "minimal"
    }
  }',
  
  -- 도메인
  custom_domain TEXT UNIQUE,
  custom_domain_verified BOOLEAN DEFAULT FALSE,
  
  -- 상태
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  og_image_url TEXT,
  
  -- 통계
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_websites_user_id ON websites(user_id);
CREATE INDEX idx_websites_slug ON websites(slug);
CREATE INDEX idx_websites_is_published ON websites(is_published);
CREATE UNIQUE INDEX idx_websites_user_slug ON websites(user_id, slug);

-- ============================================
-- 6. 상품 카테고리
-- ============================================
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_product_categories_user_id ON product_categories(user_id);

-- ============================================
-- 7. 상품
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  
  -- 기본 정보
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  
  -- 문제-해결 정의
  problem_category TEXT, -- '💰 수익 창출', '🚀 비즈니스 성장', etc.
  solution_types TEXT[], -- ['온라인 강의', '전자책', '컨설팅']
  target_customer TEXT,
  
  -- 상세 내용
  content JSONB NOT NULL DEFAULT '{}',
  /*
  content 예시:
  {
    "problem": { "description": "...", "painPoints": ["...", "..."] },
    "solution": { "description": "...", "features": [...] },
    "curriculum": [ { "title": "...", "description": "...", "duration": "..." }, ... ],
    "materials": [ { "type": "video", "url": "...", "title": "..." }, ... ],
    "faq": [ { "question": "...", "answer": "..." }, ... ]
  }
  */
  
  -- 가격 정보
  price INTEGER, -- 원 단위 (NULL이면 무료 또는 문의)
  original_price INTEGER, -- 정가 (할인 표시용)
  currency TEXT DEFAULT 'KRW',
  
  -- 판매 설정
  is_available BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER, -- NULL이면 무제한
  max_purchase INTEGER DEFAULT 1, -- 1인당 최대 구매 수량
  
  -- 기간 설정
  available_from TIMESTAMP WITH TIME ZONE,
  available_until TIMESTAMP WITH TIME ZONE,
  
  -- 상태
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- 통계
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  
  -- 순서
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_published ON products(is_published);
CREATE INDEX idx_products_slug ON products(slug);

-- ============================================
-- 8. 블로그 카테고리
-- ============================================
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_blog_categories_user_id ON blog_categories(user_id);

-- ============================================
-- 9. 블로그 포스트
-- ============================================
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  
  -- 기본 정보
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT, -- 요약
  content TEXT NOT NULL, -- 에디터 내용 (HTML)
  featured_image_url TEXT,
  
  -- 태그
  tags TEXT[],
  
  -- 상태
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  -- 통계
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- ============================================
-- 10. 포트폴리오 카테고리
-- ============================================
CREATE TABLE portfolio_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_portfolio_categories_user_id ON portfolio_categories(user_id);

-- ============================================
-- 11. 포트폴리오
-- ============================================
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES portfolio_categories(id) ON DELETE SET NULL,
  
  -- 기본 정보
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  
  -- 이미지/미디어
  media JSONB, -- [{ "type": "image", "url": "...", "caption": "..." }, ...]
  
  -- 프로젝트 정보
  client TEXT, -- 클라이언트
  project_date DATE,
  project_duration TEXT, -- "3개월"
  project_url TEXT, -- 외부 링크
  
  -- 기술/도구
  technologies TEXT[], -- ['Figma', 'Photoshop', 'Illustrator']
  
  -- 상태
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- 순서
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_category_id ON portfolios(category_id);
CREATE INDEX idx_portfolios_is_published ON portfolios(is_published);

-- ============================================
-- 12. 고객 (구매자)
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 판매자
  
  -- 기본 정보
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  
  -- 추가 정보
  notes TEXT, -- 메모
  tags TEXT[], -- ['VIP', '리뷰 작성']
  
  -- 통계
  total_orders INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(seller_id, email)
);

CREATE INDEX idx_customers_seller_id ON customers(seller_id);
CREATE INDEX idx_customers_email ON customers(email);

-- ============================================
-- 13. 문의
-- ============================================
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 판매자
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- 기본 정보
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'closed')),
  
  -- 답변
  reply TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  
  -- 메타데이터
  source TEXT, -- 'website', 'email', 'phone'
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inquiries_seller_id ON inquiries(seller_id);
CREATE INDEX idx_inquiries_customer_id ON inquiries(customer_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- ============================================
-- 14. 주문
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 판매자
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- 주문 번호
  order_number TEXT NOT NULL UNIQUE, -- 'ORD-20260125-001'
  
  -- 주문 상품
  items JSONB NOT NULL, -- [{ "product_id": "...", "title": "...", "price": 99000, "quantity": 1 }, ...]
  
  -- 금액
  subtotal INTEGER NOT NULL, -- 소계
  discount INTEGER DEFAULT 0, -- 할인
  total INTEGER NOT NULL, -- 최종 금액
  currency TEXT DEFAULT 'KRW',
  
  -- 쿠폰
  coupon_code TEXT,
  
  -- 구매자 정보
  buyer_info JSONB, -- { "name": "...", "email": "...", "phone": "..." }
  
  -- 주문 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- 대기
    'paid',         -- 결제 완료
    'processing',   -- 처리 중
    'completed',    -- 완료
    'cancelled',    -- 취소
    'refunded'      -- 환불
  )),
  
  -- 결제 정보
  payment_method TEXT, -- 'card', 'bank_transfer', 'kakaopay', etc.
  payment_id TEXT, -- 외부 결제 ID (Toss)
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- 환불
  refund_amount INTEGER,
  refund_reason TEXT,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- ============================================
-- 15. 환불 요청
-- ============================================
CREATE TABLE refund_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  reason TEXT NOT NULL,
  amount INTEGER NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  admin_note TEXT, -- 관리자 메모
  processed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refund_requests_order_id ON refund_requests(order_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);

-- ============================================
-- 16. 쿠폰
-- ============================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- 할인 설정
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  max_discount INTEGER, -- 최대 할인 금액 (percentage일 때)
  
  -- 사용 조건
  min_purchase INTEGER, -- 최소 구매 금액
  applicable_products UUID[], -- 적용 가능한 상품 (NULL이면 전체)
  
  -- 사용 제한
  max_uses INTEGER, -- 총 사용 횟수 제한 (NULL이면 무제한)
  max_uses_per_customer INTEGER DEFAULT 1, -- 1인당 사용 횟수
  current_uses INTEGER DEFAULT 0,
  
  -- 기간
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- 상태
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupons_user_id ON coupons(user_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);

-- ============================================
-- 17. 쿠폰 사용 내역
-- ============================================
CREATE TABLE coupon_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  discount_amount INTEGER NOT NULL,
  
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_order_id ON coupon_usages(order_id);
CREATE INDEX idx_coupon_usages_customer_id ON coupon_usages(customer_id);

-- ============================================
-- 18. 방문 통계
-- ============================================
CREATE TABLE website_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 방문 정보
  visitor_id TEXT, -- 익명 ID (쿠키 기반)
  session_id TEXT,
  
  -- 경로
  page_type TEXT, -- 'home', 'product', 'blog', 'portfolio'
  page_id UUID, -- 상품/블로그/포트폴리오 ID
  page_path TEXT NOT NULL,
  referrer TEXT,
  
  -- 디바이스
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  os TEXT,
  
  -- 위치
  country TEXT,
  city TEXT,
  
  -- 시간
  duration_seconds INTEGER,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_website_analytics_user_id ON website_analytics(user_id);
CREATE INDEX idx_website_analytics_visited_at ON website_analytics(visited_at);
CREATE INDEX idx_website_analytics_page_type ON website_analytics(page_type);

-- ============================================
-- 19. 구독 관리
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  plan TEXT NOT NULL CHECK (plan IN ('FREE', 'STARTER', 'PRO')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  
  -- 결제 정보 (Toss)
  payment_provider TEXT DEFAULT 'toss',
  subscription_id TEXT UNIQUE, -- 외부 구독 ID
  customer_id TEXT, -- 외부 고객 ID
  
  -- 기간
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- 가격
  amount INTEGER NOT NULL, -- 원 단위
  currency TEXT DEFAULT 'KRW',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- 20. 결제 내역
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- 결제 정보
  payment_provider TEXT NOT NULL DEFAULT 'toss',
  payment_id TEXT UNIQUE NOT NULL, -- 외부 결제 ID
  
  -- 금액
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KRW',
  
  -- 상태
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  
  -- 메타데이터
  metadata JSONB,
  
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_payment_id ON payments(payment_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 모든 테이블에 트리거 적용
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educations_updated_at BEFORE UPDATE ON educations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (Row Level Security) - 추후 활성화
-- ============================================
-- 모든 테이블에 RLS 정책 설정 필요
