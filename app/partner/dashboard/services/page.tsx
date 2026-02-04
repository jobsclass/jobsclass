'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Eye, Edit, Trash2, Package } from 'lucide-react'
import { getAllServiceTypes, formatPrice, type JobsClassServiceType } from '@/lib/constants/jobsclass'

interface Service {
  id: string
  title: string
  service_type: JobsClassServiceType
  price: number
  is_published: boolean
  thumbnail_url?: string
  created_at: string
  views_count: number
  orders_count: number
}

export default function ServicesListPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

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
      
      loadServices()
      alert('서비스가 삭제되었습니다')
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('서비스 삭제에 실패했습니다')
    }
  }

  const serviceTypes = getAllServiceTypes()

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || service.service_type === typeFilter
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">서비스 관리</h1>
            <p className="text-gray-400">판매할 지식서비스를 등록하고 관리하세요</p>
          </div>
          <Link
            href="/partner/dashboard/services/new"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-purple-500 transition-all"
          >
            <Plus className="w-5 h-5" />
            새 서비스 등록
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="서비스 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">전체 유형</option>
              {serviceTypes.map(type => (
                <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
            <p className="text-blue-400 text-sm mb-1">전체 서비스</p>
            <p className="text-3xl font-bold text-white">{services.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
            <p className="text-green-400 text-sm mb-1">공개 중</p>
            <p className="text-3xl font-bold text-white">
              {services.filter(s => s.is_published).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
            <p className="text-purple-400 text-sm mb-1">총 조회수</p>
            <p className="text-3xl font-bold text-white">
              {services.reduce((sum, s) => sum + (s.views_count || 0), 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6">
            <p className="text-orange-400 text-sm mb-1">총 주문</p>
            <p className="text-3xl font-bold text-white">
              {services.reduce((sum, s) => sum + (s.orders_count || 0), 0)}
            </p>
          </div>
        </div>

        {/* Services List */}
        {filteredServices.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-16 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {services.length === 0 ? '등록된 서비스가 없습니다' : '검색 결과가 없습니다'}
            </h3>
            <p className="text-gray-400 mb-6">
              {services.length === 0 ? '첫 서비스를 등록하고 판매를 시작하세요' : '다른 검색어를 시도해보세요'}
            </p>
            {services.length === 0 && (
              <Link
                href="/partner/dashboard/services/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                첫 서비스 등록하기
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const serviceType = serviceTypes.find(t => t.id === service.service_type)
              
              return (
                <div
                  key={service.id}
                  className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden hover:border-primary-500/50 transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800">
                    {service.thumbnail_url ? (
                      <img 
                        src={service.thumbnail_url} 
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {serviceType?.icon || '📦'}
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.is_published 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                      }`}>
                        {service.is_published ? '공개' : '비공개'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-400">
                        {serviceType?.icon} {serviceType?.name}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-2xl font-bold text-primary-400 mb-4">
                      {formatPrice(service.price)}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{service.views_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{service.orders_count || 0}건</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/partner/dashboard/services/${service.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>수정</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
