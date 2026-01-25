# 주문/결제 시스템 설계 💳

## 개요
Toss Payments를 활용한 서비스 판매 및 구독 결제 시스템

---

## 1. 결제 흐름 (Payment Flow)

### A. 일반 서비스 결제 (단건 결제)
```
고객 → 서비스 상세 페이지 → "구매하기" 클릭
  → 주문 생성 (orders 테이블)
  → Toss Payments 위젯 호출
  → 결제 완료 (payments 테이블)
  → 주문 상태 업데이트 (paid)
  → 구매 확인 페이지
```

### B. 구독 결제 (정기 결제)
```
고객 → 플랜 선택 (FREE/STARTER/PRO)
  → 구독 생성 (subscriptions 테이블)
  → Toss Payments 빌링키 발급
  → 매월 자동 결제
  → 구독 상태 관리 (active/cancelled/expired)
```

---

## 2. Toss Payments 통합

### API 키 설정 (환경 변수)
```env
# .env.local
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
```

### 결제 위젯 통합
```javascript
// components/TossPaymentWidget.tsx
import { loadTossPayments } from '@tosspayments/payment-sdk'

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
const tossPayments = await loadTossPayments(clientKey)

// 결제 요청
await tossPayments.requestPayment('카드', {
  amount: 9900,
  orderId: 'order_123',
  orderName: 'SNS 마케팅 완전정복 강의',
  customerName: '홍길동',
  successUrl: 'https://jobsbuild.com/payments/success',
  failUrl: 'https://jobsbuild.com/payments/fail',
})
```

---

## 3. 데이터베이스 스키마

### orders 테이블 (이미 생성됨 ✅)
```sql
- id: UUID
- customer_id: UUID (customers 테이블 FK)
- service_id: UUID (services 테이블 FK)
- order_number: TEXT (UNIQUE, 예: ORD-20260125-001)
- status: ENUM ('pending', 'paid', 'cancelled', 'refunded')
- total_amount: DECIMAL
- created_at: TIMESTAMP
```

### payments 테이블 (이미 생성됨 ✅)
```sql
- id: UUID
- order_id: UUID (orders 테이블 FK)
- payment_key: TEXT (Toss Payments 결제 키)
- method: TEXT ('카드', '계좌이체', '가상계좌')
- amount: DECIMAL
- status: ENUM ('ready', 'done', 'cancelled')
- approved_at: TIMESTAMP
```

### subscriptions 테이블 (이미 생성됨 ✅)
```sql
- id: UUID
- user_id: UUID
- plan: ENUM ('FREE', 'STARTER', 'PRO')
- status: ENUM ('active', 'cancelled', 'expired')
- billing_key: TEXT (Toss Payments 빌링키)
- current_period_start: DATE
- current_period_end: DATE
- next_billing_date: DATE
```

---

## 4. API 엔드포인트

### 주문 관련
- `POST /api/orders/create` - 주문 생성
- `GET /api/orders` - 주문 목록 조회
- `GET /api/orders/[id]` - 주문 상세 조회
- `PATCH /api/orders/[id]` - 주문 상태 변경

### 결제 관련
- `POST /api/payments/confirm` - Toss Payments 결제 승인
- `POST /api/payments/cancel` - 결제 취소
- `GET /api/payments` - 결제 내역 조회

### 구독 관련
- `POST /api/subscriptions/create` - 구독 생성
- `PATCH /api/subscriptions/[id]` - 구독 변경/취소
- `POST /api/subscriptions/billing` - 정기 결제 실행

---

## 5. UI 구현 계획

### A. 서비스 상세 페이지
```tsx
// app/[username]/[service-slug]/page.tsx
- 서비스 정보 표시
- 가격 정보 (할인율 포함)
- "구매하기" 버튼
- 구매 후 접근 가능한 콘텐츠 안내
```

### B. 주문 생성 페이지
```tsx
// app/orders/new?serviceId=xxx
- 주문자 정보 입력 (이름, 이메일, 전화번호)
- 결제 금액 확인
- Toss Payments 위젯
- "결제하기" 버튼
```

### C. 결제 완료 페이지
```tsx
// app/payments/success?paymentKey=xxx&orderId=xxx&amount=xxx
- 결제 승인 API 호출
- 주문 상태 업데이트
- 구매 확인 메시지
- 다운로드 링크 또는 서비스 이용 안내
```

### D. 결제 실패 페이지
```tsx
// app/payments/fail?code=xxx&message=xxx
- 실패 사유 표시
- 다시 시도 버튼
```

### E. 주문 내역 페이지 (대시보드)
```tsx
// app/dashboard/orders
- 주문 목록 (테이블)
- 상태별 필터 (전체/대기/완료/취소)
- 상세 보기 모달
- 환불 요청 버튼
```

---

## 6. 결제 보안

### A. 서버 측 검증
- 결제 승인 전 주문 금액 검증
- Toss Payments 웹훅으로 결제 상태 동기화
- 중복 결제 방지 (order_id unique 제약)

### B. 환불 정책
- 14일 이내 환불 가능
- 부분 환불 지원
- 환불 사유 입력 필수

---

## 7. 테스트 계정 (Toss Payments Sandbox)

### 테스트 카드 번호
- 카드 번호: `4000-0000-0000-0008`
- 유효 기간: `01/26`
- CVC: `123`
- 비밀번호: `1234`

### 테스트 계좌
- 은행: 신한은행
- 계좌번호: `110-123-456789`

---

## 8. 수익 분석 대시보드 (향후 구현)

### 지표
- 일별/주별/월별 매출
- 서비스별 판매 순위
- 구독 전환율
- 환불율

---

## 9. 구현 순서

1. ✅ DB 스키마 완성 (완료)
2. 🔄 주문 생성 API (진행 중)
3. ⏳ Toss Payments 위젯 통합
4. ⏳ 결제 승인 API
5. ⏳ 주문 내역 UI
6. ⏳ 구독 결제 (정기 결제)

---

**작성일**: 2026-01-25  
**참고**: [Toss Payments 개발 문서](https://docs.tosspayments.com/)
