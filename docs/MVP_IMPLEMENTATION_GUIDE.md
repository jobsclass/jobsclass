# JobsClass 1차 MVP 구현 가이드

## 🎯 목표
**2주 안에 첫 거래 발생시키기**

- 파트너 10명 확보
- 서비스 20개 등록
- 실제 결제 1건 완료

---

## ✅ 완료된 것 (70%)

### 데이터베이스
- ✅ 모든 테이블 스키마
- ✅ 인덱스 최적화
- ✅ 뷰 (products_with_partner, active_projects 등)
- ✅ 결제 시스템 스키마 (orders, credit_transactions)

### UI
- ✅ 홈페이지
- ✅ 회원가입/로그인
- ✅ 서비스 등록 (10가지 타입)
- ✅ 마켓플레이스
- ✅ 니즈 등록
- ✅ 견적 요청 폼

---

## 🚀 남은 작업 (30%)

### 1. Toss Payments 연동 (P0 - 필수)

#### 파일: `app/api/payments/confirm/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { paymentKey, orderId, amount } = await request.json()
  
  // Toss 서버에 승인 요청
  const tossResponse = await fetch(
    'https://api.tosspayments.com/v1/payments/confirm',
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(
          process.env.TOSS_SECRET_KEY + ':'
        ).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentKey, orderId, amount })
    }
  )
  
  const payment = await tossResponse.json()
  
  if (!tossResponse.ok) {
    return NextResponse.json(payment, { status: tossResponse.status })
  }
  
  // Supabase에 저장
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  
  const { error } = await supabase.from('orders').insert({
    order_number: orderId,
    buyer_id: payment.customerId || null, // Toss에서 제공 안 하면 null
    amount: payment.totalAmount,
    payment_method: payment.method,
    payment_key: paymentKey,
    status: 'paid',
    paid_at: payment.approvedAt,
    toss_response: payment
  })
  
  if (error) {
    console.error('DB 저장 오류:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true, payment })
}
```

#### 파일: `app/marketplace/products/[id]/PurchaseButton.tsx`
```typescript
'use client'

import { loadTossPayments } from '@tosspayments/payment-sdk'

export default function PurchaseButton({ product, user }: Props) {
  const handlePurchase = async () => {
    if (!user) {
      alert('로그인이 필요합니다')
      return
    }
    
    const tossPayments = await loadTossPayments(
      process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
    )
    
    const orderNumber = `ORD-${Date.now()}`
    
    await tossPayments.requestPayment('카드', {
      amount: product.price,
      orderId: orderNumber,
      orderName: product.title,
      customerName: user.display_name || user.email,
      successUrl: `${window.location.origin}/payments/success?productId=${product.id}`,
      failUrl: `${window.location.origin}/payments/fail`
    })
  }
  
  return (
    <button onClick={handlePurchase} className="btn-primary">
      ₩{product.price.toLocaleString()} 구매하기
    </button>
  )
}
```

#### 파일: `app/payments/success/page.tsx`
```typescript
'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = searchParams.get('amount')
      
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey, orderId, amount })
      })
      
      if (!response.ok) {
        alert('결제 승인 실패')
        router.push('/payments/fail')
        return
      }
      
      // 성공 처리
    }
    
    confirmPayment()
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">결제 완료!</h1>
        <p className="text-gray-400">구매해주셔서 감사합니다</p>
      </div>
    </div>
  )
}
```

---

### 2. 크레딧 충전 페이지 (P0 - 필수)

#### 파일: `app/credits/charge/page.tsx`
```typescript
'use client'

import { loadTossPayments } from '@tosspayments/payment-sdk'

const PACKAGES = [
  { credits: 100, price: 10000, bonus: 0 },
  { credits: 550, price: 50000, bonus: 50 },
  { credits: 1200, price: 100000, bonus: 200 }
]

