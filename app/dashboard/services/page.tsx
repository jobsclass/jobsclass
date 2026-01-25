'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Eye, Edit, Trash2, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Service {
  id: string
  title: string
  service_category: string
  price: number
  is_published: boolean
  thumbnail_url?: string
  created_at: string
}

export default function ServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const response = await fetch('/api/services/list')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 서비스를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/services/delete?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      
      // 목록 새로고침
      loadServices()
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('서비스 삭제에 실패했습니다')
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === '전체' || service.service_category === categoryFilter
    return matchesSearch && matchesCategory
  })

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
          <h1 className="text-3xl font-bold text-white mb-2">서비스 관리</h1>
          <p className="text-gray-400">판매할 지식 서비스를 등록하고 관리하세요</p>
        </div>
        <Link
          href="/dashboard/services/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-purple-500 transition-all"
        >
          <Plus className="w-5 h-5" />
          새 서비스 등록
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="서비스 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-primary-500"
        >
          <option>전체</option>
          <option>온라인 강의</option>
          <option>오프라인 강의/강연</option>
          <option>1:1 코칭/멘토링</option>
          <option>부트캠프/그룹 프로그램</option>
          <option>컨설팅</option>
          <option>개발 대행</option>
          <option>마케팅 대행</option>
          <option>디자인 대행</option>
          <option>콘텐츠 제작</option>
          <option>전자책/가이드</option>
          <option>디지털 상품</option>
          <option>기타 서비스</option>
        </select>
      </div>

      {/* 서비스 목록 */}
      {filteredServices.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-16 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {services.length === 0 ? '등록된 서비스가 없습니다' : '검색 결과가 없습니다'}
          </h3>
          <p className="text-gray-400 mb-6">
            {services.length === 0 ? '첫 서비스를 등록하고 판매를 시작하세요' : '다른 검색어를 시도해보세요'}
          </p>
          {services.length === 0 && (
            <Link
              href="/dashboard/services/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              서비스 등록하기
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">서비스명</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">카테고리</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">가격</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">상태</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-300">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden">
                        {service.thumbnail_url && (
                          <img src={service.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="text-white font-medium">{service.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-lg">
                      {service.service_category || '미분류'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{service.price.toLocaleString()}원</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-sm rounded-lg ${
                      service.is_published 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {service.is_published ? '판매중' : '준비중'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/services/${service.id}`}
                        className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/dashboard/services/${service.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
