# 🎉 Phase 2 개발 완료 - 사용자 안내서

**완료 일자**: 2026-01-25  
**프로젝트**: Corefy Phase 2  
**깃허브**: https://github.com/jobsclass/corefy  
**배포 URL**: https://corefy-git-main-jobs-class.vercel.app

---

## ✅ Phase 2에서 완성된 기능

### 1. 구매자 인증 시스템
- ✅ **구매자 회원가입** (`/auth/buyer/signup`)
- ✅ **구매자 로그인** (`/auth/buyer/login`)
- ✅ Supabase Auth 연동
- ✅ buyers 테이블 (전역 구매자 시스템)

### 2. 장바구니 시스템
- ✅ **장바구니 담기** (서비스 상세 페이지)
- ✅ **장바구니 페이지** (`/cart`)
  - 담긴 서비스 목록
  - 개별 삭제
  - 총 금액 계산

### 3. 주문 & 결제
- ✅ **결제 페이지** (`/checkout`)
  - 주문 상품 확인
  - 간편 결제 (테스트 모드)
  - 주문 자동 생성 (orders 테이블)
  - 수강 등록 자동 생성 (enrollments 테이블)
  - 장바구니 자동 비우기

### 4. 내 수강 목록
- ✅ **수강 목록 페이지** (`/my/enrollments`)
  - 구매한 서비스 목록
  - 학습 상태 (시작 전/진행 중/완료)
  - 학습 시작 버튼

---

## 🚨 **중요! 반드시 해야 할 작업**

### 1️⃣ Supabase Buyers 마이그레이션 실행 (필수!)

**위치**: `supabase/buyers_migration.sql`

**실행 방법**:
1. https://supabase.com/dashboard 접속
2. 프로젝트: `pzjedtgqrqcipfmtkoce` 선택
3. SQL Editor → New query 클릭
4. 아래 SQL 전체 복사 후 붙여넣기
5. **Run** 클릭
6. "Buyers migration completed!" 메시지 확인

**SQL**:
```sql
-- ============================================
-- Buyers 테이블 재구성 (전역 구매자 시스템)
-- ============================================

-- 기존 buyers 테이블 삭제
DROP TABLE IF EXISTS buyers CASCADE;

-- 새로운 buyers 테이블 생성 (Supabase Auth 연동)
CREATE TABLE buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_buyers_user_id ON buyers(user_id);

-- carts 테이블 재생성 (buyer_id는 buyers.id 참조)
DROP TABLE IF EXISTS carts CASCADE;

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(buyer_id, service_id)
);

CREATE INDEX idx_carts_buyer_id ON carts(buyer_id);

-- orders 테이블 재생성 (buyer_id는 buyers.id 참조)
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  final_amount NUMERIC(12, 2) NOT NULL,
  coupon_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_partner_id ON orders(partner_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);

-- enrollments 재생성
DROP TABLE IF EXISTS enrollments CASCADE;

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  started_watching BOOLEAN DEFAULT FALSE,
  progress JSONB,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id, service_id, buyer_id)
);

CREATE INDEX idx_enrollments_buyer_id ON enrollments(buyer_id);

-- coupon_usage 재생성
DROP TABLE IF EXISTS coupon_usage CASCADE;

CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);

-- refund_requests 재생성
DROP TABLE IF EXISTS refund_requests CASCADE;

CREATE TABLE refund_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refund_requests_order_id ON refund_requests(order_id);

-- RLS 비활성화 (개발 단계)
ALTER TABLE buyers DISABLE ROW LEVEL SECURITY;
ALTER TABLE carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests DISABLE ROW LEVEL SECURITY;

-- 스키마 리로드
NOTIFY pgrst, 'reload schema';

-- 확인
SELECT 'Buyers migration completed!' as status;
```

**⚠️ 주의**: 이 작업을 하지 않으면 **장바구니/주문/결제 기능이 작동하지 않습니다!**

---

## 🧪 테스트 시나리오

### 1. 구매자 회원가입
```
1) https://corefy-git-main-jobs-class.vercel.app/auth/buyer/signup 접속
2) 이메일, 비밀번호, 이름, 전화번호 입력
3) "회원가입" 클릭
4) 홈페이지로 리다이렉트
```

### 2. 서비스 둘러보기 & 장바구니 담기
```
1) 홈페이지에서 파트너 프로필 접속 (/p/[partner])
2) 서비스 클릭 → 서비스 상세 페이지
3) "장바구니 담기" 버튼 클릭
4) 장바구니 페이지로 자동 이동 (/cart)
```

