-- =====================================================
-- Phase 2: Products → Services 마이그레이션
-- =====================================================

-- 1. 기존 products 테이블을 services로 변경
ALTER TABLE IF EXISTS products RENAME TO services;

-- 2. 기존 product_categories 테이블을 service_categories로 변경
ALTER TABLE IF EXISTS product_categories RENAME TO service_categories;

-- 3. services 테이블에 지식 서비스 관련 필드 추가/수정
-- (이미 존재하면 무시)
DO $$ 
BEGIN
  -- service_category 컬럼 추가 (새로운 12개 카테고리용)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='services' AND column_name='service_category') THEN
    ALTER TABLE services ADD COLUMN service_category TEXT;
  END IF;

  -- delivery_format 컬럼 추가 (온라인/오프라인/하이브리드)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='services' AND column_name='delivery_format') THEN
    ALTER TABLE services ADD COLUMN delivery_format TEXT DEFAULT 'online';
  END IF;

  -- duration 컬럼 추가 (서비스 제공 기간/시간)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='services' AND column_name='duration') THEN
    ALTER TABLE services ADD COLUMN duration TEXT;
  END IF;

  -- includes 컬럼 추가 (포함 사항 - JSON 배열)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='services' AND column_name='includes') THEN
    ALTER TABLE services ADD COLUMN includes JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- requirements 컬럼 추가 (필요 조건)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='services' AND column_name='requirements') THEN
    ALTER TABLE services ADD COLUMN requirements TEXT;
  END IF;

  -- max_participants 컬럼 추가 (최대 참가자 수 - 그룹 프로그램용)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='services' AND column_name='max_participants') THEN
    ALTER TABLE services ADD COLUMN max_participants INTEGER;
  END IF;

  -- is_recurring 컬럼 추가 (정기 서비스 여부)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='services' AND column_name='is_recurring') THEN
    ALTER TABLE services ADD COLUMN is_recurring BOOLEAN DEFAULT false;
  END IF;

  -- recurring_interval 컬럼 추가 (정기 결제 주기)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='services' AND column_name='recurring_interval') THEN
    ALTER TABLE services ADD COLUMN recurring_interval TEXT; -- 'weekly', 'monthly', 'yearly'
  END IF;
END $$;

-- 4. 외래키 제약조건 업데이트 (있다면)
DO $$ 
BEGIN
  -- orders 테이블의 items JSONB에 product_id → service_id 참조는 
  -- JSONB라서 자동 변경 불필요 (애플리케이션 레벨에서 처리)
  
  -- 만약 직접 FK가 있었다면:
  -- ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_product;
  -- ALTER TABLE orders ADD CONSTRAINT fk_service FOREIGN KEY (...);
  
  NULL; -- placeholder
END $$;

-- 5. 인덱스 재생성 (기존 인덱스가 products에 있었다면)
DROP INDEX IF EXISTS idx_products_user_id;
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_products_slug;
DROP INDEX IF EXISTS idx_products_is_published;

CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(user_id, slug);
CREATE INDEX IF NOT EXISTS idx_services_is_published ON services(is_published);
CREATE INDEX IF NOT EXISTS idx_services_service_category ON services(service_category);

-- 6. 트리거 이름 변경 (있다면)
DROP TRIGGER IF EXISTS update_products_updated_at ON services;
CREATE TRIGGER update_services_updated_at 
  BEFORE UPDATE ON services 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS 정책 업데이트 (있다면)
-- products의 RLS 정책을 services로 복사
DO $$ 
DECLARE
  policy_name TEXT;
BEGIN
  -- 기존 products의 정책 삭제 (테이블명 변경으로 무효화됨)
  FOR policy_name IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'services'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_name) || ' ON services';
  END LOOP;

  -- 새 정책 추가
  -- 1) 본인 서비스 조회
  EXECUTE 'CREATE POLICY select_own_services ON services
    FOR SELECT USING (auth.uid() = user_id)';

  -- 2) 공개 서비스 조회 (모두)
  EXECUTE 'CREATE POLICY select_published_services ON services
    FOR SELECT USING (is_published = true)';

  -- 3) 본인 서비스 생성
  EXECUTE 'CREATE POLICY insert_own_services ON services
    FOR INSERT WITH CHECK (auth.uid() = user_id)';

  -- 4) 본인 서비스 수정
  EXECUTE 'CREATE POLICY update_own_services ON services
    FOR UPDATE USING (auth.uid() = user_id)';

  -- 5) 본인 서비스 삭제
  EXECUTE 'CREATE POLICY delete_own_services ON services
    FOR DELETE USING (auth.uid() = user_id)';
END $$;

-- 8. service_categories 인덱스
DROP INDEX IF EXISTS idx_product_categories_user_id;
CREATE INDEX IF NOT EXISTS idx_service_categories_user_id ON service_categories(user_id);

-- 9. 완료 메시지
DO $$ 
BEGIN
  RAISE NOTICE '✅ Phase 2 마이그레이션 완료: products → services';
  RAISE NOTICE '📦 테이블: services, service_categories';
  RAISE NOTICE '🔧 인덱스 재생성 완료';
  RAISE NOTICE '🔒 RLS 정책 업데이트 완료';
END $$;
