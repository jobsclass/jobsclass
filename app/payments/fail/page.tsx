'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function PaymentFailPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || '결제가 취소되었습니다'
  const code = searchParams.get('code')

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full card p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">결제 실패</h1>
        <p className="text-gray-400 mb-2">{message}</p>
        {code && (
          <p className="text-sm text-gray-500 mb-8">오류 코드: {code}</p>
        )}
        <div className="flex gap-3">
          <Link
            href="/marketplace"
            className="flex-1 px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-xl text-white font-medium transition-colors text-center"
          >
            마켓플레이스
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-medium transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  )
}
