# 🗄️ Supabase Phase 2 마이그레이션 가이드

## 📋 변경 사항
- `products` → `services` 테이블명 변경
- `product_categories` → `service_categories` 테이블명 변경
- 지식 서비스 관련 필드 추가

---

## 🚀 실행 방법

### **Step 1: Supabase SQL Editor 열기**
1. https://supabase.com/dashboard/project/pzjedtgqrqcipfmtkoce
2. 좌측 메뉴 → **SQL Editor** 클릭
3. **New query** 버튼 클릭

---

### **Step 2: SQL 복사 & 실행**

아래 SQL을 **전체 복사**해서 SQL Editor에 붙여넣고 **Run** 버튼 클릭:

```sql
-- =====================================================
-- Phase 2: Products → Services 마이그레이션
-- =====================================================

-- 1. 기존 products 테이블을 services로 변경
ALTER TABLE IF EXISTS products RENAME TO services;

-- 2. 기존 product_categories 테이블을 service_categories로 변경
ALTER TABLE IF EXISTS product_categories RENAME TO service_categories;

-- 3. services 테이블에 지식 서비스 관련 필드 추가/수정
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

  -- max_participants 컬럼 추가 (최대 참가자 수)
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
    ALTER TABLE services ADD COLUMN recurring_interval TEXT;
  END IF;
END $$;

-- 4. 인덱스 재생성
DROP INDEX IF EXISTS idx_products_user_id;
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_products_slug;
DROP INDEX IF EXISTS idx_products_is_published;

CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(user_id, slug);
CREATE INDEX IF NOT EXISTS idx_services_is_published ON services(is_published);
CREATE INDEX IF NOT EXISTS idx_services_service_category ON services(service_category);

-- 5. 트리거 이름 변경
DROP TRIGGER IF EXISTS update_products_updated_at ON services;
CREATE TRIGGER update_services_updated_at 
  BEFORE UPDATE ON services 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS 정책 업데이트
DO $$ 
DECLARE
  policy_name TEXT;
BEGIN
  -- 기존 정책 삭제
  FOR policy_name IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'services'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_name) || ' ON services';
  END LOOP;

  -- 새 정책 추가
  EXECUTE 'CREATE POLICY select_own_services ON services
    FOR SELECT USING (auth.uid() = user_id)';

  EXECUTE 'CREATE POLICY select_published_services ON services
    FOR SELECT USING (is_published = true)';

  EXECUTE 'CREATE POLICY insert_own_services ON services
    FOR INSERT WITH CHECK (auth.uid() = user_id)';

  EXECUTE 'CREATE POLICY update_own_services ON services
    FOR UPDATE USING (auth.uid() = user_id)';

  EXECUTE 'CREATE POLICY delete_own_services ON services
    FOR DELETE USING (auth.uid() = user_id)';
END $$;

-- 7. service_categories 인덱스
DROP INDEX IF EXISTS idx_product_categories_user_id;
CREATE INDEX IF NOT EXISTS idx_service_categories_user_id ON service_categories(user_id);

-- 완료!
SELECT '✅ Phase 2 마이그레이션 완료!' as status;
```

---

### **Step 3: 실행 결과 확인**

**성공 시:**
```
✅ Phase 2 마이그레이션 완료!
```

**에러 발생 시:**
- 스크린샷 보내주세요!
- 에러 메시지 복사해서 보내주세요!

---

### **Step 4: 테이블 확인**

좌측 메뉴 → **Table Editor**에서 다음 테이블 확인:
- ✅ `services` (기존 products에서 변경됨)
- ✅ `service_categories` (기존 product_categories에서 변경됨)

---

## 📦 새로 추가된 컬럼

### `services` 테이블에 추가된 필드:
| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `service_category` | TEXT | 서비스 카테고리 | 'online_course', 'coaching' |
| `delivery_format` | TEXT | 제공 방식 | 'online', 'offline', 'hybrid' |
| `duration` | TEXT | 제공 기간/시간 | '4주', '1시간', '평생' |
| `includes` | JSONB | 포함 사항 | ["PDF 자료", "1:1 피드백"] |
| `requirements` | TEXT | 필요 조건 | "노트북, 기본 마케팅 지식" |
| `max_participants` | INTEGER | 최대 참가자 수 | 10 (그룹 프로그램용) |
| `is_recurring` | BOOLEAN | 정기 서비스 여부 | true/false |
| `recurring_interval` | TEXT | 정기 결제 주기 | 'weekly', 'monthly' |

---

## 🔄 기존 데이터는?

✅ **안전합니다!**
- 테이블명만 변경되고 데이터는 그대로 유지
- 새 컬럼은 `NULL` 또는 기본값으로 추가
- 기존 서비스(상품)는 그대로 작동

---

## 🎯 다음 단계

1. ✅ Phase 2 마이그레이션 실행
2. 개발 서버 재시작
3. `/dashboard/services` 페이지 테스트
4. 서비스 등록 테스트

---

**준비되셨으면 바로 실행하세요!** 🚀

실행 후 결과를 알려주시면 다음 단계로 진행하겠습니다!
