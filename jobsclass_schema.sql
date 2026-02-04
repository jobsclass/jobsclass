-- ============================================
-- JobsClass - 지식서비스 마켓플레이스 데이터베이스 스키마
-- 파트너와 클라이언트를 매칭하고 10% 수수료를 쉐어하는 구조
-- ============================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Partner Profiles (파트너/전문가 정보)
-- ============================================
CREATE TABLE partner_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  display_name TEXT NOT NULL,
  profile_url TEXT NOT NULL UNIQUE,  -- jobsclass.kr/partners/username
  bio TEXT,
  avatar_url TEXT,
  
  -- 통계
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  total_sales NUMERIC(12,2) DEFAULT 0,
  service_count INTEGER DEFAULT 0,
  
  -- 인증 상태
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partner_profiles_user_id ON partner_profiles(user_id);
CREATE INDEX idx_partner_profiles_profile_url ON partner_profiles(profile_url);
CREATE INDEX idx_partner_profiles_rating ON partner_profiles(rating DESC);

-- ============================================
-- 2. Services (지식서비스 상품)
-- ============================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- 카테고리 (JobsClass 8개 대분류 유지)
  category TEXT NOT NULL CHECK (
    category IN (
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
  
  -- 세부 카테고리 (JobsClass 세부 분류 유지)
  subcategory TEXT,
  
  -- 서비스 타입 (JobsClass 7가지 유형 유지)
  service_type TEXT NOT NULL CHECK (
    service_type IN (
      'online-course',         -- 온라인 강의
      'coaching',              -- 1:1 코칭/멘토링
      'consulting',            -- 컨설팅
      'ebook',                 -- 전자책
      'template',              -- 템플릿/도구
      'service',               -- 전문 서비스 (디자인, 개발 등)
      'community'              -- 커뮤니티/멤버십
    )
  ),
  
  -- 가격 정보
  price NUMERIC(12,2) NOT NULL,
  original_price NUMERIC(12,2),       -- 정가 (할인 표시용)
  currency TEXT DEFAULT 'KRW',
  
  -- 서비스 기간/형태
  duration_hours INTEGER,              -- 시간 단위 (코칭, 컨설팅)
  duration_days INTEGER,               -- 일 단위 (강의, 멤버십)
  
  -- 상세 정보
  features TEXT[],                     -- 포함 내용
  requirements TEXT[],                 -- 요구사항/선수지식
  deliverables TEXT[],                 -- 제공물
  curriculum JSONB,                    -- 커리큘럼 (강의용)
  
  -- 상태
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  -- 통계
  views_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(partner_id, slug)
);

CREATE INDEX idx_services_partner_id ON services(partner_id);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_service_type ON services(service_type);
CREATE INDEX idx_services_is_published ON services(is_published);
CREATE INDEX idx_services_rating ON services(rating DESC);
CREATE INDEX idx_services_price ON services(price);

-- ============================================
-- 3. Clients (구매자/클라이언트)
-- ============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 기본 정보
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_email ON clients(email);

-- ============================================
-- 4. Orders (주문)
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  
  -- 관계
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- 금액 (10% 수수료 구조)
  amount NUMERIC(12,2) NOT NULL,              -- 원래 금액
  platform_fee NUMERIC(12,2) NOT NULL,        -- 플랫폼 수수료 (10%)
  partner_amount NUMERIC(12,2) NOT NULL,      -- 파트너 정산 금액 (90%)
  
  -- 주문 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',         -- 결제 대기
      'paid',            -- 결제 완료
      'confirmed',       -- 파트너 확인
      'in_progress',     -- 진행중
      'completed',       -- 완료
      'cancelled',       -- 취소
      'refunded'         -- 환불
    )
  ),
  
  -- 결제 정보
  payment_method TEXT,
  payment_key TEXT,                           -- Toss Payments Key
  paid_at TIMESTAMPTZ,
  
  -- 진행 상태
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_partner_id ON orders(partner_id);
CREATE INDEX idx_orders_service_id ON orders(service_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 5. Service Reviews (서비스 리뷰)
-- ============================================
CREATE TABLE service_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 관계
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 리뷰 내용
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  -- 상태
  is_public BOOLEAN DEFAULT true,
  is_reported BOOLEAN DEFAULT false,
  report_reason TEXT,
  
  -- 파트너 답글
  partner_reply TEXT,
  partner_replied_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(order_id)  -- 주문당 1개의 리뷰만
);

