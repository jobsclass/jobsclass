'use client'

import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react'

export default function OrderStatsPage() {
  const stats = [
    { label: '이번 달 매출', value: '0원', icon: DollarSign, change: '+0%', color: 'text-green-400' },
    { label: '총 주문', value: '0', icon: ShoppingCart, change: '+0%', color: 'text-blue-400' },
    { label: '평균 주문액', value: '0원', icon: TrendingUp, change: '+0%', color: 'text-purple-400' },
    { label: '구매 고객', value: '0', icon: Users, change: '+0%', color: 'text-primary-400' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">매출 통계</h1>
        <p className="text-gray-400">매출 현황을 확인하세요</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <stat.icon className={\`w-5 h-5 \${stat.color}\`} />
            </div>
            <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
            <p className={\`text-sm \${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}\`}>
              {stat.change} 지난 달 대비
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
        <h2 className="text-xl font-bold text-white mb-6">월별 매출 추이</h2>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">매출 데이터가 쌓이면 차트가 표시됩니다</p>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
        <h2 className="text-xl font-bold text-white mb-6">인기 상품</h2>
        <div className="text-center py-12">
          <p className="text-gray-500">주문 데이터가 없습니다</p>
        </div>
      </div>
    </div>
  )
}
