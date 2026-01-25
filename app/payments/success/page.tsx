'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState('')
  const [orderInfo, setOrderInfo] = useState<any>(null)

  useEffect(() => {
    confirmPayment()
  }, [])

  const confirmPayment = async () => {
    try {
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = searchParams.get('amount')

      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다.')
        setIsProcessing(false)
        return
      }

      // 결제 승인 API 호출
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '결제 승인에 실패했습니다.')
        setIsProcessing(false)
        return
      }

      setOrderInfo(data.order)
      setIsProcessing(false)
    } catch (err: any) {
      console.error('Payment confirmation error:', err)
      setError('결제 처리 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto" />
          <p className="text-xl text-white font-medium">결제를 처리하는 중입니다...</p>
          <p className="text-sm text-gray-400">잠시만 기다려주세요</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-red-500/30 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">❌</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">결제 처리 실패</h1>
            <p className="text-gray-400">{error}</p>
          </div>
          <Link
            href="/dashboard"
            className="block w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
          >
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl w-full bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-green-500/30 p-8 space-y-6">
        {/* 성공 아이콘 */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">결제가 완료되었습니다! 🎉</h1>
          <p className="text-gray-400">서비스를 이용하실 수 있습니다</p>
        </div>

        {/* 주문 정보 */}
        {orderInfo && (
          <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">주문 번호</span>
              <span className="text-sm font-mono text-white">{orderInfo.order_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">결제 금액</span>
              <span className="text-lg font-bold text-white">₩{orderInfo.total_amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">결제 일시</span>
              <span className="text-sm text-white">
                {new Date(orderInfo.paid_at || orderInfo.created_at).toLocaleString('ko-KR')}
              </span>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <Link
            href="/dashboard/orders"
            className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium text-center transition-colors"
          >
            주문 내역 보기
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium text-center transition-colors"
          >
            대시보드로
          </Link>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-sm text-blue-400 leading-relaxed">
            💡 구매하신 서비스는 대시보드에서 확인하실 수 있습니다.<br />
            문의사항이 있으시면 고객센터로 연락주세요.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
