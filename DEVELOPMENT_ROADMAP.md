# Corefy 개발 로드맵 (2026.01.24 ~ 2026.03.07)

> **목표**: Phase 1 완성 및 베타 테스트 시작 (6주)

---

## 📊 현재 상태 (2026.01.24)

### ✅ 완료된 기능 (40%)
- 파트너 회원가입/로그인 (Supabase Auth)
- 파트너 대시보드 (통계 카드, 최근 주문, 빠른 액션)
- 서비스 등록 폼 (7가지 타입)
- 공개 서비스 페이지 `/p/[partner]/[service]`
- 10개 DB 테이블 스키마 완성

### ❌ 미완성 기능 (60%)
- 구매자 인증 시스템
- 장바구니 기능
- 결제 시스템 (Toss Payments)
- LMS 기능 (비메오 연동)
- 쿠폰 시스템
- 환불 시스템
- 파트너 주문 관리

---

## 🗓️ 6주 개발 일정

### Week 1: 구매자 인증 & 장바구니 (2026.01.27 ~ 2026.01.31)

#### Day 1-2: 구매자 인증 시스템
**담당 파일**:
- `app/p/[partner]/auth/signup/page.tsx` - 구매자 회원가입
- `app/p/[partner]/auth/login/page.tsx` - 구매자 로그인
- `app/api/auth/buyer/signup/route.ts` - 회원가입 API
- `app/api/auth/buyer/login/route.ts` - 로그인 API (JWT 발급)
- `lib/auth-buyer.ts` - JWT 생성/검증 유틸

**기능**:
- 파트너별 독립적인 구매자 계정 (`buyers` 테이블)
- bcrypt 비밀번호 해싱
- JWT 토큰 기반 인증 (jose 라이브러리)
- 쿠키 기반 세션 관리

**검증**:
- `/p/test-partner/auth/signup`에서 회원가입 후 로그인 성공
- JWT 토큰 쿠키 저장 확인

---

#### Day 3-4: 장바구니 기능
**담당 파일**:
- `app/p/[partner]/cart/page.tsx` - 장바구니 페이지
- `app/api/cart/add/route.ts` - 장바구니 추가 API
- `app/api/cart/remove/route.ts` - 장바구니 제거 API
- `app/api/cart/list/route.ts` - 장바구니 목록 API
- `components/cart/CartItem.tsx` - 장바구니 아이템 컴포넌트

**기능**:
- 서비스 추가/제거
- 총 금액 계산 (할인 적용 전)
- 로그인 유저만 장바구니 접근
- 헤더에 장바구니 아이콘 + 개수 표시

**검증**:
- 서비스 페이지에서 "장바구니 담기" 클릭 후 `/p/[partner]/cart`에서 확인
- 총 금액 계산 정확성

---

#### Day 5: 주말 버퍼 + 테스트

---

### Week 2: 결제 시스템 (2026.02.03 ~ 2026.02.07)

#### Day 1-2: Toss Payments 연동
**담당 파일**:
- `app/p/[partner]/checkout/page.tsx` - 결제 페이지
- `app/api/payments/request/route.ts` - 결제 요청 API
- `app/api/payments/success/route.ts` - 결제 성공 콜백
- `app/api/payments/fail/route.ts` - 결제 실패 콜백
- `lib/toss.ts` - Toss Payments 유틸

**기능**:
- 장바구니 → 결제 페이지 이동
- Toss Payments SDK 연동
- 주문 생성 (`orders` 테이블)
- 결제 성공 시 주문 상태 업데이트
- 결제 실패 시 에러 핸들링

**검증**:
- 테스트 카드로 결제 성공
- 주문 테이블에 데이터 저장 확인

---

#### Day 3-4: 주문 후처리
**담당 파일**:
- `app/p/[partner]/my/orders/page.tsx` - 구매자 주문 내역
- `app/dashboard/orders/page.tsx` - 파트너 주문 관리
- `app/api/orders/list-buyer/route.ts` - 구매자 주문 목록 API
- `app/api/orders/list-partner/route.ts` - 파트너 주문 목록 API

**기능**:
- 구매자: 내 주문 내역 조회
- 파트너: 주문 관리 (필터링: 전체/완료/취소/환불)
- 주문 상세 정보 모달

**검증**:
- 결제 후 구매자/파트너 양쪽에서 주문 확인

---

#### Day 5: 온라인 강의 자동 등록
**담당 파일**:
- `app/api/payments/success/route.ts` 수정
- `enrollments` 테이블 자동 생성 로직

