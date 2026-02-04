# JobsClass - 지식서비스 마켓플레이스

## 📋 프로젝트 개요

**JobsClass**는 전문가(파트너)와 클라이언트를 연결하는 지식서비스 마켓플레이스입니다.
- **10% 플랫폼 수수료**: 파트너 90%, 플랫폼 10%
- **7가지 서비스 유형**: 온라인 강의, 코칭, 컨설팅, 전자책, 템플릿, 전문 서비스, 커뮤니티
- **8개 카테고리**: IT·개발, 디자인, 비즈니스, 재테크, 창업, 라이프, 자기계발, 컨설팅

---

## 🎯 핵심 기능

### 1️⃣ 파트너 기능
- ✅ 서비스 등록/관리 (7가지 유형)
- ✅ 주문 관리 (상태 업데이트)
- ✅ 리뷰 관리 (답글 작성)
- ✅ 대시보드 (통계, 매출)
- ✅ 정산 신청

### 2️⃣ 클라이언트 기능
- ✅ 서비스 검색/탐색 (카테고리별)
- ✅ 서비스 상세 보기
- ✅ 장바구니
- ✅ 결제 (Toss Payments)
- ✅ 주문 내역
- ✅ 리뷰 작성

### 3️⃣ 관리자 기능 (Phase 2)
- ⏳ 전체 통계
- ⏳ 파트너 관리
- ⏳ 정산 처리

---

## 🗄️ 데이터베이스 구조

### 핵심 테이블 (9개)

1. **partner_profiles** - 파트너 정보
2. **services** - 지식서비스 상품
3. **clients** - 구매자 정보
4. **orders** - 주문 (10% 수수료 구조)
5. **service_reviews** - 서비스 리뷰
6. **carts** - 장바구니
7. **notifications** - 알림
8. **payouts** - 정산
9. **coupons** - 쿠폰 (Phase 2)

### 10% 수수료 구조

```typescript
// 주문 금액 계산
const amount = 100000;  // 10만원
const platform_fee = amount * 0.1;  // 1만원 (10%)
const partner_amount = amount * 0.9;  // 9만원 (90%)

// orders 테이블
{
  amount: 100000,
  platform_fee: 10000,
  partner_amount: 90000
}
```

---

## 🎨 서비스 유형 (7가지)

### 1. 온라인 강의 (online-course)
- 녹화된 영상 강의
- 커리큘럼 구성
- 예시: "React 완전 정복 강의"

### 2. 1:1 코칭/멘토링 (coaching)
- 시간 단위 (1시간, 2시간)
- 1:1 화상 상담
- 예시: "프론트엔드 커리어 코칭"

### 3. 컨설팅 (consulting)
- 프로젝트 단위
- 문제 해결 중심
- 예시: "웹사이트 성능 최적화 컨설팅"

### 4. 전자책 (ebook)
- PDF, ePub 등
- 다운로드 제공
- 예시: "개발자를 위한 마케팅 가이드"

### 5. 템플릿/도구 (template)
- 디자인 템플릿, 코드 스니펫
- 즉시 다운로드
- 예시: "Notion 생산성 템플릿"

### 6. 전문 서비스 (service)
- 제작 대행 (디자인, 개발 등)
- 결과물 제공
- 예시: "로고 디자인 제작"

### 7. 커뮤니티/멤버십 (community)
- 월 구독 형태
- 지속적인 콘텐츠 제공
- 예시: "개발자 커뮤니티 멤버십"

---

## 📂 카테고리 시스템 (8개 대분류)

### 1️⃣ IT·개발 (it-dev)
- 웹 개발, 앱 개발, 데이터·AI, 게임 개발, 프로그래밍 기초

### 2️⃣ 디자인·크리에이티브 (design-creative)
- UI/UX, 그래픽, 영상 제작, 3D·VR

### 3️⃣ 비즈니스·마케팅 (business-marketing)
- SNS 마케팅, 퍼포먼스 마케팅, 브랜딩, 콘텐츠 제작

### 4️⃣ 재테크·금융 (finance-investment)
- 주식·투자, 부동산, 경제·금융

### 5️⃣ 창업·부업 (startup-sidejob)
- 온라인 비즈니스, 오프라인 창업, 프리랜서

### 6️⃣ 라이프·취미 (life-hobby)
- 요리·베이킹, 운동·건강, 공예·DIY, 반려동물

### 7️⃣ 자기계발·교양 (self-improvement)
- 외국어, 독서·글쓰기, 심리·상담, 커리어·이직

### 8️⃣ 전문 컨설팅 (consulting)
- 법률, 세무·회계, 노무·인사, 특허·지식재산

---

## 🛠 기술 스택

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

## 📋 주요 API 엔드포인트

### 파트너 API
```
POST   /api/services/create          # 서비스 등록
GET    /api/services/list            # 서비스 목록
PUT    /api/services/edit            # 서비스 수정
DELETE /api/services/delete          # 서비스 삭제
GET    /api/orders/partner           # 파트너 주문 목록
PUT    /api/orders/status            # 주문 상태 업데이트
GET    /api/reviews/partner          # 받은 리뷰 목록
POST   /api/reviews/reply            # 리뷰 답글
GET    /api/dashboard/stats          # 대시보드 통계
POST   /api/payouts/request          # 정산 신청
```

