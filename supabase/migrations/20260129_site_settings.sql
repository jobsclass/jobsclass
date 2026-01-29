-- 사이트 설정 테이블 생성
-- Admin 페이지에서 푸터 정보, 메인 페이지 문구 등을 동적으로 관리하기 위한 테이블

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 카테고리 제약 조건
ALTER TABLE site_settings ADD CONSTRAINT site_settings_category_check 
  CHECK (category IN ('footer', 'main_content', 'hero', 'pricing', 'general'));

-- 인덱스
CREATE INDEX idx_site_settings_key ON site_settings(key);
CREATE INDEX idx_site_settings_category ON site_settings(category);

-- RLS 활성화
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 읽기 정책: 모든 사용자가 읽을 수 있음
CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT
  USING (true);

-- 수정 정책: 관리자만 수정 가능
CREATE POLICY "Only admins can modify site settings"
  ON site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- 초기 데이터: 푸터 정보
INSERT INTO site_settings (key, value, category, description) VALUES
  ('footer_company_name', '{"ko": "잡스클래스", "en": "JobsClass"}', 'footer', '회사명'),
  ('footer_business_number', '{"value": "준비중"}', 'footer', '사업자등록번호'),
  ('footer_online_marketing_number', '{"value": "준비중"}', 'footer', '통신판매업신고번호'),
  ('footer_address', '{"value": "서울특별시"}', 'footer', '사업장 주소'),
  ('footer_email', '{"value": "support@jobsclass.com"}', 'footer', '대표 이메일'),
  ('footer_phone', '{"value": "02-1234-5678"}', 'footer', '대표 전화번호'),
  ('footer_business_hours', '{"value": "평일 10:00-18:00 (주말, 공휴일 휴무)"}', 'footer', '운영시간')
ON CONFLICT (key) DO NOTHING;

-- 초기 데이터: 메인 페이지 Hero 섹션
INSERT INTO site_settings (key, value, category, description) VALUES
  ('hero_title', '{"ko": "지식을 공유하고, 성장을 함께하는 플랫폼", "en": "Share Knowledge, Grow Together"}', 'hero', 'Hero 섹션 타이틀'),
  ('hero_subtitle', '{"ko": "전문가는 수익을 창출하고, 클라이언트는 최적의 솔루션을 찾습니다", "en": "Experts monetize their skills, Clients find optimal solutions"}', 'hero', 'Hero 섹션 서브타이틀'),
  ('hero_partner_cta', '{"text": "파트너로 시작하기", "url": "/auth/user/signup?type=partner"}', 'hero', 'Hero 파트너 CTA'),
  ('hero_client_cta', '{"text": "서비스 둘러보기", "url": "/marketplace"}', 'hero', 'Hero 클라이언트 CTA')
ON CONFLICT (key) DO NOTHING;

-- 초기 데이터: 파트너 가치 제안
INSERT INTO site_settings (key, value, category, description) VALUES
  ('partner_value_title', '{"ko": "파트너로 시작하세요"}', 'main_content', '파트너 섹션 제목'),
  ('partner_value_subtitle', '{"ko": "10% 수수료로 지식을 수익화하고, 나머지 90%는 온전히 당신의 것입니다"}', 'main_content', '파트너 섹션 부제목'),
  ('partner_value_features', '{
    "items": [
      {"icon": "💰", "title": "10% 낮은 수수료", "description": "업계 최저 수수료로 더 많은 수익 보장"},
      {"icon": "📊", "title": "실시간 대시보드", "description": "매출, 주문, 고객 관리를 한눈에"},
      {"icon": "💬", "title": "직접 소통", "description": "클라이언트와 실시간 메시지로 소통"},
      {"icon": "🎯", "title": "마케팅 지원", "description": "SEO 최적화 및 프로모션 지원"}
    ]
  }', 'main_content', '파트너 핵심 기능')
ON CONFLICT (key) DO NOTHING;

-- 초기 데이터: 클라이언트 가치 제안
INSERT INTO site_settings (key, value, category, description) VALUES
  ('client_value_title', '{"ko": "클라이언트로 시작하세요"}', 'main_content', '클라이언트 섹션 제목'),
  ('client_value_subtitle', '{"ko": "8개 분야의 검증된 전문가를 찾고, 무료로 상담받으세요"}', 'main_content', '클라이언트 섹션 부제목'),
  ('client_value_features', '{
    "items": [
      {"icon": "🔍", "title": "스마트 검색", "description": "카테고리, 타입, 가격으로 빠른 검색"},
      {"icon": "🛡️", "title": "안전한 결제", "description": "에스크로 방식으로 안전하게 거래"},
      {"icon": "📋", "title": "견적 비교", "description": "여러 전문가의 견적을 한눈에 비교"},
      {"icon": "⭐", "title": "리뷰 시스템", "description": "실제 이용자의 솔직한 리뷰 확인"}
    ]
  }', 'main_content', '클라이언트 핵심 기능')
ON CONFLICT (key) DO NOTHING;

-- 초기 데이터: 가격 정책
INSERT INTO site_settings (key, value, category, description) VALUES
  ('pricing_platform_fee', '{"partner": 10, "client": 0}', 'pricing', '플랫폼 수수료'),
  ('pricing_description', '{"ko": "투명한 가격 정책으로 파트너와 클라이언트 모두가 만족합니다"}', 'pricing', '가격 정책 설명')
ON CONFLICT (key) DO NOTHING;

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 생성
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

COMMENT ON TABLE site_settings IS '사이트 전체 설정을 관리하는 테이블 (푸터, 메인 페이지 문구 등)';