**기능**:
- 온라인 강의 구매 시 자동으로 `enrollments` 생성
- 수강 목록에 자동 표시

**검증**:
- 온라인 강의 구매 → 수강 목록에 즉시 표시

---

### Week 3: LMS 기능 (2026.02.10 ~ 2026.02.14)

#### Day 1-2: 파트너 - 비메오 영상 등록
**담당 파일**:
- `app/dashboard/services/[id]/videos/page.tsx` - 영상 관리 페이지
- `app/api/videos/add/route.ts` - 영상 추가 API
- `app/api/videos/delete/route.ts` - 영상 삭제 API
- `app/api/videos/reorder/route.ts` - 순서 변경 API
- `components/dashboard/VideoUploadForm.tsx` - 영상 등록 폼

**기능**:
- 비메오 URL 입력 (예: `https://vimeo.com/123456789`)
- 챕터 제목 + URL + 순서
- 드래그앤드롭 순서 변경
- 영상 삭제

**검증**:
- 비메오 URL 등록 후 `course_videos` 테이블 저장 확인

---

#### Day 3-4: 구매자 - 영상 플레이어
**담당 파일**:
- `app/learn/[service]/page.tsx` - LMS 수강 페이지
- `app/api/enrollments/progress/route.ts` - 진도율 업데이트 API
- `components/learn/VideoPlayer.tsx` - 비메오 플레이어 컴포넌트
- `components/learn/ChapterList.tsx` - 챕터 목록 사이드바

**기능**:
- 왼쪽: 챕터 목록 (진행 상태 표시)
- 오른쪽: 비메오 영상 플레이어 (iframe 임베드)
- 영상 시청 시 `started_watching = true` (환불 불가)
- 챕터별 완료 상태 저장 (`enrollments.progress` JSONB)

**검증**:
- 영상 시청 후 `started_watching` 플래그 확인
- 챕터 완료 시 체크 표시

---

#### Day 5: 수강 목록 페이지
**담당 파일**:
- `app/p/[partner]/my/courses/page.tsx` - 수강 목록 페이지
- `app/api/enrollments/list/route.ts` - 수강 목록 API

**기능**:
- 구매한 온라인 강의 목록
- 진도율 표시 (0% ~ 100%)
- "수강하기" 버튼 → `/learn/[service]` 이동

**검증**:
- 강의 구매 후 수강 목록에 표시

---

### Week 4: 쿠폰 & 환불 시스템 (2026.02.17 ~ 2026.02.21)

#### Day 1-2: 쿠폰 생성 & 관리
**담당 파일**:
- `app/dashboard/coupons/page.tsx` - 쿠폰 관리 페이지
- `app/dashboard/coupons/new/page.tsx` - 쿠폰 생성 폼
- `app/api/coupons/create/route.ts` - 쿠폰 생성 API
- `app/api/coupons/list/route.ts` - 쿠폰 목록 API
- `app/api/coupons/toggle/route.ts` - 쿠폰 활성/비활성 API

**기능**:
- 쿠폰 코드 (예: `WELCOME2024`)
- 할인 타입: 정률(%) / 정액(원)
- 최소 구매 금액
- 최대 사용 횟수
- 유효 기간 (시작일 ~ 종료일)
- 활성/비활성 토글

**검증**:
- 쿠폰 생성 후 `coupons` 테이블 저장 확인

---

#### Day 3: 쿠폰 적용 (결제 시)
**담당 파일**:
- `app/p/[partner]/checkout/page.tsx` 수정
- `app/api/coupons/validate/route.ts` - 쿠폰 검증 API
- `app/api/payments/request/route.ts` 수정 (할인 적용)

**기능**:
- 결제 페이지에서 쿠폰 코드 입력
- 실시간 검증 (유효 기간, 사용 횟수, 최소 금액)
- 할인 금액 계산 및 표시
- 결제 완료 시 `coupon_usage` 기록

**검증**:
- 쿠폰 적용 후 할인된 금액으로 결제

---

#### Day 4-5: 환불 시스템
**담당 파일**:
- `app/p/[partner]/my/orders/page.tsx` 수정 (환불 요청 버튼)
- `app/api/refund/request/route.ts` - 환불 요청 API
- `app/dashboard/refunds/page.tsx` - 파트너 환불 관리
- `app/api/refund/approve/route.ts` - 환불 승인 API
- `app/api/refund/reject/route.ts` - 환불 거절 API

**기능**:
- 구매자: 주문 내역에서 "환불 요청" 버튼
- 환불 요청 폼 (사유 입력)
- **조건**: `started_watching = false`일 때만 가능
- 파트너: 환불 요청 목록 (승인/거절)
- 승인 시 Toss Payments 환불 API 호출

