-- ============================================
-- JobsClass: 서비스 타입 & 카테고리 확장
-- ============================================

-- ============================================
-- 1. 서비스 타입 ENUM 생성
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
    CREATE TYPE service_type AS ENUM (
      'online_course',        -- 온라인 강의
      'one_on_one_mentoring', -- 1:1 멘토링
      'group_coaching',       -- 그룹 코칭
      'digital_product',      -- 디지털 콘텐츠
      'project_service',      -- 프로젝트 대행
      'consulting',           -- 컨설팅
      'agency_service',       -- 대행 서비스
      'premium_membership',   -- 프리미엄 멤버십
      'live_workshop',        -- 라이브 워크샵
      'promotion_service'     -- 홍보/마케팅 서비스
    );
  END IF;
END $$;

-- ============================================
-- 2. products 테이블에 service_type 추가
-- ============================================
ALTER TABLE products
ADD COLUMN IF NOT EXISTS service_type service_type DEFAULT 'online_course',
ADD COLUMN IF NOT EXISTS delivery_format TEXT, -- 제공 방식: video/live/file/subscription
ADD COLUMN IF NOT EXISTS duration_value INTEGER, -- 기간 (숫자)
ADD COLUMN IF NOT EXISTS duration_unit TEXT; -- 기간 단위: day/week/month/session

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_products_service_type ON products(service_type);

-- ============================================
-- 3. client_needs 테이블에 service_type 추가
-- ============================================
ALTER TABLE client_needs
ADD COLUMN IF NOT EXISTS preferred_service_types service_type[]; -- 선호하는 서비스 타입 (배열)

-- ============================================
-- 4. 서비스 타입별 한글 이름 매핑
-- ============================================
CREATE TABLE IF NOT EXISTS service_type_labels (
  type_key TEXT PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- 이모지 또는 아이콘 클래스
  typical_price_min INTEGER,
  typical_price_max INTEGER,
  typical_duration TEXT
);

INSERT INTO service_type_labels (type_key, name_ko, name_en, description, icon, typical_price_min, typical_price_max, typical_duration)
VALUES
  ('online_course', '온라인 강의', 'Online Course', '사전 녹화된 강의 콘텐츠, 수강생이 원하는 시간에 학습', '🎓', 10000, 500000, '평생 이용'),
  ('one_on_one_mentoring', '1:1 멘토링', 'One-on-One Mentoring', '실시간 화상 또는 채팅 멘토링, 맞춤형 조언', '👥', 50000, 300000, '1시간'),
  ('group_coaching', '그룹 코칭', 'Group Coaching', '소그룹 라이브 세션, 질의응답 및 실습', '👨‍👩‍👧‍👦', 100000, 1000000, '4주'),
  ('digital_product', '디지털 콘텐츠', 'Digital Products', '전자책, 템플릿, 가이드 등 다운로드 가능 자료', '📄', 5000, 100000, '즉시 다운로드'),
  ('project_service', '프로젝트 대행', 'Project Service', '실제 작업 수행 및 납품 (웹사이트, 디자인 등)', '🔧', 500000, 10000000, '1~3개월'),
  ('consulting', '컨설팅', 'Consulting', '전문가 자문 및 전략 수립, 문제 진단', '💼', 300000, 5000000, '1~2회'),
  ('agency_service', '대행 서비스', 'Agency Service', '지속적인 운영 대행 (SNS, 광고 등)', '📢', 500000, 3000000, '월 단위'),
  ('premium_membership', '프리미엄 멤버십', 'Premium Membership', '정기 구독형 콘텐츠 + 커뮤니티', '⭐', 10000, 100000, '월 구독'),
  ('live_workshop', '라이브 워크샵', 'Live Workshop', '단기 집중 실습 프로그램, 실시간 참여', '🎯', 50000, 500000, '2~4시간'),
  ('promotion_service', '홍보/마케팅 서비스', 'Promotion Service', '인플루언서 협업, 브랜드 노출', '📣', 100000, 5000000, '캠페인별')
ON CONFLICT (type_key) DO UPDATE SET
  name_ko = EXCLUDED.name_ko,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

-- ============================================
-- 5. 카테고리 확장 (기존 유지 + 신규 추가)
-- ============================================
CREATE TABLE IF NOT EXISTS service_categories (
  id TEXT PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  parent_id TEXT, -- 대분류
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO service_categories (id, name_ko, name_en, icon, sort_order)
VALUES
  ('development', '개발 & 기술', 'Development & Tech', '💻', 1),
  ('design', '디자인 & 크리에이티브', 'Design & Creative', '🎨', 2),
  ('marketing', '마케팅 & 세일즈', 'Marketing & Sales', '📢', 3),
  ('business', '비즈니스 & 전략', 'Business & Strategy', '📊', 4),
  ('content', '콘텐츠 & 크리에이터', 'Content & Creator', '✍️', 5),
  ('education', '교육 & 멘토링', 'Education & Mentoring', '📚', 6),
  ('lifestyle', '라이프스타일 & 웰니스', 'Lifestyle & Wellness', '🧘', 7),
  ('writing', '크리에이티브 라이팅', 'Creative Writing', '✒️', 8)
ON CONFLICT (id) DO UPDATE SET
  name_ko = EXCLUDED.name_ko,
  icon = EXCLUDED.icon;

-- ============================================
-- 완료!
-- ============================================
