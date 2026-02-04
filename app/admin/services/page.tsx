'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, Eye, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { getAllServiceTypes, getAllCategories } from '@/lib/constants/services'

interface Service {
  id: string
  user_id: string
  title: string
  slug: string
  category: string
  type: string
  base_price: number
  discount_price: number | null
  status: 'draft' | 'published' | 'archived'
  image_url: string | null
  created_at: string
  user_profiles: {
    display_name: string
    email: string
  }
}

export default function AdminServicesPage() {
  const supabase = createClient()
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const serviceTypes = getAllServiceTypes()
  const categories = getAllCategories()

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [searchTerm, statusFilter, typeFilter, services])

  const loadServices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          user_profiles (
            display_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('서비스 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterServices = () => {
    let filtered = services

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    // 타입 필터
    if (typeFilter !== 'all') {
      filtered = filtered.filter(s => s.type === typeFilter)
    }

    // 검색
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.user_profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredServices(filtered)
  }

  const handleStatusChange = async (serviceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_published: newStatus === 'published' })
        .eq('id', serviceId)

      if (error) throw error

      alert('서비스 상태가 변경되었습니다.')
      loadServices()
    } catch (error) {
      console.error('상태 변경 오류:', error)
      alert('처리 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">서비스 관리</h1>
          <p className="text-gray-600">등록된 서비스 목록 및 상태 관리</p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">전체 서비스</p>
            <p className="text-2xl font-bold text-gray-900">{services.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">게시됨</p>
            <p className="text-2xl font-bold text-green-600">
              {services.filter(s => s.status === 'published').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">초안</p>
            <p className="text-2xl font-bold text-orange-600">
              {services.filter(s => s.status === 'draft').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">보관됨</p>
            <p className="text-2xl font-bold text-gray-600">
              {services.filter(s => s.status === 'archived').length}
            </p>
          </div>
        </div>

        {/* 필터 & 검색 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="서비스 제목, 파트너 이름 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체 상태</option>
              <option value="published">게시됨</option>
              <option value="draft">초안</option>
              <option value="archived">보관됨</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체 타입</option>
              {serviceTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 서비스 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    서비스
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    파트너
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    타입
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      서비스가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {service.image_url && (
                            <img
                              src={service.image_url}
                              alt={service.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {service.title}
                            </div>
                            <div className="text-xs text-gray-500">{service.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{service.user_profiles?.display_name}</div>
                        <div className="text-xs text-gray-500">{service.user_profiles?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {serviceTypes.find(t => t.id === service.type)?.name || service.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {service.discount_price ? (
                            <>
                              <span className="line-through text-gray-400 text-xs">
                                ₩{(service.base_price / 10000).toFixed(1)}만
                              </span>
                              <span className="ml-2 font-medium text-primary-600">
                                ₩{(service.discount_price / 10000).toFixed(1)}만
                              </span>
                            </>
                          ) : (
                            <span>₩{(service.base_price / 10000).toFixed(1)}만</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={service.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(service.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/marketplace/products/${service.id}`}
                            target="_blank"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="서비스 보기"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          {service.status === 'draft' && (
                            <button
                              onClick={() => handleStatusChange(service.id, 'published')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="게시"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          {service.status === 'published' && (
                            <button
                              onClick={() => handleStatusChange(service.id, 'archived')}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                              title="보관"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// 상태 배지
function StatusBadge({ status }: { status: string }) {
  const config = {
    draft: { bg: 'bg-orange-100', text: 'text-orange-800', label: '초안' },
    published: { bg: 'bg-green-100', text: 'text-green-800', label: '게시됨' },
    archived: { bg: 'bg-gray-100', text: 'text-gray-800', label: '보관됨' }
  }

  const { bg, text, label } = config[status as keyof typeof config] || config.draft

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  )
}
