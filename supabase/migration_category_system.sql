-- ============================================
-- Corefy 카테고리 시스템 마이그레이션
-- 날짜: 2026-01-24
-- 설명: 8개 대분류 + 30개 세부 분류 카테고리 시스템 적용
-- ============================================

-- ============================================
-- 1. 기존 테이블 백업 (안전장치)
-- ============================================
-- CREATE TABLE services_backup AS SELECT * FROM services;

-- ============================================
-- 2. 새로운 컬럼 추가
-- ============================================

-- category_1 (대분류 8개)
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_1 TEXT;

-- category_2 (세부 분류 30개)
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_2 TEXT;

-- tags (검색 및 필터링용)
ALTER TABLE services ADD COLUMN IF NOT EXISTS tags JSONB;

-- ============================================
-- 3. 제약 조건 추가
-- ============================================

-- category_1 제약 조건
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'services_category_1_check'
  ) THEN
    ALTER TABLE services ADD CONSTRAINT services_category_1_check 
    CHECK (
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
    );
  END IF;
END $$;

-- category_2 제약 조건
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'services_category_2_check'
  ) THEN
    ALTER TABLE services ADD CONSTRAINT services_category_2_check 
    CHECK (
      category_2 IN (
        -- IT·개발 (5개)
        'web-dev', 'app-dev', 'data-ai', 'game-dev', 'programming-basics',
        -- 디자인·크리에이티브 (4개)
        'uiux', 'graphic', 'video', '3d',
        -- 비즈니스·마케팅 (4개)
        'sns-marketing', 'performance-marketing', 'branding', 'content-creation',
        -- 재테크·금융 (3개)
        'stock', 'realestate', 'economy',
        -- 창업·부업 (3개)
        'online-business', 'offline-business', 'freelance',
        -- 라이프·취미 (4개)
        'cooking', 'fitness', 'craft', 'pet',
        -- 자기계발·교양 (4개)
        'language', 'reading', 'psychology', 'career',
        -- 전문 컨설팅 (4개)
        'legal', 'tax', 'labor', 'patent'
      )
    );
  END IF;
END $$;

-- ============================================
-- 4. 인덱스 생성
-- ============================================

-- category_1 인덱스
CREATE INDEX IF NOT EXISTS idx_services_category_1 ON services(category_1);

-- category_2 인덱스
CREATE INDEX IF NOT EXISTS idx_services_category_2 ON services(category_2);

-- tags GIN 인덱스 (JSONB 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_services_tags ON services USING GIN (tags);

-- ============================================
-- 5. 기존 데이터 마이그레이션 (선택사항)
-- ============================================
-- 기존 service_type 필드가 있다면 매핑 예시:

-- 예시 1: online-course → it-dev/web-dev
-- UPDATE services
-- SET 
--   category_1 = 'it-dev',
--   category_2 = 'web-dev',
--   tags = '["온라인 강의", "개발"]'::JSONB
-- WHERE service_type = 'online-course';

-- 예시 2: consulting → consulting/legal
-- UPDATE services
-- SET 
--   category_1 = 'consulting',
--   category_2 = 'legal',
--   tags = '["컨설팅", "법률"]'::JSONB
-- WHERE service_type = 'consulting';

-- ============================================
-- 6. 기존 컬럼 제거 (선택사항, 주의!)
-- ============================================
-- 기존 category, service_subtype 컬럼을 제거하려면:
-- ALTER TABLE services DROP COLUMN IF EXISTS category;
-- ALTER TABLE services DROP COLUMN IF EXISTS service_subtype;

-- ============================================
-- 7. 검증 쿼리
-- ============================================

-- 컬럼 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'services'
  AND column_name IN ('category_1', 'category_2', 'tags')
ORDER BY ordinal_position;

-- 제약 조건 확인
SELECT conname, contype, consrc
FROM pg_constraint
WHERE conrelid = 'services'::regclass
  AND conname LIKE '%category%';

-- 인덱스 확인
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'services'
  AND indexname LIKE '%category%' OR indexname LIKE '%tags%';

-- ============================================
-- 완료!
-- ============================================
