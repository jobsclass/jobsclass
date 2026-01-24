# Corefy - 지식 서비스 판매 SaaS 플랫폼

**Phase 1: 웹빌더 SaaS (마켓플레이스 제외)**

인플루언서와 전문가가 자신의 지식 서비스를 쉽게 판매할 수 있는 독립형 쇼핑몰 플랫폼입니다.

---

## 🎯 프로젝트 개요

### 핵심 컨셉
- **폼 기반 웹사이트 생성**: 드래그앤드롭 없이 내용만 입력하면 자동으로 프로페셔널한 웹사이트 생성
- **독립형 쇼핑몰**: 각 파트너가 독립적인 URL로 자신의 쇼핑몰 운영 (`/p/[partner-name]`)
- **빠른 시작**: 30분 만에 서비스 등록부터 판매까지 가능

### 비즈니스 모델
- **월 구독료**:
  - FREE: ₩0 (거래 수수료 10%)
  - STARTER: ₩29,000 (거래 수수료 7%)
  - PRO: ₩49,000 (거래 수수료 5%)
- 파트너가 SNS로 자기 팔로워를 고객으로 전환
- 마켓플레이스는 파트너 50명 이상 모이면 Phase 2로 추가 예정

---

## ✅ 완성된 기능 (Phase 1)

### 1. 파트너 기능
- ✅ **회원가입/로그인** (Supabase Auth)
- ✅ **대시보드**
  - 통계 카드 (총 매출, 이번 달 주문, 운영 중인 서비스)
  - 최근 주문 목록
  - 빠른 액션
- ✅ **서비스 등록**
  - 7가지 서비스 타입 (온라인강의, 오프라인강의, 컨설팅, 부트캠프, 코칭, 이벤트, 전문서비스)
  - 폼 기반 간편 입력
  - 자동 URL 슬러그 생성
- ✅ **서비스 관리**
  - 등록된 서비스 목록
  - 수정/삭제 기능

### 2. 공개 서비스 페이지
- ✅ **자동 웹페이지 생성**: `/p/[partner]/[service]`
- ✅ 반응형 디자인
- ✅ 서비스 타입별 맞춤 템플릿
- ✅ 장바구니/구매 버튼 (UI만)

---

## 🚧 다음 개발 단계 (Phase 1 완성)

### 🔥 최우선 순위

#### 1. 구매자 인증 시스템 (파트너별 독립)
```typescript
// app/p/[partner]/auth/signup/page.tsx
// - 파트너별로 독립적인 구매자 계정
// - JWT 기반 인증
// - buyers 테이블에 저장
```

#### 2. 장바구니 기능
```typescript
// 구매자가 여러 서비스를 장바구니에 담기
// carts 테이블 활용
// 헤더에 장바구니 아이콘 + 개수 표시
```

#### 3. Toss Payments 결제 연동
```typescript
// app/api/payments/request/route.ts
// - 주문 생성 (orders 테이블)
// - Toss Payments SDK 호출
// - 결제 성공 시 enrollments 생성 (온라인 강의)
```

#### 4. 쿠폰 시스템
```typescript
// app/dashboard/coupons/page.tsx
// - 쿠폰 생성 (할인율/고정금액)
// - 유효기간, 사용 제한 설정
// - 실시간 검증 API
```

#### 5. LMS 기능
```typescript
// 파트너: 비메오 링크 등록
// app/dashboard/services/[id]/videos/page.tsx

// 구매자: 영상 수강
// app/learn/[service]/page.tsx
// - 왼쪽: 챕터 목록
// - 오른쪽: 비메오 영상 플레이어
// - 영상 시청 시 started_watching = true (환불 불가)
```

#### 6. 구매자 마이페이지
```typescript
// /p/[partner]/my/orders - 주문 내역
// /p/[partner]/my/courses - 수강 목록
```

#### 7. 환불 시스템
```typescript
// refund_requests 테이블
// started_watching = false일 때만 환불 가능
```

---

## 📁 프로젝트 구조

```
corefy/
├── app/
│   ├── (landing)
│   │   └── page.tsx              # 메인 랜딩 페이지
│   ├── auth/partner/
│   │   ├── signup/               # 파트너 회원가입
│   │   └── login/                # 파트너 로그인
│   ├── dashboard/                # 파트너 대시보드
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── services/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── orders/               # (TODO)
│   │   ├── coupons/              # (TODO)
│   │   └── settings/             # (TODO)
│   └── p/[partner]/              # 공개 서비스 페이지
│       ├── [service]/page.tsx
│       ├── auth/                 # (TODO) 구매자 인증
│       ├── cart/                 # (TODO) 장바구니
│       ├── checkout/             # (TODO) 결제
│       └── my/                   # (TODO) 마이페이지
│
├── components/
│   └── dashboard/
│       └── Sidebar.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── utils.ts
│   └── auth.ts
│
├── types/
│   └── database.ts
│
├── supabase/
│   └── schema.sql                # DB 스키마 (10개 테이블)
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## 🗄️ 데이터베이스 스키마 (10개 테이블)

1. **partner_profiles** - 파트너 정보
2. **services** - 서비스 상품
3. **course_videos** - 온라인 강의 영상 (비메오 URL)
4. **buyers** - 구매자 (파트너별 독립 계정)
5. **carts** - 장바구니
6. **orders** - 주문
7. **enrollments** - 온라인 강의 수강 정보
8. **coupons** - 쿠폰
9. **coupon_usage** - 쿠폰 사용 내역
10. **refund_requests** - 환불 요청

---

## 🚀 개발 환경 시작하기

### 1단계: Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 파일 실행
3. Settings → API에서 URL과 anon key 복사

### 2단계: 환경변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_TOSS_CLIENT_KEY=your-toss-client-key
TOSS_SECRET_KEY=your-toss-secret-key
```