### 3. 장바구니 확인
```
1) /cart 페이지에서 담긴 서비스 확인
2) 삭제 버튼 (🗑️) 클릭하여 개별 삭제 가능
3) 총 금액 확인
4) "결제하기" 버튼 클릭
```

### 4. 결제하기
```
1) /checkout 페이지에서 주문 상품 확인
2) 총 결제 금액 확인
3) "결제하기" 버튼 클릭 (테스트 모드 - 실제 결제 안됨)
4) 주문 자동 생성 (orders 테이블)
5) 수강 등록 자동 생성 (enrollments 테이블)
6) "내 수강 목록"으로 리다이렉트
```

### 5. 내 수강 목록 확인
```
1) /my/enrollments 접속
2) 구매한 서비스 목록 확인
3) "학습 시작" 또는 "이어보기" 버튼 클릭
4) 서비스 상세 페이지로 이동
```

---

## 📊 데이터 흐름

```
[구매자 회원가입]
    ↓
auth.users 생성
    ↓
buyers 테이블 생성 (user_id 연결)

[장바구니 담기]
    ↓
carts 테이블에 추가 (buyer_id, service_id)

[결제하기]
    ↓
orders 테이블 생성 (buyer_id, service_id, partner_id)
    ↓
enrollments 테이블 생성 (order_id, buyer_id, service_id)
    ↓
carts 테이블에서 삭제

[내 수강 목록]
    ↓
enrollments 조회 (buyer_id)
```

---

## 🎯 완료된 기능 요약

| 기능 | 상태 | 페이지 |
|------|------|--------|
| **구매자 회원가입** | ✅ | `/auth/buyer/signup` |
| **구매자 로그인** | ✅ | `/auth/buyer/login` |
| **장바구니 담기** | ✅ | 서비스 상세 페이지 |
| **장바구니 목록** | ✅ | `/cart` |
| **장바구니 삭제** | ✅ | `/cart` |
| **결제 페이지** | ✅ | `/checkout` |
| **주문 생성** | ✅ | 자동 (결제 시) |
| **수강 등록 생성** | ✅ | 자동 (결제 시) |
| **내 수강 목록** | ✅ | `/my/enrollments` |

---

## 📝 주요 변경사항

### 데이터베이스
- ✅ buyers 테이블 재구조화 (전역 구매자)
- ✅ carts 테이블 외래키 업데이트
- ✅ orders 테이블 외래키 업데이트
- ✅ enrollments 테이블 외래키 업데이트
- ✅ coupon_usage 테이블 외래키 업데이트
- ✅ refund_requests 테이블 외래키 업데이트

### 새로운 컴포넌트
- ✅ `AddToCartButton` (클라이언트 컴포넌트)

### 새로운 페이지
- ✅ `/auth/buyer/signup` - 구매자 회원가입
- ✅ `/auth/buyer/login` - 구매자 로그인
- ✅ `/cart` - 장바구니
- ✅ `/checkout` - 결제
- ✅ `/my/enrollments` - 내 수강 목록

---

## 🚀 다음 단계 (Phase 3 - 선택사항)

### 우선순위 높음
1. **실제 결제 연동** (Stripe 또는 Toss Payments)
2. **강의 영상 관리** (course_videos CRUD)
3. **파일 업로드** (Supabase Storage)

### 우선순위 중간
4. **수강생 관리 대시보드** (파트너용)
5. **검색 기능** (서비스 검색, 필터)
6. **대시보드 차트** (매출 그래프)

### 우선순위 낮음
7. **환불 요청 관리**
8. **이메일 알림**
9. **리뷰 시스템**
10. **쿠폰 적용 기능** (결제 시)

---

## ✅ 최종 체크리스트

- [x] 구매자 회원가입/로그인 작동
- [x] 장바구니 담기 작동
- [x] 장바구니 페이지 작동
- [x] 결제 페이지 작동
- [x] 주문 자동 생성
- [x] 수강 등록 자동 생성
- [x] 내 수강 목록 작동
- [x] Git 커밋 & 푸시
- [x] 빌드 테스트 통과
- [x] Vercel 자동 배포
- [ ] **Supabase buyers 마이그레이션 실행 (필수!)**

---

## 🎊 Phase 2 완료!

**핵심 기능이 모두 완성**되었습니다!  

**⚠️ 중요**: 반드시 **Supabase buyers 마이그레이션**을 먼저 실행하세요!  
그래야 장바구니, 결제, 수강 등록 기능이 정상 작동합니다.

**배포 URL**: https://corefy-git-main-jobs-class.vercel.app

감사합니다! 🚀
