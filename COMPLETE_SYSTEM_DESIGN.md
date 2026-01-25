# Corefy 웹빌더 - 완전한 시스템 구조

## 📋 대시보드 메뉴 구조

### 1️⃣ 최상위 메뉴

```
📊 대시보드 (/)
🌐 웹사이트 관리 (/dashboard/website)
👤 프로필 관리 (/dashboard/profile)
📦 상품 관리 (/dashboard/products)
✍️ 블로그 관리 (/dashboard/blog)
🎨 포트폴리오 관리 (/dashboard/portfolio)
👥 고객 관리 (/dashboard/customers)
💳 결제 관리 (/dashboard/orders)
📊 통계/분석 (/dashboard/analytics)
⚙️ 설정 (/dashboard/settings)
```

---

## 📊 대시보드 (홈)

**URL**: `/dashboard`

### 표시 내용
- 📈 주요 지표 (오늘 방문자, 이번 달 매출, 총 주문 수, 총 고객 수)
- 📅 최근 주문 (최대 5개)
- 📧 최근 문의 (최대 5개)
- 📊 이번 주 방문자 그래프
- 🚀 빠른 액션
  - 새 상품 등록
  - 새 블로그 글 쓰기
  - 새 포트폴리오 추가
  - 웹사이트 설정

---

## 🌐 웹사이트 관리

### 1. 웹사이트 설정
**URL**: `/dashboard/website`

#### 입력 항목
- **기본 정보**
  - 웹사이트 제목
  - URL 슬러그
  - 설명
  - 로고 업로드
  - 파비콘 업로드

- **SEO 설정**
  - 메타 제목
  - 메타 설명
  - 키워드 (쉼표로 구분)
  - OG 이미지

- **도메인 연결**
  - 커스텀 도메인 입력
  - 도메인 인증 상태

- **게시 설정**
  - 게시/비공개 토글
  - 게시 일시

### 2. 섹션 관리
**URL**: `/dashboard/website/sections`

#### 기능
- **섹션 표시/숨김**
  - ☑️ Hero
  - ☑️ 프로필
  - ☑️ 상품 목록
  - ☐ 블로그
  - ☐ 포트폴리오
  - ☑️ 연락처

- **섹션 순서 조정**
  - 드래그 앤 드롭 (또는 위/아래 버튼)

### 3. 디자인 설정
**URL**: `/dashboard/website/design`

#### 입력 항목
- **색상 설정**
  - Primary 색상
  - Secondary 색상
  - Accent 색상
  - Text 색상
  - Background 색상

- **폰트 설정**
  - 제목 폰트
  - 본문 폰트

- **레이아웃 설정**
  - 헤더 스타일 (fixed/static)
  - 푸터 스타일 (minimal/full)

---

## 👤 프로필 관리

### 1. 기본 정보
**URL**: `/dashboard/profile`

#### 입력 항목
- 표시 이름
- 직함 (예: 프리랜서 디자이너)
- 프로필 이미지 업로드
- 한 줄 소개 (tagline)
- 자기소개 (에디터)
- 전문 분야 (태그 형식, 다중 입력)
- 연락처 (이메일, 전화, 지역)

### 2. 경력 사항
**URL**: `/dashboard/profile/experiences`

#### 기능
- **목록 표시**
  - 회사명
  - 직책
  - 기간
  - 편집/삭제 버튼

- **추가/수정 폼**
  - 회사명
  - 직책
  - 설명
  - 시작일
  - 종료일 (현재 재직중 체크박스)
  - 순서

### 3. 학력 사항
**URL**: `/dashboard/profile/educations`

#### 입력 항목
- 학교명
- 학위 (학사/석사/박사)
- 전공
- 설명
- 시작일/종료일
- 순서

### 4. 자격증/수상
**URL**: `/dashboard/profile/certifications`

#### 입력 항목
- 제목
- 발급 기관
- 발급일
- 만료일 (선택)
- 자격증 번호
- 증명 URL
- 순서

### 5. SNS 링크
**URL**: `/dashboard/profile/social`

#### 입력 항목
- Instagram
- YouTube
- LinkedIn
- Twitter
- Facebook
- GitHub
- Behance
- 기타 (+ 추가 버튼)

---

## 📦 상품 관리

### 1. 상품 목록
**URL**: `/dashboard/products`

#### 표시 내용
- 상품 카드 (썸네일, 제목, 가격, 상태)
- 필터: 카테고리, 게시 상태
- 정렬: 최신순, 인기순, 가격순
- 검색
- + 새 상품 등록 버튼

### 2. 상품 등록/수정
**URL**: `/dashboard/products/new`, `/dashboard/products/[id]/edit`

#### 입력 항목 (탭 구성)

**Tab 1: 기본 정보**
- 상품명
- URL 슬러그
- 카테고리 선택
- 썸네일 이미지 업로드
- 간단한 설명

**Tab 2: 문제-해결 정의**
- 문제 카테고리 선택 (8개 중 택1)
- 솔루션 타입 선택 (8개 중 다중 선택)
- 타겟 고객 입력

