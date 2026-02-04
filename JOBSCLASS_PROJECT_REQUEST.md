# 🚀 JobsClass 프로젝트 신규 생성 요청서

**작성일**: 2026-02-04  
**목적**: JobsClass 지식서비스 플랫폼을 처음부터 새로 생성  
**기존 프로젝트**: https://github.com/jobsclass/jobsclass

---

## 📋 프로젝트 개요

### 프로젝트명
**JobsClass** - 전문가 지식과 서비스를 거래하는 플랫폼

### 핵심 목표
전문가(파트너)가 자신의 지식과 서비스를 등록하고, 구매자가 검색/구매/리뷰할 수 있는 **지식 마켓플레이스** 구축

---

## 🎯 핵심 기능 (Phase 1)

### 1. 파트너 기능 (전문가/판매자)
```
✅ 회원가입/로그인 (Supabase Auth)
✅ 파트너 대시보드
  - 총 조회수, 주문 수, 매출, 평균 평점
  - 최근 주문 목록
  - 인기 서비스 TOP 3
✅ 서비스 등록/관리
  - 서비스 등록 폼 (제목, 설명, 카테고리, 가격, 기간)
  - 서비스 목록 (검색, 필터, 정렬)
  - 서비스 수정/삭제
  - 서비스 활성화/비활성화
✅ 주문 관리
  - 주문 목록 (상태별 필터)
  - 주문 상세 보기
  - 주문 상태 업데이트 (확인 → 진행중 → 완료)
✅ 리뷰 관리
  - 받은 리뷰 목록
  - 평균 평점 및 통계
  - 리뷰 답글 (선택)
```

### 2. 구매자 기능
```
✅ 회원가입/로그인 (JWT 기반)
✅ 서비스 검색/탐색
  - 카테고리별 탐색
  - 검색 (제목, 설명, 태그)
  - 필터 (가격 범위, 평점, 카테고리)
  - 정렬 (최신순, 인기순, 평점순, 가격순)
✅ 서비스 상세 보기
  - 서비스 정보
  - 파트너 프로필
  - 리뷰 목록
  - 구매 버튼
✅ 장바구니
  - 서비스 추가/제거
  - 수량 조절
  - 총 금액 계산
✅ 결제
  - Toss Payments 연동
  - 결제 성공/실패 처리
✅ 주문 관리
  - 주문 내역
  - 주문 상세 보기
  - 주문 취소 요청
✅ 리뷰 작성
  - 주문 완료 후 리뷰 작성
  - 별점 (1-5)
  - 텍스트 리뷰
```

### 3. 관리자 기능 (선택)
```
⏳ 전체 통계 대시보드
⏳ 파트너 관리
⏳ 주문 관리
⏳ 환불 요청 처리
```

---

## 🗄️ 데이터베이스 설계

### 핵심 테이블 (12개)

#### 1. partner_profiles (파트너 정보)
```sql
CREATE TABLE partner_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  profile_url TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  total_sales NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. services (서비스 상품)
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  service_type TEXT NOT NULL, -- hourly, project, package
  price NUMERIC(12,2) NOT NULL,
  duration_hours INTEGER,
  duration_days INTEGER,
  features TEXT[],
  requirements TEXT[],
  deliverables TEXT[],
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, slug)
);
```

#### 3. buyers (구매자)
```sql
CREATE TABLE buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. carts (장바구니)
```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_id, service_id)
);
```

#### 5. orders (주문)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  service_id UUID NOT NULL REFERENCES services(id),
  buyer_id UUID NOT NULL REFERENCES buyers(id),
  partner_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending, paid, confirmed, in_progress, completed, cancelled, refunded
  payment_method TEXT,
  payment_key TEXT,
  paid_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. service_reviews (리뷰)
```sql
CREATE TABLE service_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id),
  partner_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 7. notifications (알림)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- partner or buyer
  user_type TEXT NOT NULL, -- 'partner' or 'buyer'
  type TEXT NOT NULL, -- 'order_new', 'order_completed', 'review_new'
  title TEXT NOT NULL,
  message TEXT,
  link_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 8. coupons (쿠폰) - Phase 2
