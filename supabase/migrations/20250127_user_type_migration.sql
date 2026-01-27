-- =====================================================
-- JobsClass DB Restructuring: user_type 기반 재구성
-- 작성일: 2025-01-27
-- 목적: profile_type → user_type 변경 및 구조 단순화
-- =====================================================

-- =====================================================
-- Step 1: user_profiles 테이블 재구성
-- =====================================================

-- 1.1 새로운 user_type 컬럼 추가
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT;

-- 1.2 기존 데이터 변환
-- 'individual' → 'partner' (기본값: 개인 전문가는 파트너로 간주)
UPDATE user_profiles 
SET user_type = 'partner' 
WHERE profile_type = 'individual' OR profile_type IS NULL;

-- 'business' → 'partner' (만약 있다면)
UPDATE user_profiles 
SET user_type = 'partner' 
WHERE profile_type = 'business';

-- 1.3 user_type을 NOT NULL로 설정
ALTER TABLE user_profiles 
ALTER COLUMN user_type SET NOT NULL;

-- 1.4 CHECK 제약 추가
ALTER TABLE user_profiles
ADD CONSTRAINT user_type_check 
CHECK (user_type IN ('partner', 'client'));

-- 1.5 기존 profile_type 컬럼 제거 (선택사항)
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS profile_type;

COMMENT ON COLUMN user_profiles.user_type IS '사용자 유형: partner(서비스 제공자) 또는 client(서비스 구매자)';

-- =====================================================
-- Step 2: products 테이블 정리
-- =====================================================

-- 2.1 user_id가 NOT NULL인지 확인
ALTER TABLE products 
ALTER COLUMN user_id SET NOT NULL;

-- 2.2 partner_id 컬럼 제거 (user_id로 통일)
-- 기존 partner_id 데이터를 user_id로 복사 (혹시 모를 경우 대비)
UPDATE products 
SET user_id = COALESCE(user_id, partner_id) 
WHERE user_id IS NULL AND partner_id IS NOT NULL;

-- partner_id 컬럼 삭제
ALTER TABLE products 
DROP COLUMN IF EXISTS partner_id;

COMMENT ON COLUMN products.user_id IS '서비스 등록자 (파트너) ID';

-- =====================================================
-- Step 3: orders 테이블 정리
-- =====================================================

-- 3.1 buyer_id를 NOT NULL로 설정
ALTER TABLE orders 
ALTER COLUMN buyer_id SET NOT NULL;

COMMENT ON COLUMN orders.buyer_id IS '구매자 (클라이언트) ID';
COMMENT ON COLUMN orders.product_id IS '구매한 서비스 ID (products.user_id를 통해 파트너 확인)';

-- =====================================================
-- Step 4: quotation_requests 테이블 정리
-- =====================================================

-- 4.1 client_id NOT NULL 확인
ALTER TABLE quotation_requests 
ALTER COLUMN client_id SET NOT NULL;

-- 4.2 product_id를 통해 파트너 확인
COMMENT ON COLUMN quotation_requests.client_id IS '견적 요청자 (클라이언트) ID';
COMMENT ON COLUMN quotation_requests.product_id IS '견적 요청 대상 서비스 (products.user_id를 통해 파트너 확인)';

-- =====================================================
-- Step 5: quotations 테이블 정리
-- =====================================================

-- 5.1 partner_id → user_id 변경 고려
-- quotations 테이블은 partner_id를 그대로 유지 (의미가 명확하므로)
ALTER TABLE quotations 
ALTER COLUMN partner_id SET NOT NULL;

COMMENT ON COLUMN quotations.partner_id IS '견적 제공자 (파트너) ID';

-- =====================================================
-- Step 6: contracts 테이블 정리
-- =====================================================

ALTER TABLE contracts 
ALTER COLUMN partner_id SET NOT NULL;

ALTER TABLE contracts 
ALTER COLUMN client_id SET NOT NULL;

COMMENT ON COLUMN contracts.partner_id IS '계약 파트너 (서비스 제공자) ID';
COMMENT ON COLUMN contracts.client_id IS '계약 클라이언트 (서비스 구매자) ID';

-- =====================================================
-- Step 7: RLS 정책 재작성
-- =====================================================

-- 7.1 products 테이블 RLS 정책
DROP POLICY IF EXISTS products_select_published ON products;
DROP POLICY IF EXISTS products_select_own ON products;
DROP POLICY IF EXISTS products_insert_own ON products;
DROP POLICY IF EXISTS products_update_own ON products;
DROP POLICY IF EXISTS products_delete_own ON products;

-- 공개된 서비스는 누구나 조회 가능
CREATE POLICY products_select_published ON products
FOR SELECT
USING (is_published = true);