### 클라이언트 API
```
GET    /api/services/search          # 서비스 검색
GET    /api/services/:id             # 서비스 상세
POST   /api/cart/add                 # 장바구니 추가
GET    /api/cart/list                # 장바구니 목록
POST   /api/orders/create            # 주문 생성
POST   /api/payments/toss            # Toss 결제
GET    /api/orders/client            # 클라이언트 주문 목록
POST   /api/reviews/create           # 리뷰 작성
```

### 인증 API
```
POST   /api/auth/partner/signup      # 파트너 회원가입
POST   /api/auth/partner/login       # 파트너 로그인
POST   /api/auth/client/signup       # 클라이언트 회원가입
POST   /api/auth/client/login        # 클라이언트 로그인
```

---

## 📱 주요 페이지 구조

### 파트너 영역 (/dashboard)
```
/dashboard
  ├── /                         # 대시보드 (통계)
  ├── /services                 # 서비스 목록
  ├── /services/new             # 서비스 등록
  ├── /services/[id]/edit       # 서비스 수정
  ├── /orders                   # 주문 관리
  ├── /orders/[id]              # 주문 상세
  ├── /reviews                  # 리뷰 관리
  ├── /payouts                  # 정산
  └── /profile                  # 프로필 설정
```

### 클라이언트 영역 (/marketplace)
```
/marketplace
  ├── /                         # 서비스 탐색
  ├── /services/[slug]          # 서비스 상세
  ├── /cart                     # 장바구니
  ├── /checkout                 # 결제
  ├── /orders                   # 주문 내역
  ├── /orders/[id]              # 주문 상세
  └── /orders/[id]/review       # 리뷰 작성
```

### 공개 페이지
```
/
  ├── /                         # 메인 페이지
  ├── /partners/[username]      # 파트너 프로필
  ├── /auth/partner/signup      # 파트너 회원가입
  ├── /auth/partner/login       # 파트너 로그인
  ├── /auth/client/signup       # 클라이언트 회원가입
  └── /auth/client/login        # 클라이언트 로그인
```

---

## 🎯 JobsVentures 참고 기능

### 좋은 점 (가져올 부분)
1. ✅ **서비스 관리 UI** - 검색, 필터, 정렬이 잘 되어있음
2. ✅ **주문 관리 플로우** - 상태 업데이트가 직관적
3. ✅ **대시보드 통계** - 한눈에 보기 좋은 구조
4. ✅ **카테고리 시스템** - 8개 대분류가 명확

### 개선할 점
1. ❌ **다중 웹사이트 기능** 제거 - 불필요하게 복잡
2. ❌ **구매자 인증 분리** - Supabase Auth와 JWT 혼용 복잡
3. ❌ **과도한 JSONB 사용** - 필요한 필드는 명시적으로

---

## 🚀 개발 우선순위

### Phase 1: 핵심 기능 (4주)

#### Week 1: 인증 + 파트너 기본
- [x] Supabase 프로젝트 설정
- [x] DB 스키마 작성
- [ ] 파트너 회원가입/로그인
- [ ] 대시보드 레이아웃

#### Week 2: 서비스 관리
- [ ] 서비스 등록 폼 (7가지 유형)
- [ ] 서비스 목록 (검색, 필터)
- [ ] 서비스 수정/삭제
- [ ] 카테고리 시스템 적용

#### Week 3: 클라이언트 + 주문
- [ ] 클라이언트 회원가입/로그인 (JWT)
- [ ] 서비스 탐색 페이지
- [ ] 장바구니 기능
- [ ] 주문 생성

#### Week 4: 결제 + 리뷰
- [ ] Toss Payments 연동
- [ ] 주문 상태 관리
- [ ] 리뷰 작성/표시
- [ ] 알림 시스템

### Phase 2: 개선 (2주)

#### Week 5: UI/UX
- [ ] 반응형 디자인
- [ ] 로딩 상태
- [ ] 에러 처리
- [ ] 통계 강화

#### Week 6: 추가 기능
- [ ] 쿠폰 시스템
- [ ] 정산 자동화
- [ ] 관리자 페이지
- [ ] 이메일 알림

---

## 💡 핵심 차별화 포인트

### vs 탈잉/클래스101
- ✅ **파트너 중심**: 자유로운 서비스 구성
- ✅ **낮은 수수료**: 10% (경쟁사 20-30%)
- ✅ **빠른 정산**: 주 1회 정산

### vs 크몽/숨고
- ✅ **지식 특화**: 교육/강의에 최적화
- ✅ **커리큘럼 시스템**: 강의 구조화
- ✅ **리뷰 중심**: 신뢰 기반 매칭

---

## 📝 다음 단계

1. ✅ DB 스키마 작성 완료
2. [ ] Next.js 프로젝트 초기 설정
3. [ ] 파트너 인증 구현
4. [ ] 서비스 등록 UI 구현
5. [ ] GitHub 레포지토리 생성

---

**작성일**: 2026-02-04  
**버전**: 1.0  
**작성자**: JobsClass Team
