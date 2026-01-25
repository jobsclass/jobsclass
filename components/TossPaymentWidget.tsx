'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

type TossPaymentWidgetProps = {
  orderId: string
  orderName: string
  amount: number
  customerName: string
  customerEmail: string
  onSuccess?: () => void
  onFail?: (error: any) => void
}

export default function TossPaymentWidget({
  orderId,
  orderName,
  amount,
  customerName,
  customerEmail,
  onSuccess,
  onFail,
}: TossPaymentWidgetProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const widgetRef = useRef<any>(null)

  useEffect(() => {
    loadTossPayments()
  }, [])

  const loadTossPayments = async () => {
    try {
      // Toss Payments SDK 로드
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY

      if (!clientKey) {
        setError('결제 시스템이 설정되지 않았습니다. 관리자에게 문의하세요.')
        setIsLoading(false)
        return
      }

      // 동적 import로 SDK 로드
      const { loadTossPayments } = await import('@tosspayments/payment-sdk')
      const tossPayments = await loadTossPayments(clientKey)

      widgetRef.current = tossPayments

      setIsLoading(false)
    } catch (err: any) {
      console.error('Toss Payments load error:', err)
      setError('결제 위젯을 불러오는데 실패했습니다.')
      setIsLoading(false)
    }
  }

  const handlePayment = async (method: string) => {
    if (!widgetRef.current) {
      alert('결제 시스템이 준비되지 않았습니다.')
      return
    }

    try {
      // 성공/실패 URL 설정
      const successUrl = `${window.location.origin}/payments/success`
      const failUrl = `${window.location.origin}/payments/fail`

      // 결제 요청
      await widgetRef.current.requestPayment(method, {
        amount,
        orderId,
        orderName,
        customerName,
        customerEmail,
        successUrl,
        failUrl,
      })
    } catch (err: any) {
      console.error('Payment request error:', err)
      if (onFail) {
        onFail(err)
      }
      alert('결제 요청에 실패했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6">
        <p className="text-red-400">{error}</p>
        <p className="text-sm text-gray-400 mt-2">
          환경 변수 설정이 필요합니다: <code className="text-xs bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_TOSS_CLIENT_KEY</code>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 결제 금액 표시 */}
      <div className="bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">결제 금액</p>
            <p className="text-3xl font-bold text-white mt-1">₩{amount.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">주문 번호</p>
            <p className="text-sm font-mono text-white mt-1">{orderId}</p>
          </div>
        </div>
      </div>

      {/* 결제 수단 선택 */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">결제 수단 선택</h3>
        
        <button
          onClick={() => handlePayment('카드')}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
        >
          💳 신용카드
        </button>

        <button
          onClick={() => handlePayment('계좌이체')}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
        >
          🏦 계좌이체
        </button>

        <button
          onClick={() => handlePayment('가상계좌')}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
        >
          📄 가상계좌
        </button>

        <button
          onClick={() => handlePayment('휴대폰')}
          className="w-full py-4 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
        >
          📱 휴대폰 결제
        </button>
      </div>

      {/* 주의사항 */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          · 결제 금액은 서비스 가격과 일치해야 합니다.<br />
          · 결제 완료 후 서비스를 이용하실 수 있습니다.<br />
          · 문의사항은 고객센터로 연락주세요.
        </p>
      </div>
    </div>
  )
}
