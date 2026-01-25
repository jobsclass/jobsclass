import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: '포트폴리오 관리 | Corefy',
}

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">포트폴리오 관리</h1>
          <p className="text-gray-400">작업 사례를 등록하고 관리하세요</p>
        </div>
        <Link href="/dashboard/portfolio/new" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-purple-500 transition-all">
          <Plus className="w-5 h-5" />
          새 항목 추가
        </Link>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-16 text-center">
        <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">등록된 포트폴리오가 없습니다</h3>
        <p className="text-gray-400 mb-6">첫 포트폴리오 항목을 추가하세요</p>
        <Link href="/dashboard/portfolio/new" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors">
          <Plus className="w-5 h-5" />
          항목 추가하기
        </Link>
      </div>
    </div>
  )
}