**검증**:
- 강의 시청 전: 환불 가능
- 강의 시청 후: 환불 불가 메시지

---

### Week 5: UI/UX 개선 & 버그 수정 (2026.02.24 ~ 2026.02.28)

#### Day 1-2: 대시보드 통계 고도화
**담당 파일**:
- `app/dashboard/page.tsx` 수정
- `app/api/dashboard/stats/route.ts` - 통계 API

**기능**:
- 실시간 통계 (오늘/이번 주/이번 달)
- 매출 그래프 (최근 7일)
- 인기 서비스 Top 5
- 최근 주문 10개

**검증**:
- 더미 데이터로 그래프 렌더링 확인

---

#### Day 3-4: 반응형 디자인 개선
**담당 파일**:
- 모든 페이지 Tailwind CSS 반응형 클래스 추가

**기능**:
- 모바일 (< 640px) 최적화
- 태블릿 (640px ~ 1024px) 최적화
- 데스크탑 (> 1024px) 최적화

**검증**:
- Chrome DevTools로 모든 브레이크포인트 테스트

---

#### Day 5: 에러 처리 & 로딩 상태
**담당 파일**:
- 모든 페이지에 `loading.tsx` 추가
- 모든 API에 에러 핸들링 추가

**기능**:
- 로딩 스피너 (Skeleton UI)
- 에러 메시지 (react-hot-toast)
- 404 페이지 커스터마이징

---

### Week 6: 테스트 & 배포 준비 (2026.03.03 ~ 2026.03.07)

#### Day 1-2: E2E 테스트 시나리오
**테스트 케이스**:
1. 파트너 회원가입 → 서비스 등록 → 비메오 영상 등록 → 쿠폰 생성
2. 구매자 회원가입 → 서비스 구매 → 영상 시청 → 환불 불가 확인
3. 구매자 회원가입 → 서비스 구매 → 영상 시청 안 함 → 환불 요청 → 승인

**검증**:
- 모든 시나리오 정상 작동

---

#### Day 3: 성능 최적화
- Next.js Image 컴포넌트 적용
- Lazy Loading
- DB 쿼리 최적화 (인덱스 확인)

---

#### Day 4: 문서화
**담당 파일**:
- `README.md` 업데이트 (완성된 기능 반영)
- `DEPLOYMENT.md` 작성 (Vercel 배포 가이드)
- `API_DOCS.md` 작성 (API 엔드포인트 문서)

---

#### Day 5: Vercel 배포 & 베타 테스트
- Vercel 프로젝트 환경변수 설정
- 프로덕션 배포
- 베타 테스터 모집 (5~10명)
- 피드백 수집

---

## 📈 마일스톤

| Week | 완성도 | 주요 기능 |
|------|--------|----------|
| Week 0 (현재) | 40% | 파트너 기본 기능 |
| Week 1 | 50% | 구매자 인증 + 장바구니 |
| Week 2 | 65% | 결제 시스템 |
| Week 3 | 80% | LMS 기능 |
| Week 4 | 90% | 쿠폰 + 환불 |
| Week 5 | 95% | UI/UX 개선 |
| Week 6 | 100% | 배포 준비 완료 ✅ |

---

## 🚀 Phase 2 계획 (파트너 50명 이상 시)

### Phase 2-1: 마켓플레이스 기능
- 통합 서비스 검색 페이지
- 카테고리별 필터링
- 인기 순/최신 순 정렬
- 추천 알고리즘
- 리뷰 시스템

### Phase 2-2: AI 기능 (Gemini API)
- AI 웹사이트 자동 생성 (텍스트 입력 → 웹페이지)
- AI 가격 추천 (경쟁 서비스 분석)
- AI 마케팅 문구 생성

### Phase 2-3: 고급 분석
- Google Analytics 연동
- 방문자 추적 (UTM 파라미터)
- 전환율 분석 대시보드

---

## 💡 개발 원칙

1. **API First**: 프론트엔드 전에 API 먼저 개발
2. **Atomic Commits**: 기능 단위로 잦은 커밋
3. **테스트 주도**: 기능 개발 후 즉시 테스트
4. **문서화**: 코드 작성과 동시에 주석 추가
5. **반응형**: 모바일 우선 디자인

---

## 📞 문의 & 이슈

- GitHub Issues: https://github.com/jobsclass/corefy/issues
- 개발 진행 상황: 매주 금요일 업데이트

---

**Corefy - 6주 만에 완성하는 지식 판매 플랫폼** 🚀
