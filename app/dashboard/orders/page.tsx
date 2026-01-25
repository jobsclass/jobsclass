import { Metadata } from 'next'
import { CreditCard, TrendingUp, Package, DollarSign } from 'lucide-react'

export const metadata: Metadata = {
  title: '결제 관리 | Corefy',
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">결제 관리</h1>
        <p className="text-gray-400">주문과 매출을 확인하세요</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">총 주문</p>
            <Package className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">이번 달 매출</p>
            <DollarSign className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">0원</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">결제 완료</p>
            <CreditCard className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">평균 주문액</p>
            <TrendingUp className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">0원</p>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-16 text-center">
        <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">주문 내역이 없습니다</h3>
        <p className="text-gray-400">고객의 첫 주문을 기다리고 있습니다</p>
      </div>
    </div>
  )
}
