import { Metadata } from 'next'
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react'

export const metadata: Metadata = {
  title: '통계/분석 | Corefy',
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">통계 / 분석</h1>
        <p className="text-gray-400">웹사이트 성과를 분석하세요</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">총 방문자</p>
            <Eye className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-xs text-green-400 mt-2">+0% 지난 주 대비</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">페이지뷰</p>
            <BarChart3 className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-xs text-green-400 mt-2">+0% 지난 주 대비</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">전환율</p>
            <TrendingUp className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">0%</p>
          <p className="text-xs text-gray-500 mt-2">데이터 없음</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">평균 체류시간</p>
            <Users className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">0:00</p>
          <p className="text-xs text-gray-500 mt-2">데이터 없음</p>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-16 text-center">
        <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">통계 데이터가 없습니다</h3>
        <p className="text-gray-400">웹사이트 방문자 데이터가 수집되면 여기에 표시됩니다</p>
      </div>
    </div>
  )
}
