# JobsClass DB 스키마 수정 가이드

## 🚨 발생한 문제

회원가입 시 오류 발생:
```
Could not find the 'business_number' column of 'user_profiles' in the schema cache
```

## 🔍 원인 분석

1. **코드와 DB 스키마 불일치**
   - 코드: `user_profiles` 테이블에 `business_number`, `business_registration_file` 등 사용
   - DB: 해당 컬럼이 존재하지 않음

2. **기존 스키마와 새로운 v2.0 스키마 충돌**
   - 기존: `user_profiles`, `products` 테이블 사용
   - v2.0: `partner_profiles`, `clients`, `services` 테이블 사용

## ✅ 해결 방법

### 통합 마이그레이션 적용

**파일**: `/supabase/migrations/20260204_integration_complete.sql`

이 마이그레이션은:
1. ✅ 기존 `user_profiles` 테이블 유지 + 필요한 컬럼 추가
2. ✅ 새로운 `services` 테이블 생성 (JobsClass v2.0)
3. ✅ `carts`, `orders`, `service_reviews` 테이블 생성
4. ✅ 모든 인덱스, 트리거, RLS 정책 설정

### 적용 방법

1. **Supabase Dashboard 접속**
   ```
   https://pzjedtgqrqcipfmtkoce.supabase.co
   ```

2. **SQL Editor 열기**
   - 좌측 메뉴 → SQL Editor

3. **마이그레이션 실행**
   ```sql
   -- /supabase/migrations/20260204_integration_complete.sql 내용 복사
   -- 붙여넣기 → Run
   ```

## 📊 수정된 테이블

### user_profiles (기존 + 추가)

추가된 컬럼:
```sql
business_number TEXT                -- 사업자등록번호
business_registration_file TEXT     -- 사업자등록증 파일 URL
verification_status TEXT            -- 검증 상태 (pending/approved/rejected)
onboarding_complete BOOLEAN         -- 온보딩 완료 여부
role TEXT                           -- 역할 (partner/buyer/admin)
```

### services (신규)

```sql
- partner_id (파트너 ID)
- title, slug, description
- category, subcategory, service_type
- price, original_price
- features[], requirements[], deliverables[]
- is_published, is_active
- rating_average, rating_count
- view_count, purchase_count
```

### carts (신규)

```sql
- client_id (구매자)
- service_id (서비스)
- quantity
```

### orders (신규)

```sql
- client_id, partner_id, service_id
- total_amount
- platform_fee (10%)
- partner_amount (90%)
- status
```

### service_reviews (신규)

```sql
- service_id
- buyer_id
- rating (1-5)
- title, content
- is_visible
```

## 🔧 코드 수정 불필요

마이그레이션 적용 후 **코드 수정 없이** 바로 작동합니다:
- ✅ 회원가입: `user_profiles` 테이블 사용
- ✅ 온보딩: `business_number` 등 필드 사용 가능
- ✅ 서비스 등록: `services` 테이블 사용
- ✅ 장바구니/주문: `carts`, `orders` 테이블 사용

## 📝 주요 변경사항

### 1. 기존 시스템 유지
- `user_profiles` 테이블 계속 사용
- 기존 회원가입/로그인 로직 그대로 유지
- 온보딩 프로세스 정상 작동

### 2. 새로운 기능 추가
- JobsClass v2.0 서비스 시스템
- 장바구니 기능
- 주문 및 결제 준비
- 리뷰 시스템

### 3. 10% 수수료 구조
- orders 테이블에 자동 계산
- platform_fee: 10%
- partner_amount: 90%

## 🎯 다음 단계

1. ✅ **마이그레이션 실행** (위 참조)
2. 🔄 **테스트**
   - 회원가입 정상 작동 확인
   - 온보딩 정상 작동 확인
   - 서비스 등록 테스트
3. 🚀 **배포**
   - main 브랜치에 커밋 & 푸시
   - Vercel 자동 배포

## ⚠️ 주의사항

- 기존 데이터는 영향 없음 (새 컬럼만 추가)
- RLS 정책이 자동 적용됨
- products 테이블은 그대로 유지 (기존 기능 호환)

## 📞 문제 발생 시

1. SQL 에러 메시지 확인
2. Supabase 로그 확인
3. 마이그레이션 파일 재실행

---

**작성**: 2026-02-04  
**상태**: 준비 완료 ✅