```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES auth.users(id),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
  discount_value NUMERIC(12,2) NOT NULL,
  min_purchase_amount NUMERIC(12,2),
  max_usage_count INTEGER,
  current_usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 UI/UX 요구사항

### 디자인 시스템
- **다크 테마** 기본
- **TailwindCSS** 사용
- **Lucide React** 아이콘
- **반응형** 디자인 (모바일/태블릿/데스크톱)

### 주요 페이지 구조

#### 파트너 영역 (/dashboard)
```
/dashboard
  ├── /                    # 대시보드 (통계)
  ├── /services            # 서비스 목록
  ├── /services/new        # 서비스 등록
  ├── /services/[id]/edit  # 서비스 수정
  ├── /orders              # 주문 관리
  ├── /orders/[id]         # 주문 상세
  ├── /reviews             # 리뷰 관리
  └── /profile             # 프로필 설정
```

#### 구매자 영역 (/marketplace)
```
/marketplace
  ├── /                    # 서비스 탐색
  ├── /services/[slug]     # 서비스 상세
  ├── /cart                # 장바구니
  ├── /checkout            # 결제
  ├── /orders              # 주문 내역
  ├── /orders/[id]         # 주문 상세
  └── /orders/[id]/review  # 리뷰 작성
```

#### 인증
```
/auth
  ├── /partner/signup      # 파트너 회원가입
  ├── /partner/login       # 파트너 로그인
  ├── /buyer/signup        # 구매자 회원가입
  └── /buyer/login         # 구매자 로그인
```

---

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **TailwindCSS**

### Backend
- **Next.js API Routes**
- **Supabase** (Database + Auth)

### 결제
- **Toss Payments**

### 배포
- **Vercel**

---

## 📦 주요 의존성

```json
{
  "dependencies": {
    "next": "^15.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.45.7",
    "@supabase/ssr": "^0.5.2",
    "@tosspayments/payment-sdk": "^1.9.2",
    "bcryptjs": "^2.4.3",
    "jose": "^5.9.6",
    "lucide-react": "^0.469.0",
    "react-hot-toast": "^2.4.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.10.5",
    "@types/react": "^19.0.6",
    "@types/react-dom": "^19.0.2",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3"
  }
}
```

---

## 🔧 개발 환경 설정

### 1. 프로젝트 생성
```bash
npx create-next-app@latest jobsclass --typescript --tailwind --app
cd jobsclass
```

### 2. 의존성 설치
```bash
npm install @supabase/supabase-js @supabase/ssr @tosspayments/payment-sdk bcryptjs jose lucide-react react-hot-toast clsx tailwind-merge
npm install -D @types/bcryptjs
```

### 3. 환경변수 (.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT (구매자 인증용)
JWT_SECRET=your_jwt_secret_key

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
TOSS_SECRET_KEY=your_toss_secret_key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Supabase 설정
```bash
# SQL Editor에서 실행
1. schema.sql 실행 (테이블 생성)
2. RLS 정책 설정
3. 트리거 설정
```

---

## 📋 개발 우선순위

### Phase 1: 핵심 기능 (4주)
**Week 1**: 인증 + 파트너 대시보드
- ✅ Supabase Auth 설정
- ✅ 파트너 회원가입/로그인
- ✅ 대시보드 레이아웃 + 사이드바

**Week 2**: 서비스 등록/관리
- ✅ 서비스 등록 폼
- ✅ 서비스 목록 (검색, 필터)
- ✅ 서비스 수정/삭제

**Week 3**: 구매자 + 장바구니 + 결제
- ✅ 구매자 회원가입/로그인 (JWT)
- ✅ 서비스 탐색 페이지
- ✅ 장바구니 기능
- ✅ Toss Payments 연동

**Week 4**: 주문 + 리뷰
- ✅ 주문 생성/관리
- ✅ 주문 상태 업데이트
- ✅ 리뷰 작성/표시

### Phase 2: 개선 (2주)
**Week 5**: UI/UX 개선
- ✅ 반응형 디자인
- ✅ 로딩 상태 표시
- ✅ 에러 처리

**Week 6**: 추가 기능
- ✅ 쿠폰 시스템
- ✅ 알림 시스템
- ✅ 통계 강화

---

## 🎯 JobsVentures 참고 기능

### JobsVentures에서 이미 구현된 기능 (참고용)
```
✅ 서비스 등록/관리 UI
  - /home/user/webapp/app/dashboard/expert-services/
  - 검색, 필터, 정렬, 통계
  
✅ 주문 관리 UI
  - /home/user/webapp/app/dashboard/orders/
  - 주문 목록, 상세, 상태 업데이트
  
✅ 리뷰 시스템
  - /home/user/webapp/app/dashboard/orders/[id]/review/
  - 별점, 텍스트 리뷰
  
✅ API 라우트
  - /home/user/webapp/app/api/expert-services/
  - /home/user/webapp/app/api/orders/
  - /home/user/webapp/app/api/payments/
  
