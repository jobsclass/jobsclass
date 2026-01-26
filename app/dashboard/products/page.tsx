'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Package, Eye, Edit, Trash2, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Product = {
  id: string
  title: string
  price: number
  category: string
  status: string
  view_count: number
  purchase_count: number
  created_at: string
  thumbnail_url?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      course: '온라인 강의',
      coaching: '1:1 코칭',
      consulting: '컨설팅',
      template: '템플릿',
      ebook: '전자책',
      membership: '멤버십',
    }
    return labels[category] || category
  }

  const getStatusBadge = (status: string) => {
    if (status === 'published') {
      return <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">판매중</span>
    }
    return <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-xs rounded-full">비공개</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">상품 관리</h1>
          <p className="text-gray-400">내 상품을 관리하고 판매 현황을 확인하세요</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          상품 등록
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">전체 상품</p>
              <p className="text-2xl font-bold text-white">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">총 조회수</p>
              <p className="text-2xl font-bold text-white">
                {products.reduce((sum, p) => sum + (p.view_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">총 판매</p>
              <p className="text-2xl font-bold text-white">
                {products.reduce((sum, p) => sum + (p.purchase_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">아직 상품이 없습니다</h3>
          <p className="text-gray-400 mb-6">첫 상품을 등록하고 판매를 시작하세요!</p>
          <Link href="/dashboard/products/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            첫 상품 등록하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card p-6 hover:border-primary-500/30 transition-all">
              {product.thumbnail_url && (
                <div className="mb-4 aspect-video bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={product.thumbnail_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{getCategoryLabel(product.category)}</span>
                  {getStatusBadge(product.status)}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{product.title}</h3>
                <p className="text-xl font-bold text-primary-400">
                  {product.price.toLocaleString()}원
                </p>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{product.view_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{product.purchase_count || 0}개 판매</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/marketplace/products/${product.id}`}
                  target="_blank"
                  className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  보기
                </Link>
                <Link
                  href={`/dashboard/products/${product.id}/edit`}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  수정
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
