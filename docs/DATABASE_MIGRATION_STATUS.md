# 데이터베이스 마이그레이션 상태 - 2025-01-27

## 🔴 현재 상태: 마이그레이션 미완료 (60%)

### ✅ 완료된 마이그레이션

#### 1️⃣ service_types_expansion.sql ✅ 성공
- **경로**: `supabase/migrations/service_types_expansion.sql`
- **상태**: 정상 실행 완료
- **내용**: 10가지 서비스 타입 ENUM 생성
  - online_course, one_on_one_mentoring, group_coaching
  - digital_product, project_service, consulting
  - agency_service, premium_membership, live_workshop, promotion_service

---

### ❌ 미완료 마이그레이션

#### 2️⃣ pricing_system_final_fixed.sql ❌ 부분 실패
- **경로**: `supabase/migrations/pricing_system_final_fixed.sql`
- **상태**: 함수 재정의 에러로 중단
- **에러**: `ERROR: 42P13: cannot change return type of existing function`
- **원인**: `generate_contract_number()` 함수가 이미 다른 리턴 타입으로 존재
- **해결 방법**:
  ```sql
  -- 1단계: 기존 함수 삭제
  DROP FUNCTION IF EXISTS generate_contract_number();
  
  -- 2단계: pricing_system_final_fixed.sql 재실행
  ```

#### 3️⃣ database_cleanup_and_optimization_fixed.sql ⏸️ 대기 중
- **경로**: `supabase/migrations/database_cleanup_and_optimization_fixed.sql`
- **상태**: 실행 대기
- **내용**: 인덱스 및 검색 함수 추가

#### 4️⃣ payments_system_addon.sql ⏸️ 대기 중
- **경로**: `supabase/migrations/payments_system_addon.sql`
- **상태**: 실행 대기
- **내용**: 크레딧/결제 거래 테이블 추가

---

## 📊 기존 데이터베이스 구조 (확인 완료)

### products 테이블
```
✅ user_id (UUID) - 파트너 ID
✅ category_id (UUID) - 카테고리 참조
✅ service_type (ENUM) - 서비스 타입
✅ price (INTEGER) - 가격
✅ is_published (BOOLEAN) - 게시 여부
```

### orders 테이블
```
✅ user_id (UUID) - 구매자
✅ service_id (UUID) - 서비스
✅ partner_id (UUID) - 판매자
✅ status (TEXT) - 주문 상태
```

### quotation_requests 테이블
```
✅ product_id (UUID)
✅ client_id (UUID)
✅ project_title (TEXT)
✅ project_description (TEXT)
✅ status (TEXT)
```

### contracts 테이블
```
✅ quotation_id (UUID) - proposal_id 아님!
✅ client_id (UUID)
✅ partner_id (UUID)
✅ contract_number (TEXT)
✅ status (TEXT)
```

---

## ⚠️ 주요 이슈 및 해결 내역

### Issue #1: partner_id vs user_id 혼동
- **문제**: 마이그레이션에서 `partner_id`를 사용했으나 실제는 `user_id`
- **해결**: 모든 마이그레이션 파일에서 `user_id`로 통일

### Issue #2: category vs category_id
- **문제**: `products.category` (TEXT)로 가정했으나 실제는 `category_id` (UUID)
- **해결**: UUID 참조로 수정

### Issue #3: status vs is_published
- **문제**: 인덱스에서 `status` 컬럼 참조했으나 실제는 `is_published`
- **해결**: `is_published`로 수정

### Issue #4: proposal_id vs quotation_id
- **문제**: `contracts` 테이블이 `proposal_id`를 가질 것으로 가정했으나 실제는 `quotation_id`
- **해결**: 기존 구조 그대로 유지, `quotation_id` 사용

### Issue #5: buyer_id 컬럼 없음
- **문제**: `orders` 테이블에 `buyer_id`가 없음, `user_id` 사용
- **해결**: `user_id`로 변경

### Issue #6: korean text search config 없음
- **문제**: PostgreSQL에 'korean' 텍스트 검색 설정 없음
- **해결**: 'simple'로 변경

### Issue #7: RLS 정책 순서 문제
- **문제**: 테이블 생성과 동시에 RLS 정책 실행 시 컬럼 참조 에러
- **해결**: 테이블 생성 → 인덱스 생성 → RLS 정책 순서로 분리

### Issue #8: 함수 리턴 타입 변경 불가
- **문제**: `generate_contract_number()` 함수 재정의 시 리턴 타입 충돌
- **해결**: `DROP FUNCTION` 후 재생성 필요

---

## 🎯 다음 작업자가 해야 할 일

### 1단계: 함수 삭제 및 재생성 (1분)
```sql
-- Supabase SQL Editor 실행
DROP FUNCTION IF EXISTS generate_contract_number();
```