✅ DB 마이그레이션
  - /home/user/webapp/supabase/migrations/FINAL_MIGRATION.sql
  - expert_services, service_orders, service_reviews 테이블
```

**참고 문서**:
- `/home/user/webapp/JOBSCLASS_ENHANCEMENT_PLAN.md`
- `/home/user/webapp/PROJECT_SPLIT_PLAN.md`

---

## 📝 기존 JobsClass 프로젝트 현황

### GitHub
- **Repository**: https://github.com/jobsclass/jobsclass
- **현재 완성도**: 40%
- **로컬 경로**: `/home/user/jobsclass/`

### 완료된 기능
```
✅ 파트너 인증 (Supabase Auth)
✅ 파트너 대시보드 (기본)
✅ 서비스 등록/관리 (7가지 타입)
✅ 공개 서비스 페이지
```

### 미완성 기능
```
❌ 구매자 인증 (JWT)
❌ 장바구니
❌ 결제 시스템
❌ 주문 관리
❌ 리뷰 시스템
```

---

## 🚀 새 프로젝트 생성 시 장점

### 1. 깨끗한 시작
- ✅ 불필요한 코드 제거
- ✅ 명확한 구조
- ✅ 최신 베스트 프랙티스 적용

### 2. JobsVentures 경험 활용
- ✅ 검증된 UI/UX 패턴
- ✅ 완성된 API 설계
- ✅ DB 스키마 최적화

### 3. 빠른 개발
- ✅ 4주 내 Phase 1 완성 가능
- ✅ 기존 코드 참고하여 복사/수정
- ✅ 이미 해결된 문제 회피

---

## 📂 참고 파일 위치

### JobsVentures (현재 프로젝트)
```
/home/user/webapp/
  ├── app/dashboard/expert-services/     # 서비스 관리 UI
  ├── app/dashboard/orders/              # 주문 관리 UI
  ├── app/api/expert-services/           # 서비스 API
  ├── app/api/orders/                    # 주문 API
  ├── app/api/payments/                  # 결제 API
  └── supabase/migrations/               # DB 마이그레이션
```

### JobsClass (기존 프로젝트)
```
/home/user/jobsclass/
  ├── app/dashboard/services/            # 기존 서비스 관리
  ├── supabase/schema.sql                # 기존 DB 스키마
  └── 기타 문서들...
```

---

## ✅ 다음 단계

### 옵션 A: 새 프로젝트 생성
```bash
# 1. 새 Next.js 프로젝트 생성
cd /home/user
npx create-next-app@latest jobsclass-v2 --typescript --tailwind --app

# 2. JobsVentures에서 필요한 파일 복사
# 3. 수정 및 커스터마이징
# 4. GitHub 푸시
```

### 옵션 B: 기존 프로젝트 정리
```bash
# 1. /home/user/jobsclass/ 정리
# 2. 불필요한 파일 제거
# 3. JobsVentures 기능 통합
# 4. GitHub 푸시
```

---

## 💬 요청 사항 정리

**AI Assistant에게 요청할 내용**:

> "JobsClass 프로젝트를 새로 생성해주세요.
> 
> **요구사항**:
> - Next.js 15 + TypeScript + TailwindCSS
> - Supabase Auth + Database
> - Toss Payments 연동
> - 파트너 대시보드 (서비스 등록/관리, 주문 관리, 리뷰 관리)
> - 구매자 페이지 (서비스 탐색, 장바구니, 결제, 리뷰 작성)
> 
> **참고 프로젝트**:
> - JobsVentures: /home/user/webapp/
> - 기존 JobsClass: /home/user/jobsclass/
> - 개선 계획서: /home/user/webapp/JOBSCLASS_ENHANCEMENT_PLAN.md
> 
> **요청**:
> 1. 새 프로젝트 생성 (/home/user/jobsclass-v2/)
> 2. JobsVentures의 지식서비스 기능 참고하여 구현
> 3. DB 마이그레이션 파일 작성
> 4. 기본 UI 컴포넌트 구현
> 5. README 작성
> 
> **중요**: 
> - 기존 /home/user/jobsclass/ 프로젝트는 건드리지 말 것
> - 완전히 새로운 프로젝트로 생성
> - JobsVentures 코드를 참고만 하고, 복사할 때는 JobsClass에 맞게 수정"

---

**문서 작성**: AI Assistant  
**프로젝트 경로**: `/home/user/webapp/JOBSCLASS_PROJECT_REQUEST.md`  
**최종 업데이트**: 2026-02-04