-- 파트너는 자신의 서비스 조회 가능
CREATE POLICY products_select_own ON products
FOR SELECT
USING (
  user_id = auth.uid()
);

-- 파트너만 서비스 등록 가능
CREATE POLICY products_insert_partner ON products
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'partner'
  )
);

-- 파트너는 자신의 서비스 수정 가능
CREATE POLICY products_update_own ON products
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 파트너는 자신의 서비스 삭제 가능
CREATE POLICY products_delete_own ON products
FOR DELETE
USING (user_id = auth.uid());

-- 7.2 orders 테이블 RLS 정책
DROP POLICY IF EXISTS orders_select_policy ON orders;
DROP POLICY IF EXISTS orders_insert_policy ON orders;

-- 구매자 또는 판매자(파트너)는 주문 조회 가능
CREATE POLICY orders_select_policy ON orders
FOR SELECT
USING (
  buyer_id = auth.uid() 
  OR product_id IN (
    SELECT id FROM products WHERE user_id = auth.uid()
  )
);

-- 클라이언트만 주문 생성 가능
CREATE POLICY orders_insert_client ON orders
FOR INSERT
WITH CHECK (
  buyer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'client'
  )
);

-- 7.3 quotation_requests 테이블 RLS 정책
DROP POLICY IF EXISTS quotation_requests_select_own ON quotation_requests;
DROP POLICY IF EXISTS quotation_requests_insert_own ON quotation_requests;

-- 클라이언트 본인 또는 해당 서비스의 파트너가 견적 요청 조회 가능
CREATE POLICY quotation_requests_select_involved ON quotation_requests
FOR SELECT
USING (
  client_id = auth.uid() 
  OR product_id IN (
    SELECT id FROM products WHERE user_id = auth.uid()
  )
);

-- 클라이언트만 견적 요청 생성 가능
CREATE POLICY quotation_requests_insert_client ON quotation_requests
FOR INSERT
WITH CHECK (
  client_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'client'
  )
);

-- 7.4 quotations 테이블 RLS 정책
DROP POLICY IF EXISTS quotations_select_involved ON quotations;
DROP POLICY IF EXISTS quotations_insert_partner ON quotations;
DROP POLICY IF EXISTS quotations_update_partner ON quotations;

-- 파트너 또는 해당 견적 요청의 클라이언트가 조회 가능
CREATE POLICY quotations_select_involved ON quotations
FOR SELECT
USING (
  partner_id = auth.uid() 
  OR quotation_request_id IN (
    SELECT id FROM quotation_requests WHERE client_id = auth.uid()
  )
);

-- 파트너만 견적 생성 가능
CREATE POLICY quotations_insert_partner_only ON quotations
FOR INSERT
WITH CHECK (
  partner_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'partner'
  )
);

-- 파트너는 자신의 견적 수정 가능
CREATE POLICY quotations_update_own ON quotations
FOR UPDATE
USING (partner_id = auth.uid())
WITH CHECK (partner_id = auth.uid());

-- 7.5 contracts 테이블 RLS 정책
DROP POLICY IF EXISTS contracts_select_involved ON contracts;

-- 파트너 또는 클라이언트가 자신의 계약 조회 가능
CREATE POLICY contracts_select_involved ON contracts
FOR SELECT
USING (
  partner_id = auth.uid() 
  OR client_id = auth.uid()
);

-- =====================================================
-- Step 8: 인덱스 최적화
-- =====================================================

-- user_type 기반 인덱스
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type 
ON user_profiles(user_type);

-- products.user_id 인덱스 (이미 있을 수 있음)
CREATE INDEX IF NOT EXISTS idx_products_user_id 
ON products(user_id);

-- orders 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id 
ON orders(buyer_id);

-- =====================================================
-- Step 9: 검증 쿼리
-- =====================================================

-- 9.1 user_type 분포 확인
DO $$
BEGIN
  RAISE NOTICE '=== user_profiles.user_type 분포 ===';
END $$;

SELECT user_type, COUNT(*) as count
FROM user_profiles
GROUP BY user_type;

-- 9.2 products 구조 확인
DO $$
BEGIN
  RAISE NOTICE '=== products 테이블 확인 ===';
END $$;

SELECT 
  COUNT(*) as total_products,
  COUNT(DISTINCT user_id) as unique_partners
FROM products;

-- =====================================================
-- 완료!
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ user_type 기반 DB 재구성 완료!';
  RAISE NOTICE '변경사항:';
  RAISE NOTICE '1. user_profiles: profile_type → user_type (partner | client)';
  RAISE NOTICE '2. products: partner_id 제거, user_id만 사용';
  RAISE NOTICE '3. RLS 정책: user_type 기반으로 재작성';
  RAISE NOTICE '4. 인덱스: 최적화 완료';
END $$;
