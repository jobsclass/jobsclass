'use client'

import { useState } from 'react'
import { loadTossPayments } from '@tosspayments/payment-sdk'
import { Loader2, ShoppingCart } from 'lucide-react'

interface PurchaseButtonProps {
  product: {
    id: string
    title: string
    price: number
    pricing_model: 'fixed' | 'negotiable'
  }
  user: {
    id: string
    email: string
    display_name?: string
  } | null
}

export default function PurchaseButton({ product, user }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    if (!user) {
      alert('로그인이 필요합니다')
      window.location.href = '/auth/user/login'
      return
    }

    if (product.pricing_model === 'negotiable') {
      // 협의제는 견적 요청 페이지로
      window.location.href = `/quotations/request?productId=${product.id}`
      return
    }

    setLoading(true)
    try {
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
      )

      const orderNumber = `ORD-${Date.now()}`

      await tossPayments.requestPayment('카드', {
        amount: product.price,
        orderId: orderNumber,
        orderName: product.title,
        customerName: user.display_name || user.email,
        customerEmail: user.email,
        successUrl: `${window.location.origin}/payments/success?productId=${product.id}`,
        failUrl: `${window.location.origin}/payments/fail`,
      })
    } catch (error: any) {
      console.error('결제 시작 오류:', error)
      alert(error.message || '결제를 시작할 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  if (product.pricing_model === 'negotiable') {
    return (
      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            처리 중...
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            견적 요청하기
          </>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          결제 진행 중...
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          ₩{product.price.toLocaleString()} 구매하기
        </>
      )}
    </button>
  )
}