export default function CreditChargePage() {
  const handleCharge = async (pkg: typeof PACKAGES[0]) => {
    const tossPayments = await loadTossPayments(
      process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
    )
    
    const orderNumber = `CREDIT-${Date.now()}`
    
    await tossPayments.requestPayment('카드', {
      amount: pkg.price,
      orderId: orderNumber,
      orderName: `크레딧 ${pkg.credits}개 충전`,
      successUrl: `${window.location.origin}/credits/charge/success`,
      failUrl: `${window.location.origin}/credits/charge/fail`
    })
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">크레딧 충전</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PACKAGES.map((pkg) => (
          <div key={pkg.credits} className="card p-8 text-center">
            <div className="text-4xl font-bold text-primary-400 mb-2">
              {pkg.credits}
            </div>
            <div className="text-gray-400 mb-4">크레딧</div>
            {pkg.bonus > 0 && (
              <div className="text-green-400 text-sm mb-4">
                +{pkg.bonus} 보너스
              </div>
            )}
            <div className="text-2xl font-bold text-white mb-6">
              ₩{pkg.price.toLocaleString()}
            </div>
            <button 
              onClick={() => handleCharge(pkg)}
              className="btn-primary w-full"
            >
              충전하기
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### 3. 파트너 대시보드 (P0 - 필수)

#### 파일: `app/partner/dashboard/page.tsx`
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PartnerDashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalServices: 0,
    totalRevenue: 0,
    pendingQuotations: 0
  })
  const [services, setServices] = useState([])
  const [quotationRequests, setQuotationRequests] = useState([])
  
  useEffect(() => {
    loadDashboard()
  }, [])
  
  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    // 내 서비스 목록
    const { data: servicesData } = await supabase
      .from('products')
      .select('*')
      .eq('partner_id', user.id)
    
    // 견적 요청 목록
    const { data: quotationsData } = await supabase
      .from('quotation_requests')
      .select(`
        *,
        products!inner(id, title, partner_id),
        user_profiles!quotation_requests_client_id_fkey(display_name, email)
      `)
      .eq('products.partner_id', user.id)
      .eq('status', 'pending')
    
    setServices(servicesData || [])
    setQuotationRequests(quotationsData || [])
    setStats({
      totalServices: servicesData?.length || 0,
      totalRevenue: 0, // TODO: 실제 매출 계산
      pendingQuotations: quotationsData?.length || 0
    })
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">파트너 대시보드</h1>
      
      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="text-gray-400 mb-2">등록된 서비스</div>
          <div className="text-3xl font-bold text-white">
            {stats.totalServices}개
          </div>
        </div>
        <div className="card p-6">
          <div className="text-gray-400 mb-2">누적 매출</div>
          <div className="text-3xl font-bold text-primary-400">
            ₩{stats.totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="card p-6">
          <div className="text-gray-400 mb-2">대기 중인 견적</div>
          <div className="text-3xl font-bold text-yellow-400">
            {stats.pendingQuotations}개
          </div>
        </div>
      </div>
      
      {/* 견적 요청 목록 */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">받은 견적 요청</h2>
        {quotationRequests.length === 0 ? (
          <p className="text-gray-400">아직 견적 요청이 없습니다</p>
        ) : (
          <div className="space-y-4">
            {quotationRequests.map((req: any) => (
              <div key={req.id} className="p-4 bg-dark-800 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">{req.project_title}</h3>
                  <span className="text-xs text-gray-400">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{req.project_description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    예산: ₩{req.budget_min?.toLocaleString()} ~ ₩{req.budget_max?.toLocaleString()}
                  </span>
                  <span className="text-gray-500">
                    클라이언트: {req.user_profiles.display_name}
                  </span>
                  <button className="btn-primary text-xs ml-auto">
                    연락하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 내 서비스 목록 */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-white mb-4">내 서비스</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service: any) => (
            <div key={service.id} className="p-4 bg-dark-800 rounded-lg">
              <h3 className="font-semibold text-white mb-2">{service.title}</h3>
              <div className="text-primary-400 font-bold">
                ₩{service.price?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                상태: {service.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

### 4. 리뷰 시스템 (P1 - 선택)

#### 마이그레이션: `supabase/migrations/reviews_system.sql`
```sql
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT 
  WITH CHECK (reviewer_id = auth.uid());
```

---

## 📋 배포 체크리스트

### 1. 환경 변수 설정
- [ ] `.env.local` 파일 생성
- [ ] Toss Payments 키 발급 (테스트용)
- [ ] Supabase URL/키 확인

### 2. 데이터베이스 마이그레이션
```bash
# Supabase SQL 에디터에서 순서대로 실행:
1. service_types_expansion.sql
2. pricing_models_and_quotations.sql
3. database_cleanup_and_optimization.sql
4. payments_system.sql
5. reviews_system.sql (선택)
```

### 3. 패키지 설치
```bash
npm install @tosspayments/payment-sdk
```

### 4. 테스트
- [ ] 로컬에서 서비스 등록 테스트
- [ ] Toss 테스트 결제 (테스트 카드: 4330-1234-1234-1234)
- [ ] 크레딧 충전 테스트
- [ ] 견적 요청 테스트

### 5. 프로덕션 배포
- [ ] Vercel/Netlify 배포
- [ ] 실 운영 Toss 키로 교체
- [ ] HTTPS 확인
- [ ] 도메인 연결

---

## 🚀 런칭 후 전략

### Week 1-2: 베타 테스트
- 친한 파트너 10명 초대
- 서비스 20개 확보
- 피드백 수집

### Week 3-4: 개선
- 버그 수정
- UX 개선
- 첫 거래 발생시키기

### Month 2: 확장
- 거래 10건 달성 후
- 전자계약 시스템 도입 고려
- AI 매칭 준비 (데이터 축적)

---

## ⚠️ 중요: 간소화 전략

### ❌ 지금 하지 말 것
1. 전자계약 시스템 (너무 복잡)
2. 마일스톤 대시보드 (수동 처리)
3. 실시간 메시지 (이메일/카카오톡)
4. AI 매칭 (수동 추천)
5. 파일 업로드 (나중에)

### ✅ 지금 집중할 것
1. Toss Payments 완벽하게
2. 견적 요청 → 이메일 알림
3. 수동 운영으로 빠른 검증
4. 피드백 수집

---

**목표: 2주 안에 첫 거래 발생! 🚀**