### 2단계: 마이그레이션 순서대로 실행 (5분)
```
✅ 1. service_types_expansion.sql (완료)
🔄 2. pricing_system_final_fixed.sql (재실행)
⏸️ 3. database_cleanup_and_optimization_fixed.sql
⏸️ 4. payments_system_addon.sql
```

### 3단계: Toss Payments 환경 변수 설정 (5분)
```env
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
```

### 4단계: Vercel 재배포 (3분)
- 환경 변수 설정 후 Redeploy

### 5단계: 통합 테스트 (30분)
- 회원가입 → 10,000 크레딧 확인
- 서비스 등록 → 마켓플레이스 노출 확인
- 크레딧 충전 → Toss Payments 테스트

---

## 📁 마이그레이션 파일 목록

### ✅ 사용 가능 (최신)
- `service_types_expansion.sql` - 10가지 서비스 타입
- `pricing_system_final_fixed.sql` - 가격 모델 및 견적 시스템
- `database_cleanup_and_optimization_fixed.sql` - 인덱스 최적화
- `payments_system_addon.sql` - 결제/크레딧 시스템

### ❌ 사용 금지 (구버전)
- `pricing_models_and_quotations.sql` - 에러 있음
- `pricing_models_and_quotations_fixed.sql` - 에러 있음
- `pricing_models_and_quotations_final.sql` - 에러 있음
- `pricing_and_quotations_complete.sql` - 에러 있음
- `pricing_system_minimal.sql` - 에러 있음
- `payments_system.sql` - 에러 있음
- `payments_system_final.sql` - 에러 있음
- `database_cleanup_and_optimization.sql` - 에러 있음

---

## 🚀 프로젝트 완성도

| 항목 | 완성도 | 상태 |
|------|--------|------|
| 프론트엔드 | 95% | ✅ 완료 |
| 백엔드 API | 90% | ✅ 완료 |
| 데이터베이스 | 60% | 🔄 진행 중 |
| 결제 통합 | 95% | ⏸️ 환경 변수 대기 |
| 문서화 | 90% | ✅ 완료 |

**전체 완성도: 86%**

---

## 📝 주요 파일 경로

### 코드
- `/app/marketplace/products/new/page.tsx` - 서비스 등록
- `/app/partner/dashboard/page.tsx` - 파트너 대시보드
- `/app/client/dashboard/page.tsx` - 클라이언트 대시보드
- `/app/credits/charge/page.tsx` - 크레딧 충전
- `/components/PurchaseButton.tsx` - Toss Payments 결제 버튼
- `/app/api/payments/confirm/route.ts` - 결제 승인 API

### 마이그레이션
- `/supabase/migrations/service_types_expansion.sql`
- `/supabase/migrations/pricing_system_final_fixed.sql`
- `/supabase/migrations/database_cleanup_and_optimization_fixed.sql`
- `/supabase/migrations/payments_system_addon.sql`

### 문서
- `/docs/LAUNCH_GUIDE.md` - 런칭 가이드
- `/docs/SERVICE_TYPES_CATEGORIES.md` - 서비스 타입 상세
- `/docs/PRICING_MODELS.md` - 가격 모델 가이드
- `/docs/TOSS_PAYMENTS_GUIDE.md` - Toss Payments 연동
- `/docs/MVP_IMPLEMENTATION_GUIDE.md` - MVP 구현 가이드

---

## 💡 작업 인수인계 체크리스트

### ✅ 완료 항목
- [x] 10가지 서비스 타입 구현
- [x] 8개 카테고리 시스템
- [x] 회원가입/로그인 (profile_type 분리)
- [x] 크레딧 시스템 (100원 = 100크레딧)
- [x] 서비스 등록 페이지 (3단계)
- [x] 마켓플레이스 필터
- [x] 서비스 요청 시스템
- [x] Toss Payments 통합
- [x] 결제 성공/실패 페이지
- [x] 파트너/클라이언트 대시보드
- [x] Vercel 빌드 성공
- [x] main 브랜치 머지 완료

### ⏸️ 대기 항목
- [ ] 데이터베이스 마이그레이션 완료
- [ ] Toss Payments 환경 변수 설정
- [ ] 통합 테스트
- [ ] 베타 테스터 초대

### 📅 예상 런칭 일정
- **마이그레이션 완료**: 2025-01-28 (1일)
- **통합 테스트**: 2025-01-29 (1일)
- **베타 런칭**: 2025-01-30 (3일 후)

---

## 🔗 중요 링크

- **GitHub**: https://github.com/jobsclass/jobsclass
- **Vercel**: https://jobsclass.vercel.app (최신 빌드 성공)
- **Supabase**: Dashboard에서 SQL Editor 사용
- **최신 커밋**: `6eb5119` - 기존 contracts 구조 반영

---

**작성일**: 2025-01-27  
**작성자**: AI Developer  
**브랜치**: main  
**상태**: 마이그레이션 60% 완료, 나머지 작업 대기 중
