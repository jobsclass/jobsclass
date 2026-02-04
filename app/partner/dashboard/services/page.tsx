'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Eye, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAllServiceTypes } from '@/lib/constants/jobsclass'

interface Service {
  id: string
  title: string
  service_type: string
  category: string
  price: number
  is_published: boolean
  is_active: boolean
  thumbnail_url?: string
  created_at: string
  view_count: number
  purchase_count: number
}

export default function ServicesListPage() {
  const router = useRouter()
  const supabase = createClient()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error loading services:', error)
      alert('서비스 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 서비스를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      loadServices()
      alert('서비스가 삭제되었습니다 ✅')
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('서비스 삭제에 실패했습니다')
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_published: !currentStatus })
        .eq('id', id)

      if (error) throw error
      
      loadServices()
    } catch (error) {
      console.error('Error toggling publish:', error)
      alert('상태 변경에 실패했습니다')
    }
  }

  const serviceTypes = getAllServiceTypes()

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || service.service_type === typeFilter
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'published' && service.is_published) ||
      (statusFilter === 'draft' && !service.is_published)
    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/partner/dashboard"
                className="p-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">서비스 관리</h1>
                <p className="text-sm text-gray-600 mt-1">
                  총 {services.length}개 서비스 · 게시중 {services.filter(s => s.is_published).length}개
                </p>
              </div>
            </div>
            <Link
              href="/partner/dashboard/services/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              새 서비스 등록
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="서비스 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">모든 유형</option>
              {serviceTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">모든 상태</option>
              <option value="published">게시중</option>
              <option value="draft">비공개</option>
            </select>
          </div>
        </div>

        {/* Services List */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Package className="h-16 w-16 mx-auto mb-3 opacity-50" />
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' ? (
                <p>검색 결과가 없습니다</p>
              ) : (
                <p>등록된 서비스가 없습니다</p>
              )}
            </div>
            <Link
              href="/partner/dashboard/services/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              첫 서비스 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  {service.thumbnail_url ? (
                    <img
                      src={service.thumbnail_url}
                      alt={service.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {service.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {serviceTypes.find(t => t.id === service.service_type)?.label || service.service_type}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {service.category}
                          </span>
                          <span className={`px-2 py-1 rounded ${
                            service.is_published 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {service.is_published ? '게시중' : '비공개'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          ₩{service.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          조회 {service.view_count || 0} · 판매 {service.purchase_count || 0}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 mb-3">
                      등록일: {new Date(service.created_at).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/services/${service.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition"
                      >
                        <Eye className="h-4 w-4" />
                        미리보기
                      </button>
                      <button
                        onClick={() => router.push(`/partner/dashboard/services/edit/${service.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
                      >
                        <Edit className="h-4 w-4" />
                        수정
                      </button>
                      <button
                        onClick={() => togglePublish(service.id, service.is_published)}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                          service.is_published
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {service.is_published ? '비공개로 전환' : '게시하기'}
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition ml-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
