'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, PenTool, Edit, Trash2, Eye } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  excerpt?: string
  category?: string
  featured_image_url?: string
  is_published: boolean
  created_at: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/blog/list')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 글을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/blog/delete?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      loadPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('글 삭제에 실패했습니다')
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold text-white mb-2">블로그 관리</h1>
          <p className="text-gray-400">블로그 글을 작성하고 관리하세요</p>
        </div>
        <Link 
          href="/dashboard/blog/new" 
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-purple-500 transition-all"
        >
          <Plus className="w-5 h-5" />
          새 글 쓰기
        </Link>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="글 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
        />
      </div>

      {filteredPosts.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-16 text-center">
          <PenTool className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {posts.length === 0 ? '작성된 글이 없습니다' : '검색 결과가 없습니다'}
          </h3>
          <p className="text-gray-400 mb-6">
            {posts.length === 0 ? '첫 블로그 글을 작성하세요' : '다른 검색어를 시도해보세요'}
          </p>
          {posts.length === 0 && (
            <Link 
              href="/dashboard/blog/new" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              글 작성하기
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{post.title}</h3>
                    {post.is_published ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">게시됨</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">초안</span>
                    )}
                  </div>
                  {post.excerpt && (
                    <p className="text-gray-400 mb-3">{post.excerpt}</p>
                  )}
                  {post.category && (
                    <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-lg">
                      {post.category}
                    </span>
                  )}
                </div>
                {post.featured_image_url && (
                  <div className="w-32 h-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={post.featured_image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/blog/${post.id}`}
                    className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`/dashboard/blog/${post.id}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
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
