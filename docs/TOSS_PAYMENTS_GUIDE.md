# Toss Payments 연동 가이드

## 📋 설정 단계

### 1. Toss Payments 계정 설정
1. https://developers.tosspayments.com/ 가입
2. 개발자 센터 → 내 앱 → 새 앱 만들기
3. **클라이언트 키**와 **시크릿 키** 발급

### 2. 환경 변수 설정
`.env.local` 파일에 추가:
```bash
# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_XXXXXXXXXX
TOSS_SECRET_KEY=test_sk_XXXXXXXXXX

# 결제 승인 콜백 URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. 패키지 설치
```bash
npm install @tosspayments/payment-sdk
```

---

## 💰 결제 플로우

### **정액제 서비스 구매**
```
[서비스 상세] 
  → 구매 버튼 클릭
  → Toss Payments 위젯 열기
  → 결제 진행
  → 승인 콜백 (서버)
  → orders 테이블 저장
  → 성공 페이지
```

### **크레딧 충전**
```
[크레딧 충전 페이지]
  → 충전 금액 선택 (10,000원, 50,000원, 100,000원)
  → Toss Payments 위젯
  → 결제 완료
  → user_profiles.credits 증가
  → 완료 알림
```

---

## 🗄️ 데이터베이스 스키마

### `orders` 테이블
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,      -- ORD-2024-0001
  
  -- 구매자
  buyer_id UUID REFERENCES user_profiles(id),
  
  -- 상품 (정액제 서비스만)
  product_id UUID REFERENCES products(id),
  
  -- 결제 정보
  amount INTEGER NOT NULL,                 -- 총 금액
  payment_method TEXT,                     -- card/transfer/virtual_account
  payment_key TEXT,                        -- Toss에서 제공
  
  -- 상태
  status TEXT DEFAULT 'pending',           -- pending/paid/cancelled/refunded
  
  -- Toss 응답 저장
  toss_response JSONB,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);
```

### `credit_transactions` 테이블
```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  
  type TEXT NOT NULL,                      -- purchase/usage/refund
  amount INTEGER NOT NULL,                 -- 변동 크레딧 수
  balance_after INTEGER NOT NULL,          -- 거래 후 잔액
  
  -- 연결된 항목
  order_id UUID REFERENCES orders(id),     -- 크레딧 구매 시
  proposal_id UUID REFERENCES proposals(id), -- 제안 사용 시
  
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 UI 컴포넌트

### 파일 구조
```
app/
  payments/
    success/page.tsx          # 결제 성공 페이지
    fail/page.tsx             # 결제 실패 페이지
  credits/
    charge/page.tsx           # 크레딧 충전 페이지
  api/
    payments/
      confirm/route.ts        # 결제 승인 API
      webhook/route.ts        # Toss 웹훅
lib/
  toss/
    client.ts                 # Toss SDK 초기화
    server.ts                 # 서버 사이드 결제 승인
```

---

## 🔧 구현 예시

### 1. 서비스 구매 버튼
```typescript
// app/marketplace/products/[id]/page.tsx
import { loadTossPayments } from '@tosspayments/payment-sdk'

const handlePurchase = async () => {
  const tossPayments = await loadTossPayments(
    process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
  )
  
  // 주문 번호 생성
  const orderNumber = `ORD-${Date.now()}`
  
  await tossPayments.requestPayment('카드', {
    amount: product.price,
    orderId: orderNumber,
    orderName: product.title,
    customerName: user.display_name,
    successUrl: `${window.location.origin}/payments/success`,
    failUrl: `${window.location.origin}/payments/fail`,
  })
}
```

### 2. 결제 승인 API
```typescript
// app/api/payments/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { paymentKey, orderId, amount } = await request.json()
  
  // Toss Payments 서버에 승인 요청
  const response = await fetch(
    'https://api.tosspayments.com/v1/payments/confirm',
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(
          process.env.TOSS_SECRET_KEY! + ':'
        ).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    }
  )
  
  const payment = await response.json()
  
  if (!response.ok) {
    return NextResponse.json(payment, { status: response.status })
  }
  
  // 데이터베이스에 저장
  const supabase = createClient()
  
  await supabase.from('orders').insert({
    order_number: orderId,
    buyer_id: payment.customerId,
    amount: payment.totalAmount,
    payment_method: payment.method,
    payment_key: paymentKey,
    status: 'paid',
    paid_at: payment.approvedAt,
    toss_response: payment,
  })
  
  return NextResponse.json({ success: true, payment })
}
```

### 3. 크레딧 충전 페이지
```typescript
// app/credits/charge/page.tsx
const CREDIT_PACKAGES = [
  { credits: 100, price: 10000, bonus: 0 },
  { credits: 550, price: 50000, bonus: 50 },
  { credits: 1200, price: 100000, bonus: 200 },
]

const handleCharge = async (pkg: typeof CREDIT_PACKAGES[0]) => {
  const tossPayments = await loadTossPayments(
    process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
  )
  
  const orderNumber = `CREDIT-${Date.now()}`
  
  await tossPayments.requestPayment('카드', {
    amount: pkg.price,
    orderId: orderNumber,
    orderName: `크레딧 ${pkg.credits}개 충전`,
    customerName: user.display_name,
    successUrl: `${window.location.origin}/credits/charge/success`,
    failUrl: `${window.location.origin}/credits/charge/fail`,
  })
}
```

---

## ⚠️ 주의사항

### 보안
1. **시크릿 키는 절대 클라이언트에 노출 금지**
2. 서버 사이드에서만 결제 승인 처리
3. amount 검증 필수 (클라이언트 조작 방지)

### 테스트
1. 개발 환경: `test_ck_`, `test_sk_` 키 사용
2. 테스트 카드: 
   - 카드번호: 4330-1234-1234-1234
   - 유효기간: 아무거나
   - CVC: 123

### 프로덕션 배포
1. 실 운영 키로 교체
2. HTTPS 필수
3. 웹훅 URL 등록 (Toss 개발자 센터)

---

## 📝 TODO

- [ ] Toss Payments 계정 생성
- [ ] 환경 변수 설정
- [ ] orders 테이블 마이그레이션 실행
- [ ] credit_transactions 테이블 마이그레이션 실행
- [ ] 서비스 구매 UI 구현
- [ ] 크레딧 충전 UI 구현
- [ ] 결제 승인 API 구현
- [ ] 웹훅 핸들러 구현
- [ ] 테스트 결제 실행
