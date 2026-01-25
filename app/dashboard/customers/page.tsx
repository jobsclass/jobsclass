import { Metadata } from 'next'
import { Users, Search, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: '고객 관리 | Corefy',
}

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">고객 관리</h1>
        <p className="text-gray-400">고객 정보와 문의사항을 관리하세요</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">전체 고객</p>
            <Users className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">신규 문의</p>
            <Mail className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">구매 고객</p>
            <Users className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-16 text-center">
        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">등록된 고객이 없습니다</h3>
        <p className="text-gray-400">고객이 상품을 구매하면 자동으로 등록됩니다</p>
      </div>
    </div>
  )
}
