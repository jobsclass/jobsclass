# 🚀 JobsClass 마이그레이션 실행 가이드

**작성일**: 2025-01-27  
**대상**: 개발자 / 운영자  
**소요 시간**: 약 10분  
**난이도**: ⭐⭐☆☆☆ (중하)

---

## 📋 목차
1. [사전 준비](#사전-준비)
2. [마이그레이션 실행](#마이그레이션-실행)
3. [실행 검증](#실행-검증)
4. [문제 해결](#문제-해결)
5. [롤백 방법](#롤백-방법)

---

## 🎯 사전 준비

### 1단계: Supabase Dashboard 접속
1. https://supabase.com/dashboard 로그인
2. JobsClass 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭

### 2단계: 현재 DB 상태 확인 (선택사항)
```sql
-- 기존 테이블 목록 확인
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- products 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products';
```

### 3단계: 백업 권장 (중요!)
Supabase Dashboard → Database → Backups에서 현재 상태 백업

---

## 🚀 마이그레이션 실행

### 방법 A: 전체 한 번에 실행 (권장)

#### Step 1: SQL 파일 복사
1. `/home/user/webapp/supabase/migrations/20250127_mvp_complete_migration.sql` 파일 열기
2. 전체 내용 복사 (Ctrl+A → Ctrl+C)

#### Step 2: Supabase SQL Editor에서 실행
1. SQL Editor에 붙여넣기
2. 우측 하단 **Run** 버튼 클릭
3. 실행 완료까지 대기 (약 5-10초)

#### Step 3: 결과 확인
성공 시 다음 메시지 표시:
```
✅ JobsClass MVP 통합 마이그레이션 완료!
📊 생성된 테이블: ...
🔒 RLS 정책 적용됨
📈 검색 함수 및 뷰 생성됨
✨ 런칭 준비 완료!
```

### 방법 B: 섹션별 실행 (안전)

더 안전하게 진행하려면 각 섹션을 순차적으로 실행:

#### Section 1: ENUM 타입 생성
```sql
-- 라인 1-56 실행
-- service_type, pricing_model ENUM 생성
```
**확인**: 에러 없이 완료

#### Section 2: products 테이블 확장
```sql
-- 라인 58-84 실행
-- pricing_model 등 컬럼 추가
```
**확인**: `ALTER TABLE` 성공 메시지

#### Section 3: 견적/계약 테이블 생성
```sql
-- 라인 86-243 실행
-- quotation_requests, quotations, contracts 생성
```
**확인**: 3개 테이블 생성 완료

#### Section 4: 결제/크레딧 테이블 생성
```sql
-- 라인 245-379 실행
-- orders, credit_transactions, payment_transactions 생성
```
**확인**: 3개 테이블 생성 완료

#### Section 5: 인덱스 및 최적화
```sql
-- 라인 381-433 실행
-- 인덱스 및 트리거 생성
```
**확인**: 인덱스 생성 완료

#### Section 6: RLS 정책
```sql
-- 라인 435-543 실행
-- Row Level Security 정책 적용
```
**확인**: 정책 생성 완료

#### Section 7: 뷰 및 함수
```sql
-- 라인 545-699 실행
-- 검색 함수, 뷰, 번호 생성 함수
```
**확인**: 함수 및 뷰 생성 완료

---

## ✅ 실행 검증

### 1단계: 테이블 생성 확인
```sql
-- 새로 생성된 테이블 확인
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'quotation_requests', 
    'quotations', 
    'contracts', 
    'orders', 
    'credit_transactions', 
    'payment_transactions'
  )
ORDER BY tablename;
```
**기대 결과**: 6개 테이블 모두 표시

### 2단계: products 컬럼 확인
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN (
    'pricing_model',
    'base_price',
    'price_range_min',
    'price_range_max'
  );
```
**기대 결과**: 4개 컬럼 모두 표시

### 3단계: 함수 생성 확인
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'generate_quotation_number',
    'generate_contract_number',
    'generate_order_number',
    'search_products'
  );
```
**기대 결과**: 4개 함수 모두 표시

### 4단계: RLS 정책 확인
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
**기대 결과**: 15개 이상의 정책 표시

### 5단계: 통합 테스트
```sql
-- 견적서 번호 생성 테스트
SELECT generate_quotation_number();
-- 예상: QT-2025-0001

-- 계약서 번호 생성 테스트
SELECT generate_contract_number();
-- 예상: CT-2025-0001

-- 주문 번호 생성 테스트
SELECT generate_order_number();
-- 예상: ORD-20250127-000001

-- 서비스 검색 테스트
SELECT * FROM search_products(
  search_query := NULL,
  filter_is_published := true,
  result_limit := 5
);
```

---

## 🔧 문제 해결

### 문제 1: "relation already exists" 에러
**원인**: 테이블이 이미 존재  
**해결**: 정상적인 메시지입니다. `CREATE TABLE IF NOT EXISTS` 사용 중

### 문제 2: "column already exists" 에러
**원인**: 컬럼이 이미 존재  
**해결**: 정상적인 메시지입니다. `ADD COLUMN IF NOT EXISTS` 사용 중

### 문제 3: "function already exists" 에러
**원인**: 함수가 이미 존재  
**해결**: 
```sql
-- 기존 함수 삭제 후 재실행
DROP FUNCTION IF EXISTS generate_quotation_number();
DROP FUNCTION IF EXISTS generate_contract_number();
DROP FUNCTION IF EXISTS generate_order_number();
-- 그 후 Section 7 재실행
```

### 문제 4: "foreign key constraint" 에러
**원인**: 참조하는 테이블이 존재하지 않음  
**해결**: 
1. Section 3 (견적 테이블)부터 순차 실행
2. 전체 마이그레이션 처음부터 다시 실행

### 문제 5: "permission denied" 에러
**원인**: RLS 정책으로 인한 권한 문제  
**해결**: SQL Editor는 관리자 권한이므로 이 에러는 발생하지 않습니다

### 문제 6: "text search configuration does not exist"
**원인**: 한국어 텍스트 검색 설정 없음  
**해결**: 이미 'simple'로 변경되어 있어 문제 없음

---

## 🔄 롤백 방법

### 긴급 롤백이 필요한 경우

#### 방법 A: Supabase 백업 복원 (권장)
1. Supabase Dashboard → Database → Backups
2. 마이그레이션 전 백업 선택
3. Restore 클릭

#### 방법 B: 수동 롤백
```sql
-- 새로 생성된 테이블 삭제 (순서 중요!)
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS quotation_requests CASCADE;

-- 새로 추가된 컬럼 제거
ALTER TABLE products DROP COLUMN IF EXISTS pricing_model;
ALTER TABLE products DROP COLUMN IF EXISTS base_price;
ALTER TABLE products DROP COLUMN IF EXISTS price_range_min;
ALTER TABLE products DROP COLUMN IF EXISTS price_range_max;
ALTER TABLE products DROP COLUMN IF EXISTS consultation_required;
ALTER TABLE products DROP COLUMN IF EXISTS custom_quotation;

-- 함수 제거
DROP FUNCTION IF EXISTS generate_quotation_number();
DROP FUNCTION IF EXISTS generate_contract_number();
DROP FUNCTION IF EXISTS generate_order_number();
DROP FUNCTION IF EXISTS search_products();

-- 뷰 제거
DROP VIEW IF EXISTS partner_earnings_view;
DROP VIEW IF EXISTS partner_earnings_summary;

-- ENUM 제거 (주의: 다른 곳에서 사용 중일 수 있음)
DROP TYPE IF EXISTS pricing_model CASCADE;
-- service_type은 제거하지 마세요! (기존 시스템에서 사용 중)
```

---

## 📊 마이그레이션 전후 비교

### Before (마이그레이션 전)
```
테이블:
- products (기본 구조)
- user_profiles
- categories
- ... (기타)

총 테이블: ~10개
```

### After (마이그레이션 후)
```
테이블:
- products (확장됨: pricing_model 등 추가)
- quotation_requests (견적 요청) ✨ 새로 추가
- quotations (견적서) ✨ 새로 추가
- contracts (계약) ✨ 새로 추가
- orders (주문) ✨ 새로 추가
- credit_transactions (크레딧 거래) ✨ 새로 추가
- payment_transactions (결제 로그) ✨ 새로 추가

총 테이블: ~16개

추가 기능:
- 검색 함수 (search_products)
- 번호 생성 함수 (견적, 계약, 주문)
- 수익 통계 뷰
- RLS 정책 15개 이상
```

---

## ✅ 성공 기준

### ✅ 마이그레이션 성공 시
- [x] 에러 메시지 없음
- [x] 6개 새 테이블 생성
- [x] products 테이블에 6개 컬럼 추가
- [x] 4개 함수 생성
- [x] 2개 뷰 생성
- [x] RLS 정책 적용
- [x] 테스트 쿼리 정상 작동

### 🔴 다음 단계로 진행 조건
위 체크리스트가 모두 완료되어야 Toss Payments 설정으로 진행

---

## 📞 지원 정보

### 에러 발생 시
1. 에러 메시지 전체 복사
2. 실행한 SQL 섹션 확인
3. 위 "문제 해결" 섹션 참고
4. 해결 안 되면 롤백 후 재시도

### 문의
- **GitHub Issues**: https://github.com/jobsclass/jobsclass/issues
- **문서**: `/docs/DATABASE_MIGRATION_STATUS.md`

---

## 🎉 마이그레이션 완료 후

### 다음 작업
1. ✅ 마이그레이션 완료
2. ➡️ [Toss Payments 환경 변수 설정](./TOSS_PAYMENTS_SETUP.md)
3. ➡️ [통합 테스트](./INTEGRATION_TEST.md)
4. ➡️ [배포 및 런칭](../LAUNCH_GUIDE.md)

---

**작성자**: AI Developer  
**최종 수정**: 2025-01-27  
**버전**: 1.0  
**마이그레이션 파일**: `20250127_mvp_complete_migration.sql`
