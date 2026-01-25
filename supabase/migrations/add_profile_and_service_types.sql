-- ============================================
-- 개인/조직 프로필 타입 및 서비스 타입 확장
-- ============================================

-- 1. user_profiles 테이블에 프로필 타입 추가
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS profile_type TEXT NOT NULL DEFAULT 'individual'
  CHECK (profile_type IN ('individual', 'organization'));

-- 조직 정보 필드 추가
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS organization_name TEXT,
ADD COLUMN IF NOT EXISTS organization_description TEXT,
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS team_size TEXT,
ADD COLUMN IF NOT EXISTS organization_links JSONB DEFAULT '{}';

COMMENT ON COLUMN user_profiles.profile_type IS 'individual: 개인 웹페이지, organization: 조직 웹사이트';
COMMENT ON COLUMN user_profiles.organization_name IS '조직명 (예: (주)잡스클라스)';
COMMENT ON COLUMN user_profiles.organization_description IS '회사/조직 소개';
COMMENT ON COLUMN user_profiles.team_size IS '팀 규모 (예: 1-10명, 11-50명)';

-- ============================================

-- 2. services 테이블에 서비스 타입 추가
ALTER TABLE services
ADD COLUMN IF NOT EXISTS service_type TEXT NOT NULL DEFAULT 'direct_sale'
  CHECK (service_type IN ('direct_sale', 'external_link', 'inquiry'));

-- Type B: 외부 링크용 필드
ALTER TABLE services
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS external_button_text TEXT DEFAULT '서비스 바로가기',
ADD COLUMN IF NOT EXISTS link_clicks INTEGER DEFAULT 0;

-- Type C: 문의 받기용 필드
ALTER TABLE services
ADD COLUMN IF NOT EXISTS inquiry_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inquiry_description TEXT;

COMMENT ON COLUMN services.service_type IS 'direct_sale: 바로 결제, external_link: 외부 링크, inquiry: 문의 받기';
COMMENT ON COLUMN services.external_url IS '외부 링크 URL (Type B)';
COMMENT ON COLUMN services.external_button_text IS '외부 링크 버튼 텍스트 (Type B)';
COMMENT ON COLUMN services.link_clicks IS '외부 링크 클릭 수 (통계)';
COMMENT ON COLUMN services.inquiry_enabled IS '문의 기능 활성화 여부 (Type C)';
COMMENT ON COLUMN services.inquiry_description IS '문의 안내 문구 (Type C)';

-- ============================================

-- 3. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_type ON user_profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_services_service_type ON services(service_type);

-- ============================================
-- 완료!
-- ============================================