**Tab 3: 상세 설명**
- 문제 설명 (에디터)
- 해결 방법 설명 (에디터)
- 주요 기능 (+ 추가 버튼)
  - 아이콘
  - 제목
  - 설명

**Tab 4: 커리큘럼/구성** (선택)
- + 섹션 추가
  - 제목
  - 설명
  - 소요 시간

**Tab 5: 미디어**
- 이미지 업로드 (다중)
- 동영상 링크 (YouTube, Vimeo)

**Tab 6: 가격 설정**
- 가격 (원 단위)
- 정가 (할인 표시용, 선택)
- 재고 수량 (무제한 체크박스)
- 1인당 최대 구매 수량

**Tab 7: 판매 설정**
- 판매 가능 여부 토글
- 판매 시작일/종료일 (선택)
- 게시/비공개 토글

### 3. 카테고리 관리
**URL**: `/dashboard/products/categories`

#### 기능
- 카테고리 목록
- + 새 카테고리 추가
  - 이름
  - URL 슬러그
  - 설명
  - 순서

---

## ✍️ 블로그 관리

### 1. 글 목록
**URL**: `/dashboard/blog`

#### 표시 내용
- 글 목록 (제목, 카테고리, 상태, 작성일)
- 필터: 카테고리, 게시 상태
- 검색
- + 새 글 쓰기 버튼

### 2. 글 쓰기/수정
**URL**: `/dashboard/blog/new`, `/dashboard/blog/[id]/edit`

#### 입력 항목
- 제목
- URL 슬러그
- 카테고리 선택
- 대표 이미지 업로드
- 요약 (excerpt)
- 본문 (에디터 - Tiptap 또는 Quill)
- 태그 (쉼표로 구분)
- SEO 설정
  - 메타 제목
  - 메타 설명
- 게시/비공개 토글
- 게시 일시

### 3. 카테고리 관리
**URL**: `/dashboard/blog/categories`

### 4. 태그 관리
**URL**: `/dashboard/blog/tags`

---

## 🎨 포트폴리오 관리

### 1. 포트폴리오 목록
**URL**: `/dashboard/portfolio`

#### 표시 내용
- 포트폴리오 카드 (썸네일, 제목, 카테고리)
- 필터: 카테고리, 게시 상태
- 정렬: 최신순, 순서
- + 새 항목 추가 버튼

### 2. 항목 추가/수정
**URL**: `/dashboard/portfolio/new`, `/dashboard/portfolio/[id]/edit`

#### 입력 항목
- 제목
- URL 슬러그
- 카테고리 선택
- 썸네일 이미지
- 설명 (에디터)
- 이미지/동영상 업로드 (다중)
- 프로젝트 정보
  - 클라이언트
  - 프로젝트 날짜
  - 프로젝트 기간 (예: 3개월)
  - 외부 링크 (선택)
- 사용 기술/도구 (태그 형식, 다중)
- 게시/비공개 토글
- 순서

### 3. 카테고리 관리
**URL**: `/dashboard/portfolio/categories`

---

## 👥 고객 관리

### 1. 고객 목록
**URL**: `/dashboard/customers`

#### 표시 내용
- 고객 목록 (이름, 이메일, 총 주문 수, 총 구매액)
- 필터: 태그
- 검색: 이름, 이메일
- 정렬: 최신순, 구매액순

#### 개별 고객 상세
- 기본 정보
- 주문 내역
- 문의 내역
- 메모 (관리자용)
- 태그 (VIP, 단골 등)

### 2. 문의 관리
**URL**: `/dashboard/customers/inquiries`

#### 표시 내용
- 문의 목록 (이름, 제목, 상태, 작성일)
- 필터: 상태 (대기/진행중/완료)
- 검색: 이름, 이메일, 제목

#### 문의 상세
- 문의 내용
- 답변 입력 (에디터)
- 상태 변경 (대기 → 진행중 → 완료)
- 답변 발송 버튼

---

## 💳 결제 관리

### 1. 주문 목록
**URL**: `/dashboard/orders`

#### 표시 내용
- 주문 목록 (주문번호, 고객명, 상품, 금액, 상태, 주문일)
- 필터: 상태 (전체/대기/결제완료/처리중/완료/취소/환불)
- 검색: 주문번호, 고객명
- 날짜 범위 선택

### 2. 주문 상세
**URL**: `/dashboard/orders/[id]`

#### 표시 내용
- 주문 정보
  - 주문번호
  - 주문 일시
  - 주문 상태
- 고객 정보
  - 이름, 이메일, 전화
- 주문 상품 목록
  - 상품명, 가격, 수량
- 금액 정보
  - 소계, 할인, 최종 금액
- 결제 정보
  - 결제 수단
  - 결제 ID
  - 결제 일시
- 상태 변경 드롭다운

### 3. 매출 통계
**URL**: `/dashboard/orders/stats`

#### 표시 내용
- 기간별 매출 그래프 (일/주/월/년)
- 주요 지표
  - 총 매출
  - 총 주문 수
  - 평균 주문 금액
  - 환불률
