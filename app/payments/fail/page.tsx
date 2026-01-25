'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { XCircle, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

function PaymentFailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const code = searchParams.get('code') || 'UNKNOWN'
  const message = searchParams.get('message') || '알 수 없는 오류가 발생했습니다.'

  const getErrorMessage = (code: string) => {
    const errors: Record<string, string> = {
      'PAY_PROCESS_CANCELED': '사용자가 결제를 취소했습니다.',
      'PAY_PROCESS_ABORTED': '결제 프로세스가 중단되었습니다.',
      'REJECT_CARD_COMPANY': '카드사에서 승인을 거부했습니다.',
      'INSUFFICIENT_BALANCE': '잔액이 부족합니다.',
      'INVALID_CARD_NUMBER': '카드 번호가 올바르지 않습니다.',
      'UNKNOWN': '알 수 없는 오류가 발생했습니다.',
    }
    return errors[code] || message
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-red-500/30 p-8 space-y-6">
        {/* 실패 아이콘 */}
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">결제에 실패했습니다</h1>
          <p className="text-gray-400">다시 시도해주세요</p>
        </div>

        {/* 오류 정보 */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 space-y-3">
          <div>
            <p className="text-xs text-red-400 mb-1">오류 코드</p>
            <p className="text-sm font-mono text-white">{code}</p>
          </div>
          <div>
            <p className="text-xs text-red-400 mb-1">오류 메시지</p>
            <p className="text-sm text-white">{getErrorMessage(code)}</p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            다시 시도하기
          </button>
          <Link
            href="/dashboard"
            className="block w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium text-center transition-colors"
          >
            대시보드로 돌아가기
          </Link>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            💡 문제가 계속되면 다음을 확인해주세요:<br />
            · 카드 한도 및 잔액 확인<br />
            · 카드 정보 정확성 확인<br />
            · 다른 결제 수단 시도<br />
            · 고객센터 문의 (support@jobsbuild.com)
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  )
}
