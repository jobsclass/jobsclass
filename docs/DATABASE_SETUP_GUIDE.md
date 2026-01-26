# 📊 JobsBuild 데이터베이스 설정 가이드

## 목차
1. [Supabase 프로젝트 설정](#1-supabase-프로젝트-설정)
2. [마이그레이션 실행](#2-마이그레이션-실행)
3. [RLS 정책 확인](#3-rls-정책-확인)
4. [스토리지 버킷 설정](#4-스토리지-버킷-설정)
5. [문제 해결](#5-문제-해결)

---

## 1. Supabase 프로젝트 설정

### 1.1 기존 프로젝트 사용 ✅
- **프로젝트명**: `corefy` → `jobsbuild` (리브랜딩)
- **상태**: Active
- **지역**: Northeast Asia (Seoul)

### 1.2 API 키 확인
Supabase Dashboard → Project Settings → API

```bash
# 필요한 환경 변수
NEXT_PUBLIC_SUPABASE_URL=https://[프로젝트ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # anon/public key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...     # service_role key (서버 전용)
```

⚠️ **보안 주의사항**:
- `NEXT_PUBLIC_*`: 클라이언트에 노출 가능
- `SUPABASE_SERVICE_ROLE_KEY`: **절대 클라이언트에 노출 금지** (서버 전용)

---

## 2. 마이그레이션 실행

### 2.1 실행 순서
Supabase Dashboard → SQL Editor → New query에서 아래 순서대로 실행:

1. **기본 스키마** (`supabase/schema.sql`)
   - `user_profiles`
   - `services`
   - `blog_posts`
   - `portfolios`
   - `experiences`

2. **온보딩 시스템** (`supabase/migrations/add_onboarding_complete.sql`)
   - `user_profiles.onboarding_complete` 필드 추가

3. **프로필 및 서비스 타입** (`supabase/migrations/add_profile_and_service_types.sql`)
   - `user_profiles.profile_type`, `organization_name` 추가
   - `services.service_type`, `external_url`, `inquiry_enabled` 등 추가

4. **주문 및 결제 시스템** (`supabase/migrations/add_orders_payments_fixed.sql`) ⭐ **최신 수정본**
   - `customers` 테이블 업데이트 (이미 존재하므로 ALTER TABLE 사용)
   - `orders`, `payments`, `subscriptions`, `subscription_invoices`, `ai_usage_logs` 생성

### 2.2 마이그레이션 4 실행 방법

**중요**: 기존 `add_orders_payments.sql` 대신 **`add_orders_payments_fixed.sql`** 사용!

```sql
-- Supabase SQL Editor에 아래 파일 내용 복사하여 실행
-- 파일 위치: supabase/migrations/add_orders_payments_fixed.sql
```

**주요 변경사항**:
- ❌ `CREATE TABLE customers` (실패, 이미 존재함)
- ✅ `ALTER TABLE customers` (성공, 기존 테이블에 컬럼 추가)
- ✅ `IF NOT EXISTS` 체크로 안전하게 컬럼 추가

---

## 3. RLS 정책 확인

마이그레이션 실행 후 Supabase Dashboard → Authentication → Policies에서 확인:

### 3.1 `orders` 테이블
- ✅ Users can view their own orders as buyer
- ✅ Users can view their orders as seller
- ✅ Users can create orders
- ✅ Sellers can update their orders

### 3.2 `payments` 테이블
- ✅ Users can view payments for their orders
- ✅ System can manage payments

### 3.3 `subscriptions` 테이블
- ✅ Users can view their own subscription
- ✅ Users can update their own subscription
- ✅ System can create subscriptions

### 3.4 `ai_usage_logs` 테이블
- ✅ Users can view their own AI usage
- ✅ System can log AI usage

---

## 4. 스토리지 버킷 설정

Supabase Dashboard → Storage → Create a new bucket

### 4.1 필요한 버킷
1. **avatars** (프로필 이미지)
   - Public: ✅
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

2. **thumbnails** (서비스/블로그 썸네일)
   - Public: ✅
   - File size limit: 10MB
   - Allowed MIME types: `image/*`

3. **uploads** (기타 업로드 파일)
   - Public: ✅
   - File size limit: 50MB
   - Allowed MIME types: `image/*`, `application/pdf`

---

## 5. 문제 해결

### 5.1 "column 'service_id' does not exist" 에러

**원인**: 기존 `customers` 테이블이 이미 존재하는데 `CREATE TABLE`로 시도

**해결**:
```sql
-- ❌ 실패하는 마이그레이션
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services(id)
);

-- ✅ 수정된 마이그레이션
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'service_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN service_id UUID REFERENCES services(id);
  END IF;
END $$;
```

**실행 방법**:
1. Supabase SQL Editor 열기
2. `/supabase/migrations/add_orders_payments_fixed.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 Run

### 5.2 Supabase 연결 오류

**증상**: `Failed to fetch` 또는 `Network error`

**확인사항**:
```bash
# 1. 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 2. URL 형식 확인 (끝에 / 없어야 함)
✅ https://xxxxx.supabase.co
❌ https://xxxxx.supabase.co/

# 3. Vercel에서 환경 변수 재배포
# Vercel Dashboard → Settings → Environment Variables → Redeploy
```

### 5.3 RLS 정책 오류

**증상**: `row-level security policy` 위반

**확인**:
```sql
-- RLS 활성화 여부 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 정책 목록 확인
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'orders';
```

**해결**: 마이그레이션 파일 재실행 (RLS 정책 섹션)

---

## 6. 테이블 스키마 요약

### 6.1 Core Tables (기본)
| 테이블 | 설명 | 주요 필드 |
|--------|------|-----------|
| `user_profiles` | 사용자 프로필 | profile_type, organization_name, onboarding_complete |
| `services` | 서비스/상품 | service_type, external_url, inquiry_enabled |
| `blog_posts` | 블로그 포스트 | title, content, slug |
| `portfolios` | 포트폴리오 | title, description, images |
| `experiences` | 경력/경험 | company, position, period |

### 6.2 Customer & Orders (고객 및 주문)
| 테이블 | 설명 | 주요 필드 |
|--------|------|-----------|
| `customers` | 고객 문의 | name, email, phone, status, **service_id** ⭐ |
| `orders` | 주문 관리 | order_number, seller_id, buyer_id, service_id, status |
| `payments` | 결제 내역 | payment_key, method, total_amount, status |

### 6.3 Subscriptions & AI (구독 및 AI)
| 테이블 | 설명 | 주요 필드 |
|--------|------|-----------|
| `subscriptions` | 구독 관리 | plan, status, ai_images_used, ai_copywriting_used |
| `subscription_invoices` | 구독 결제 내역 | amount, billing_period, payment_key |
| `ai_usage_logs` | AI 사용 로그 | feature_type, cost_usd, cost_krw, metadata |

---

## 7. 다음 단계

✅ **마이그레이션 완료 후**:
1. Supabase Table Editor에서 모든 테이블 확인
2. 테스트 데이터 입력 (선택)
3. Vercel 환경 변수 설정
4. 배포 및 테스트

📝 **관련 문서**:
- [배포 가이드](./VERCEL_DEPLOYMENT_GUIDE.md)
- [결제 시스템 설계](./PAYMENT_SYSTEM_DESIGN.md)

---

**작성일**: 2026-01-25  
**최종 업데이트**: fa7dbf2  
**프로젝트**: JobsBuild (구 Corefy)
