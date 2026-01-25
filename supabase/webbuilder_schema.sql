-- ============================================
-- Corefy 웹빌더 - Database Schema
-- AI 기반 1분 완성 웹사이트 빌더
-- ============================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Users (유저 정보)
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE, -- URL용 (corefy.com/username)
  avatar_url TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'FREE' CHECK (subscription_plan IN ('FREE', 'STARTER', 'PRO')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);

-- ============================================
-- 2. Templates (템플릿)
-- ============================================
CREATE TABLE templates (
  id TEXT PRIMARY KEY, -- 'modern', 'minimal', 'creative', etc.
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  category TEXT, -- 'business', 'portfolio', 'cafe', etc.
  is_premium BOOLEAN DEFAULT FALSE,
  schema JSONB NOT NULL, -- 섹션 구조 정의
  /*
  schema 예시:
  {
    "sections": [
      { "id": "hero", "required": true, "fields": ["title", "subtitle", "image", "cta"] },
      { "id": "about", "required": false, "fields": ["text", "image"] },
      { "id": "services", "required": false, "fields": ["items"] },
      { "id": "contact", "required": true, "fields": ["email", "phone", "social"] }
    ]
  }
  */
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. Websites (웹사이트)
-- ============================================
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES templates(id),
  
  -- 기본 정보
  title TEXT NOT NULL,
  slug TEXT NOT NULL, -- my-cafe (username/slug)
  description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  
  -- 콘텐츠 (JSONB)
  content JSONB NOT NULL DEFAULT '{}',
  /*
  content 예시:
  {
    "hero": {
      "title": "Welcome to My Cafe",
      "subtitle": "Best coffee in town",
      "image": "https://...",
      "cta": { "text": "Order Now", "link": "/menu" }
    },
    "about": {
      "text": "We are...",
      "image": "https://..."
    },
    "services": [
      { "title": "Espresso", "description": "...", "icon": "coffee", "price": "₩4,000" },
      { "title": "Latte", "description": "...", "icon": "coffee", "price": "₩4,500" }
    ],
    "contact": {
      "email": "hello@mycafe.com",
      "phone": "010-1234-5678",
      "address": "서울시 강남구...",
      "social": {
        "instagram": "mycafe_official",
        "facebook": "mycafe",
        "youtube": "mycafe_channel"
      }
    }
  }
  */
  
  -- 디자인 설정
  settings JSONB NOT NULL DEFAULT '{}',
  /*
  settings 예시:
  {
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
  }
  */
  
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

-- Index
CREATE INDEX idx_websites_user_id ON websites(user_id);
CREATE INDEX idx_websites_slug ON websites(slug);
CREATE INDEX idx_websites_custom_domain ON websites(custom_domain);
CREATE INDEX idx_websites_is_published ON websites(is_published);
CREATE UNIQUE INDEX idx_websites_user_slug ON websites(user_id, slug);

-- ============================================
-- 4. AI Generations (AI 생성 기록)
-- ============================================
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  
  -- AI 생성 타입
  generation_type TEXT NOT NULL CHECK (generation_type IN (
    'copy',        -- 카피라이팅
    'colors',      -- 색상 팔레트
    'images',      -- 이미지 추천
    'layout',      -- 레이아웃 추천
    'seo'          -- SEO 최적화
  )),
  
  -- 입력/출력
  input JSONB NOT NULL,  -- 사용자 입력
  output JSONB NOT NULL, -- AI 생성 결과
  
  -- 모델 정보
  model TEXT NOT NULL, -- 'gemini-pro', 'gemini-flash', etc.
  tokens_used INTEGER,
  
  -- 사용 여부
  is_applied BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_generations_website_id ON ai_generations(website_id);

-- ============================================
-- 5. Analytics (방문 통계)
-- ============================================
CREATE TABLE website_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  
  -- 방문 정보
  visitor_id TEXT, -- 익명 ID (쿠키 기반)
  session_id TEXT,
  
  -- 경로
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

-- Index
CREATE INDEX idx_website_analytics_website_id ON website_analytics(website_id);
CREATE INDEX idx_website_analytics_visited_at ON website_analytics(visited_at);

-- ============================================
-- 6. Subscriptions (구독 관리)
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  plan TEXT NOT NULL CHECK (plan IN ('FREE', 'STARTER', 'PRO')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  
  -- 결제 정보 (Stripe/Toss)
  payment_provider TEXT, -- 'stripe', 'toss'
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

-- Index
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_subscription_id ON subscriptions(subscription_id);

-- ============================================
-- 7. Payments (결제 내역)
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- 결제 정보
  payment_provider TEXT NOT NULL, -- 'stripe', 'toss'
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

-- Index
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_payment_id ON payments(payment_id);

-- ============================================
-- 초기 템플릿 데이터
-- ============================================
INSERT INTO templates (id, name, description, category, is_premium, schema) VALUES
('modern', 'Modern Business', '세련된 비즈니스 템플릿', 'business', false, '{
  "sections": [
    { "id": "hero", "required": true, "fields": ["title", "subtitle", "image", "cta"] },
    { "id": "about", "required": false, "fields": ["text", "image"] },
    { "id": "services", "required": false, "fields": ["items"] },
    { "id": "contact", "required": true, "fields": ["email", "phone", "social"] }
  ]
}'::jsonb),

('minimal', 'Minimal Portfolio', '미니멀한 포트폴리오 템플릿', 'portfolio', false, '{
  "sections": [
    { "id": "hero", "required": true, "fields": ["title", "subtitle", "image"] },
    { "id": "portfolio", "required": true, "fields": ["projects"] },
    { "id": "about", "required": false, "fields": ["text", "image"] },
    { "id": "contact", "required": true, "fields": ["email", "social"] }
  ]
}'::jsonb),

('creative', 'Creative Agency', '창의적인 에이전시 템플릿', 'agency', false, '{
  "sections": [
    { "id": "hero", "required": true, "fields": ["title", "subtitle", "image", "cta"] },
    { "id": "services", "required": true, "fields": ["items"] },
    { "id": "team", "required": false, "fields": ["members"] },
    { "id": "contact", "required": true, "fields": ["email", "phone", "social"] }
  ]
}'::jsonb);

-- ============================================
-- RLS (Row Level Security) - 추후 활성화
-- ============================================
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

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

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
