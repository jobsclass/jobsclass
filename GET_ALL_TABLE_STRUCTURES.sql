-- services 테이블 구조
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'services'
ORDER BY ordinal_position;

-- products 테이블 구조
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- orders 테이블 구조
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- carts 테이블 구조
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'carts'
ORDER BY ordinal_position;
