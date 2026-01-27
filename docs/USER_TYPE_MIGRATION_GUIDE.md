# 🔄 user_type 기반 DB 재구성 가이드

작성일: 2025-01-27  
목적: `profile_type` → `user_type` 변경 및 구조 단순화

---

## 📊 변경 사항 요약

### Before (기존)
```
user_profiles.profile_type = 'individual'
products.partner_id (nullable)
products.user_id (not null)
```

### After (변경 후)
```
user_profiles.user_type = 'partner' | 'client' (NOT NULL)
products.user_id (파트너 ID, NOT NULL)
products.partner_id (삭제)
```

---

## 🎯 핵심 개념

### 역할 구분:
- **Partner (파트너)**: 서비스 제공자 (전문가, 프리랜서, 강사 등)
- **Client (클라이언트)**: 서비스 구매자

### 테이블별 사용:
| 테이블 | 파트너 | 클라이언트 |
|--------|--------|-----------|
| `products` | `user_id` | - |
| `orders` | `product_id.user_id` | `buyer_id` |
| `quotation_requests` | `product_id.user_id` | `client_id` |
| `quotations` | `partner_id` | `quotation_request_id.client_id` |
| `contracts` | `partner_id` | `client_id` |

---

## 🚀 실행 단계

### Step 1: 백업 (선택사항)
현재 데이터가 거의 없으므로 생략 가능

### Step 2: 마이그레이션 실행

1. **Supabase Dashboard** 접속
2. **SQL Editor** 열기
3. `/supabase/migrations/20250127_user_type_migration.sql` 파일 내용 복사
4. **Run** 클릭

### Step 3: 검증

마이그레이션 완료 후 다음 쿼리로 확인:

```sql
-- 1. user_type 분포 확인
SELECT user_type, COUNT(*) 
FROM user_profiles 
GROUP BY user_type;

-- 예상 결과:
-- user_type | count
-- partner   | 3

-- 2. products 구조 확인
\d products

-- partner_id 컬럼이 없어야 함
-- user_id 컬럼만 있어야 함

-- 3. RLS 정책 확인
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('products', 'orders', 'quotation_requests', 'quotations')
ORDER BY tablename, policyname;
```

---

## 📝 주요 변경 사항

### 1. user_profiles
```sql
-- 기존
profile_type TEXT (nullable)

-- 변경 후
user_type TEXT NOT NULL CHECK (user_type IN ('partner', 'client'))
```

### 2. products
```sql
-- 기존
user_id UUID NOT NULL
partner_id UUID (nullable)

-- 변경 후
user_id UUID NOT NULL  -- 파트너 ID
(partner_id 삭제)
```

### 3. RLS 정책

**products 테이블:**
- ✅ 파트너만 서비스 등록 가능
- ✅ 파트너는 자신의 서비스만 수정/삭제
- ✅ 공개된 서비스는 누구나 조회 가능

**orders 테이블:**
- ✅ 클라이언트만 주문 생성 가능
- ✅ 구매자와 판매자 모두 주문 조회 가능

**quotation_requests:**
- ✅ 클라이언트만 견적 요청 가능
- ✅ 요청자와 파트너 모두 조회 가능

**quotations:**
- ✅ 파트너만 견적 생성 가능
- ✅ 파트너와 클라이언트 모두 조회 가능

---

## 🐛 문제 해결

### 에러 1: "column partner_id does not exist"
**원인:** 이미 마이그레이션이 실행됨  
**해결:** 정상 (무시해도 됨)

### 에러 2: "check constraint violated"
**원인:** user_type 값이 'partner' 또는 'client'가 아님  
**해결:**
```sql
UPDATE user_profiles 
SET user_type = 'partner' 
WHERE user_type NOT IN ('partner', 'client');
```

### 에러 3: RLS 정책 충돌
**원인:** 기존 정책과 이름 충돌  
**해결:**
```sql
-- 모든 기존 정책 삭제 후 재실행
DROP POLICY IF EXISTS [정책명] ON [테이블명];
```

---

## ✅ 완료 체크리스트

- [ ] 마이그레이션 SQL 실행
- [ ] user_type 분포 확인 (모두 'partner' 또는 'client')
- [ ] products 테이블에서 partner_id 컬럼 제거 확인
- [ ] RLS 정책 생성 확인
- [ ] 코드 수정 시작 (다음 단계)

---

## 📚 다음 단계

마이그레이션 완료 후:
1. **코드 수정**: 모든 `profile_type` → `user_type` 변경
2. **API 수정**: `partner_id` → `user_id` 변경
3. **테스트**: 회원가입 → 서비스 등록 → 구매 플로우

---

## 🆘 도움이 필요한 경우

마이그레이션 중 에러 발생 시:
1. 에러 메시지 전체 복사
2. 실행한 단계 알려주기
3. 롤백 필요 시 알려주기

---

작성자: AI Developer  
파일: `/supabase/migrations/20250127_user_type_migration.sql`
