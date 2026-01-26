# 🗄️ Supabase DB 마이그레이션 가이드

## ⚠️ 중요: 이 작업을 반드시 먼저 해야 합니다!

회원가입과 서비스 등록이 작동하려면 DB에 새 컬럼을 추가해야 합니다.

---

## 📝 Step 1: Supabase 대시보드 열기

1. 브라우저에서 https://supabase.com/dashboard 접속
2. 프로젝트 선택: **pzjedtgqrqcipfmtkoce**

---

## 📝 Step 2: SQL Editor 열기

왼쪽 메뉴에서:
- **SQL Editor** 클릭

---

## 📝 Step 3: 마이그레이션 SQL 실행

아래 SQL을 복사해서 실행하세요:

```sql
-- ============================================
-- JobsBuild 카테고리 시스템 마이그레이션
-- ============================================

-- 1. 새로운 컬럼 추가
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_1 TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_2 TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS tags JSONB;

-- 2. 제약 조건 추가 (category_1)
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

-- 3. 제약 조건 추가 (category_2)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'services_category_2_check'
  ) THEN
    ALTER TABLE services ADD CONSTRAINT services_category_2_check 
    CHECK (
      category_2 IN (
        'web-dev', 'app-dev', 'data-ai', 'game-dev', 'programming-basics',
        'uiux', 'graphic', 'video', '3d',
        'sns-marketing', 'performance-marketing', 'branding', 'content-creation',
        'stock', 'realestate', 'economy',
        'online-business', 'offline-business', 'freelance',
        'cooking', 'fitness', 'craft', 'pet',
        'language', 'reading', 'psychology', 'career',
        'legal', 'tax', 'labor', 'patent'
      )
    );
  END IF;
END $$;

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_services_category_1 ON services(category_1);
CREATE INDEX IF NOT EXISTS idx_services_category_2 ON services(category_2);
CREATE INDEX IF NOT EXISTS idx_services_tags ON services USING GIN (tags);

-- 5. 검증
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'services'
  AND column_name IN ('category_1', 'category_2', 'tags')
ORDER BY ordinal_position;
```

---

## ✅ 확인 방법

마지막 SELECT 쿼리 결과에서 다음 3개 컬럼이 보여야 합니다:
- `category_1` (text)
- `category_2` (text)
- `tags` (jsonb)

---

## 🎉 완료!

이제 다시 사이트에서 회원가입 시도하세요!

---

## 🔧 문제 해결

### Q: 테이블이 없다고 나옵니다
A: 먼저 `supabase/schema.sql` 전체를 실행해야 합니다.

### Q: 권한 오류가 납니다
A: Supabase 대시보드에 정확한 프로젝트로 로그인되어 있는지 확인하세요.

### Q: 기존 데이터가 사라질까요?
A: 아니요! 컬럼만 추가하므로 기존 데이터는 안전합니다.

---

**완료 후 다시 시도하세요!** 🚀
