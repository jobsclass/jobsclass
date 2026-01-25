'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Briefcase, Edit, Trash2, Eye } from 'lucide-react'

interface PortfolioItem {
  id: string
  title: string
  description: string
  client?: string
  category?: string
  thumbnail_url?: string
  is_published: boolean
  created_at: string
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const response = await fetch('/api/portfolio/list')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 포트폴리오를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/portfolio/delete?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      loadItems()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('포트폴리오 삭제에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">포트폴리오 관리</h1>
          <p className="text-gray-400">작업 사례를 등록하고 관리하세요</p>
        </div>
        <Link 
          href="/dashboard/portfolio/new" 
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-purple-500 transition-all"
        >
          <Plus className="w-5 h-5" />
          새 항목 추가
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-16 text-center">
          <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">등록된 포트폴리오가 없습니다</h3>
          <p className="text-gray-400 mb-6">첫 포트폴리오 항목을 추가하세요</p>
          <Link 
            href="/dashboard/portfolio/new" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            항목 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
              <div className="aspect-video bg-gray-800 overflow-hidden">
                {item.thumbnail_url && (
                  <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  {item.is_published ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded flex-shrink-0">게시됨</span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded flex-shrink-0">초안</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                {item.client && (
                  <p className="text-primary-300 text-sm mb-4">클라이언트: {item.client}</p>
                )}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/portfolio/${item.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    보기
                  </Link>
                  <Link
                    href={`/dashboard/portfolio/${item.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    수정
                  </Link>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center justify-center px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
