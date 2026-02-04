-- ============================================
-- 기존 services 테이블 구조 확인
-- ============================================

-- services 테이블이 있는지 확인
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_name = 'services'
) as services_exists;

-- services 테이블 컬럼 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'services'
ORDER BY ordinal_position;

-- products 테이블도 확인
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_name = 'products'
) as products_exists;

-- products 테이블 컬럼 확인
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