- 베스트 상품 순위

### 4. 환불 요청 관리
**URL**: `/dashboard/orders/refunds`

#### 표시 내용
- 환불 요청 목록
- 상태: 대기/승인/거절
- 승인/거절 버튼
- 관리자 메모

---

## 📊 통계/분석

**URL**: `/dashboard/analytics`

### 표시 내용
- 방문자 통계
  - 일별/주별/월별 방문자 그래프
  - 페이지별 조회수
  - 디바이스 비율 (모바일/태블릿/데스크톱)
- 매출 통계
  - 기간별 매출 그래프
  - 상품별 매출 순위
- 인기 콘텐츠
  - 인기 상품 Top 5
  - 인기 블로그 글 Top 5
  - 인기 포트폴리오 Top 5
- 유입 경로 분석
  - Referrer 통계
  - 검색 키워드 (연동 시)

---

## ⚙️ 설정

### 1. 계정 설정
**URL**: `/dashboard/settings/account`

#### 입력 항목
- 이메일 (읽기 전용)
- 비밀번호 변경
- 알림 설정
  - 새 주문 이메일 알림
  - 새 문의 이메일 알림
  - 주간 리포트 이메일

### 2. 구독 플랜
**URL**: `/dashboard/settings/subscription`

#### 표시 내용
- 현재 플랜 (FREE/STARTER/PRO)
- 플랜별 기능 비교
- 플랜 변경 버튼
- 결제 내역

### 3. 결제 수단 연동
**URL**: `/dashboard/settings/payment`

#### 입력 항목
- Toss Payments 연동
  - Client Key
  - Secret Key
  - 테스트/프로덕션 모드
- 계좌 정보 (무통장 입금용)

### 4. 도메인 연결
**URL**: `/dashboard/settings/domain`

#### 기능
- 커스텀 도메인 입력
- DNS 설정 가이드
- 도메인 인증 상태

---

## 🗂️ 데이터베이스 테이블 목록

총 **20개 테이블**:

1. `user_profiles` - 사용자 프로필
2. `experiences` - 경력
3. `educations` - 학력
4. `certifications` - 자격증/수상
5. `websites` - 웹사이트 설정
6. `product_categories` - 상품 카테고리
7. `products` - 상품
8. `blog_categories` - 블로그 카테고리
9. `blog_posts` - 블로그 글
10. `portfolio_categories` - 포트폴리오 카테고리
11. `portfolios` - 포트폴리오
12. `customers` - 고객
13. `inquiries` - 문의
14. `orders` - 주문
15. `refund_requests` - 환불 요청
16. `coupons` - 쿠폰
17. `coupon_usages` - 쿠폰 사용 내역
18. `website_analytics` - 방문 통계
19. `subscriptions` - 구독
20. `payments` - 결제 내역

---

## 🎨 웹사이트 렌더링 구조

### 섹션 조합 시스템

```typescript
// websites 테이블의 sections_enabled 예시
{
  "hero": true,
  "profile": true,
  "products": true,
  "blog": true,
  "portfolio": false,
  "contact": true
}

// sections_order 예시
["hero", "profile", "products", "blog", "contact"]
```

### 각 섹션별 데이터 소스

- **Hero**: `websites.title`, `websites.description`
- **Profile**: `user_profiles`, `experiences`, `educations`, `certifications`
- **Products**: `products` (WHERE is_published = true)
- **Blog**: `blog_posts` (WHERE is_published = true, LIMIT 3-6)
- **Portfolio**: `portfolios` (WHERE is_published = true)
- **Contact**: `user_profiles.email`, `user_profiles.phone`, `user_profiles.social_links`

---

## 🚀 구현 우선순위

### Phase 1: 핵심 기능 (1주)
1. ✅ DB 스키마 생성
2. 대시보드 메뉴 구조
3. 웹사이트 설정
4. 프로필 관리 (기본 정보)
5. 상품 관리 (CRUD)
6. 웹사이트 렌더링 (섹션 조합)

### Phase 2: 콘텐츠 기능 (1주)
1. 블로그 관리
2. 포트폴리오 관리
3. 프로필 확장 (경력/학력/자격증)

### Phase 3: 고객/결제 (1주)
1. 고객 관리
2. 문의 관리
3. 주문 관리
4. 쿠폰 관리
5. Toss Payments 연동

### Phase 4: 통계/고급 기능 (1주)
1. 통계/분석 대시보드
2. 이메일 알림
3. 도메인 연결
4. SEO 최적화
5. 성능 최적화

---

## 📝 핵심 원칙

1. **드래그 앤 드롭 없음**: 모든 항목은 폼 입력으로 관리
2. **섹션 독립성**: 각 섹션은 별도 메뉴에서 관리
3. **CRUD 완성도**: 모든 항목은 생성/읽기/수정/삭제 가능
4. **계층적 메뉴**: 명확한 메뉴 구조로 직관적 네비게이션
5. **에디터 활용**: 블로그/상품 설명 등은 리치 에디터 제공
6. **확장 가능성**: 새로운 섹션 추가 용이한 구조
