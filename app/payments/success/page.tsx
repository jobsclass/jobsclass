'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [confirming, setConfirming] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = searchParams.get('amount')
      const productId = searchParams.get('productId')

      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다')
        setConfirming(false)
        return
      }

      try {
        const response = await fetch(
          `/api/payments/confirm?productId=${productId || ''}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentKey, orderId, amount }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '결제 승인에 실패했습니다')
        }

        // 성공!
        setConfirming(false)
      } catch (err: any) {
        console.error('결제 승인 오류:', err)
        setError(err.message)
        setConfirming(false)
      }
    }

    confirmPayment()
  }, [searchParams])

  if (confirming) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">결제 처리 중...</h2>
          <p className="text-gray-400">잠시만 기다려주세요</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">결제 실패</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-xl text-white font-medium transition-colors"
            >
              뒤로 가기
            </button>
            <Link
              href="/marketplace"
              className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-medium transition-colors text-center"
            >
              마켓플레이스
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full card p-8 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">결제 완료!</h1>
        <p className="text-gray-400 mb-8">
          구매해주셔서 감사합니다.<br />
          주문 내역은 대시보드에서 확인하실 수 있습니다.
        </p>
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="flex-1 px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-xl text-white font-medium transition-colors text-center"
          >
            대시보드
          </Link>
          <Link
            href="/marketplace"
            className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-medium transition-colors text-center"
          >
            계속 쇼핑하기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