CREATE INDEX idx_service_reviews_service_id ON service_reviews(service_id);
CREATE INDEX idx_service_reviews_client_id ON service_reviews(client_id);
CREATE INDEX idx_service_reviews_partner_id ON service_reviews(partner_id);
CREATE INDEX idx_service_reviews_rating ON service_reviews(rating DESC);
CREATE INDEX idx_service_reviews_created_at ON service_reviews(created_at DESC);

-- ============================================
-- 6. Carts (장바구니)
-- ============================================
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(client_id, service_id)
);

CREATE INDEX idx_carts_client_id ON carts(client_id);

-- ============================================
-- 7. Notifications (알림)
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 수신자
  user_id UUID NOT NULL,                      -- partner_id or client_id
  user_type TEXT NOT NULL CHECK (user_type IN ('partner', 'client')),
  
  -- 알림 내용
  type TEXT NOT NULL CHECK (
    type IN (
      'order_new',           -- 새 주문
      'order_confirmed',     -- 주문 확인
      'order_completed',     -- 주문 완료
      'order_cancelled',     -- 주문 취소
      'review_new',          -- 새 리뷰
      'review_reply',        -- 리뷰 답글
      'payment_success',     -- 결제 성공
      'payment_failed'       -- 결제 실패
    )
  ),
  title TEXT NOT NULL,
  message TEXT,
  link_url TEXT,
  
  -- 상태
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_type ON notifications(user_type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 8. Payouts (정산)
-- ============================================
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- 정산 금액
  amount NUMERIC(12,2) NOT NULL,              -- 정산 금액
  order_ids UUID[],                            -- 포함된 주문 IDs
  
  -- 정산 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',         -- 대기
      'processing',      -- 처리중
      'completed',       -- 완료
      'failed'           -- 실패
    )
  ),
  
  -- 계좌 정보
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  
  -- 처리 정보
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- 관리자 메모
  admin_note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payouts_partner_id ON payouts(partner_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_requested_at ON payouts(requested_at DESC);

-- ============================================
-- 9. Coupons (쿠폰) - Phase 2
-- ============================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 쿠폰 정보
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12,2) NOT NULL,
  
  -- 사용 조건
  min_purchase_amount NUMERIC(12,2),
  max_usage_count INTEGER,
  current_usage_count INTEGER DEFAULT 0,
  
  -- 유효기간
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  
  -- 상태
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(partner_id, code)
);

CREATE INDEX idx_coupons_partner_id ON coupons(partner_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_valid_until ON coupons(valid_until);

-- ============================================
-- 트리거: 서비스 통계 업데이트
-- ============================================

-- 주문 완료 시 서비스 주문 수 증가
CREATE OR REPLACE FUNCTION update_service_orders_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE services 
    SET orders_count = orders_count + 1,
        updated_at = NOW()
    WHERE id = NEW.service_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_orders_count
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_service_orders_count();

-- 리뷰 작성 시 서비스 평점 업데이트
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(2,1);
  review_cnt INTEGER;
BEGIN
  SELECT AVG(rating)::DECIMAL(2,1), COUNT(*)
  INTO avg_rating, review_cnt
  FROM service_reviews
  WHERE service_id = NEW.service_id AND is_public = true;
  
  UPDATE services
  SET rating = avg_rating,
      review_count = review_cnt,
      updated_at = NOW()
  WHERE id = NEW.service_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_rating
AFTER INSERT OR UPDATE ON service_reviews
FOR EACH ROW
EXECUTE FUNCTION update_service_rating();

-- 리뷰 작성 시 파트너 평점 업데이트
CREATE OR REPLACE FUNCTION update_partner_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(2,1);
  review_cnt INTEGER;
BEGIN
  SELECT AVG(rating)::DECIMAL(2,1), COUNT(*)
  INTO avg_rating, review_cnt
  FROM service_reviews
  WHERE partner_id = NEW.partner_id AND is_public = true;
  
  UPDATE partner_profiles
  SET rating = avg_rating,
      review_count = review_cnt,
      updated_at = NOW()
  WHERE user_id = NEW.partner_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partner_rating
AFTER INSERT OR UPDATE ON service_reviews
FOR EACH ROW
EXECUTE FUNCTION update_partner_rating();

-- ============================================
-- RLS (Row Level Security) 정책 - 추후 추가
-- ============================================

-- 파트너는 자신의 데이터만 접근
-- ALTER TABLE services ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY partner_services_policy ON services
--   FOR ALL USING (partner_id = auth.uid());

-- 클라이언트는 자신의 데이터만 접근
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY client_orders_policy ON orders
--   FOR ALL USING (client_id = auth.uid());

-- ============================================
-- 초기 데이터 (테스트용)
-- ============================================

-- 샘플 데이터는 별도 파일로 관리