### 3단계: 의존성 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 🎨 주요 URL 구조

### 파트너 (Supabase Auth)
- `/` - 랜딩 페이지
- `/auth/partner/signup` - 파트너 회원가입
- `/auth/partner/login` - 파트너 로그인
- `/dashboard` - 대시보드
- `/dashboard/services` - 서비스 관리
- `/dashboard/services/new` - 새 서비스 등록
- `/dashboard/orders` - 주문 관리 (TODO)
- `/dashboard/coupons` - 쿠폰 관리 (TODO)

### 구매자 (파트너별 독립)
- `/p/[partner]/[service]` - 서비스 상세 페이지 ✅
- `/p/[partner]/auth/signup` - 구매자 회원가입 (TODO)
- `/p/[partner]/auth/login` - 구매자 로그인 (TODO)
- `/p/[partner]/cart` - 장바구니 (TODO)
- `/p/[partner]/checkout` - 결제 (TODO)
- `/p/[partner]/my/orders` - 내 주문 (TODO)
- `/p/[partner]/my/courses` - 내 수강 목록 (TODO)
- `/learn/[service]` - LMS 영상 수강 (TODO)

---

## 🛠️ 기술 스택

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (파트너), JWT (구매자)
- **Storage**: Supabase Storage
- **Payment**: Toss Payments (TODO)
- **Video**: Vimeo Embed
- **Deployment**: Vercel (권장)

---

## 📊 개발 진행률

| 기능 | 완성도 | 상태 |
|------|--------|------|
| 랜딩 페이지 | 100% | ✅ |
| 파트너 인증 | 100% | ✅ |
| 파트너 대시보드 | 100% | ✅ |
| 서비스 등록 | 80% | ✅ (기본 폼) |
| 공개 서비스 페이지 | 100% | ✅ |
| 구매자 인증 | 0% | ❌ |
| 장바구니 | 0% | ❌ |
| 결제 시스템 | 0% | ❌ |
| 쿠폰 시스템 | 0% | ❌ |
| LMS 기능 | 0% | ❌ |
| 환불 시스템 | 0% | ❌ |

**Phase 1 완성도**: **40%**

---

## 🗺️ 로드맵

### Phase 1: 웹빌더 SaaS (진행 중)
- ✅ 파트너 기능 (40% 완료)
- ⏳ 구매자 기능 (0%)
- ⏳ 결제 시스템 (0%)
- ⏳ LMS 기능 (0%)
- ⏳ 쿠폰/환불 (0%)

**목표**: 6주 내 완성, 베타 테스트 시작

### Phase 2: 마켓플레이스 (파트너 50명 이상 시)
- ❌ 통합 서비스 검색
- ❌ 필터링 및 정렬
- ❌ 추천 알고리즘
- ❌ 구매자 통합 계정
- ❌ 리뷰 시스템

**조건**: 파트너 50명 + 월 거래액 1억 이상

### Phase 3: 인재 연결 (미래)
- ❌ 프리랜서 매칭
- ❌ 프로젝트 의뢰
- ❌ 포트폴리오

---

## 💡 핵심 특징

### 1. 폼 기반 웹사이트 생성
- **드래그앤드롭 없음**: 내용만 입력하면 자동 생성
- **빠른 시작**: 30분 만에 판매 시작
- **프로페셔널 템플릿**: 서비스 타입별 최적화된 디자인

### 2. 독립형 쇼핑몰
- 각 파트너가 자신만의 URL (`/p/partner-name`)
- 파트너별 독립 구매자 계정
- 파트너가 SNS로 자기 고객 유입

### 3. 비메오 연동 LMS
- 자체 영상 저장소 불필요
- 비메오 링크만 입력
- 영상 시청 시 환불 불가 처리

### 4. 투명한 수수료
- FREE: 10%, STARTER: 7%, PRO: 5%
- 숨겨진 비용 없음

---

## 🤝 기여 가이드

현재는 초기 개발 단계로 외부 기여를 받지 않습니다.

---

## 📝 라이선스

Proprietary - All rights reserved

---

## 📞 문의

프로젝트 관련 문의: [이메일 주소]

---

**Corefy - 지식으로 돈을 버는 가장 쉬운 방법** 🚀
