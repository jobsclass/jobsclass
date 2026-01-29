-- 서비스 타입 업데이트: 10개 → 6개 타입으로 변경
-- 기존 타입을 새로운 타입으로 매핑

-- 1. 기존 CHECK constraint 제거
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_product_type_check;

-- 2. type 컬럼으로 이름 변경 (product_type → type)
ALTER TABLE products RENAME COLUMN product_type TO type;

-- 3. 새로운 CHECK constraint 추가 (6가지 타입)
ALTER TABLE products ADD CONSTRAINT products_type_check 
  CHECK (type IN (
    'online_course',      -- 온라인 강의
    'mentoring',          -- 멘토링 (1:1 멘토링 + 컨설팅)
    'group_coaching',     -- 그룹 코칭
    'digital_product',    -- 디지털 상품
    'project_service',    -- 프로젝트 대행
    'community_event'     -- 커뮤니티 & 네트워킹
  ));

-- 4. 기존 데이터 마이그레이션
UPDATE products SET type = CASE
  -- 온라인 강의 계열
  WHEN type IN ('course', 'bootcamp') THEN 'online_course'
  
  -- 멘토링 계열 (1:1 멘토링 + 컨설팅 통합)
  WHEN type IN ('mentoring', 'consulting', 'coaching') THEN 'mentoring'
  
  -- 디지털 상품 계열
  WHEN type IN ('ebook', 'template', 'content', 'digital_product') THEN 'digital_product'
  
  -- 프로젝트 대행 계열
  WHEN type IN ('development', 'marketing', 'design') THEN 'project_service'
  
  -- 기타: 기본값으로 멘토링
  ELSE 'mentoring'
END
WHERE type NOT IN (
  'online_course', 
  'mentoring', 
  'group_coaching', 
  'digital_product', 
  'project_service', 
  'community_event'
);

-- 5. 카테고리 CHECK constraint 업데이트 (8개 카테고리)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

ALTER TABLE products ADD CONSTRAINT products_category_check 
  CHECK (category IN (
    'tech',        -- IT & 기술
    'design',      -- 디자인 & 크리에이티브
    'marketing',   -- 마케팅 & 세일즈
    'business',    -- 비즈니스 & 전략
    'content',     -- 콘텐츠 & 미디어
    'language',    -- 언어 & 글로벌
    'lifestyle',   -- 라이프스타일 & 웰니스
    'career'       -- 커리어 & 자기계발
  ));

-- 6. 기존 카테고리 데이터 마이그레이션
UPDATE products SET category = CASE
  WHEN category IN ('development') THEN 'tech'
  WHEN category IN ('education') THEN 'career'
  WHEN category IN ('writing') THEN 'content'
  WHEN category IN ('tech', 'design', 'marketing', 'business', 'content', 'language', 'lifestyle', 'career') THEN category
  ELSE 'business'  -- 기본값
END;

-- 7. 이미지 필드명 통일 (thumbnail_url → image_url)
-- 참고: 이미 image_url 컬럼이 있다면 스킵
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'thumbnail_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE products RENAME COLUMN thumbnail_url TO image_url;
  END IF;
END $$;

-- 8. 인덱스 업데이트
DROP INDEX IF EXISTS idx_products_product_type;
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- 9. 확인 쿼리
COMMENT ON COLUMN products.type IS '서비스 타입: online_course, mentoring, group_coaching, digital_product, project_service, community_event';
COMMENT ON COLUMN products.category IS '카테고리: tech, design, marketing, business, content, language, lifestyle, career';

-- 10. 데이터 검증
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM products
  WHERE type NOT IN ('online_course', 'mentoring', 'group_coaching', 'digital_product', 'project_service', 'community_event');
  
  IF invalid_count > 0 THEN
    RAISE EXCEPTION '유효하지 않은 타입이 % 개 있습니다', invalid_count;
  END IF;

  SELECT COUNT(*) INTO invalid_count
  FROM products
  WHERE category NOT IN ('tech', 'design', 'marketing', 'business', 'content', 'language', 'lifestyle', 'career');
  
  IF invalid_count > 0 THEN
    RAISE EXCEPTION '유효하지 않은 카테고리가 % 개 있습니다', invalid_count;
  END IF;

  RAISE NOTICE '✅ 마이그레이션 성공: 모든 데이터가 유효합니다';
END $$;
