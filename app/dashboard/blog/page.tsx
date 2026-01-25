import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Search, PenTool } from 'lucide-react'

export const metadata: Metadata = {
  title: '블로그 관리 | Corefy',
}

export default function BlogPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">블로그 관리</h1>
          <p className="text-gray-400">블로그 글을 작성하고 관리하세요</p>
        </div>
        <Link href="/dashboard/blog/new" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-purple-500 transition-all">
          <Plus className="w-5 h-5" />
          새 글 쓰기
        </Link>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-16 text-center">
        <PenTool className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">작성된 글이 없습니다</h3>
        <p className="text-gray-400 mb-6">첫 블로그 글을 작성하세요</p>
        <Link href="/dashboard/blog/new" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors">
          <Plus className="w-5 h-5" />
          글 작성하기
        </Link>
      </div>
    </div>
  )
}
