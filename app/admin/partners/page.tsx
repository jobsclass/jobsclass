'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, CheckCircle, XCircle, Filter, UserX } from 'lucide-react'

interface Partner {
  user_id: string
  display_name: string
  email: string
  username: string
  business_number: string
  business_registration_file: string
  verification_status: 'pending' | 'approved' | 'rejected'
  verification_message: string | null
  is_active: boolean
  ai_credits: number
  total_revenue: number
  total_orders: number
  created_at: string
}

export default function AdminPartnersPage() {
  const supabase = createClient()
  const [partners, setPartners] = useState<Partner[]>([])
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadPartners()
  }, [])

  useEffect(() => {
    filterPartners()
  }, [searchTerm, statusFilter, partners])

  const loadPartners = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_type', 'partner')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPartners(data || [])
    } catch (error) {
      console.error('파트너 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPartners = () => {
    let filtered = partners

    // 상태 필터
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(p => p.is_active)
      } else {
        filtered = filtered.filter(p => p.verification_status === statusFilter)
      }
    }

    // 검색
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPartners(filtered)
  }

  const handleVerification = async (partnerId: string, action: 'approve' | 'reject') => {
    const message = action === 'reject' ? prompt('거절 사유를 입력하세요:') : null
    if (action === 'reject' && !message) return

    try {
      const status = action === 'approve' ? 'approved' : 'rejected'
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          verification_status: status,
          business_verified: action === 'approve',
          verification_message: message,
          verified_at: action === 'approve' ? new Date().toISOString() : null
        })
        .eq('user_id', partnerId)

      if (error) throw error

      alert(action === 'approve' ? '파트너가 승인되었습니다!' : '파트너가 거절되었습니다.')
      loadPartners()
    } catch (error) {
      console.error('검증 처리 오류:', error)
      alert('처리 중 오류가 발생했습니다.')
    }
  }

  const handleToggleActive = async (partnerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !currentStatus })
        .eq('user_id', partnerId)

      if (error) throw error

      alert(currentStatus ? '파트너 활동이 중지되었습니다.' : '파트너 활동이 재개되었습니다.')
      loadPartners()
    } catch (error) {
      console.error('활동 상태 변경 오류:', error)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">파트너 관리</h1>
          <p className="text-gray-600">전체 파트너 목록 및 승인 관리</p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">전체 파트너</p>
            <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">승인 대기</p>
            <p className="text-2xl font-bold text-orange-600">
              {partners.filter(p => p.verification_status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">승인됨</p>
            <p className="text-2xl font-bold text-green-600">
              {partners.filter(p => p.verification_status === 'approved').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">활동 중</p>
            <p className="text-2xl font-bold text-blue-600">
              {partners.filter(p => p.is_active).length}
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
                placeholder="파트너 이름, 이메일, username 검색..."
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
              <option value="all">전체</option>
              <option value="pending">승인 대기</option>
              <option value="approved">승인됨</option>
              <option value="rejected">거절됨</option>
              <option value="active">활동 중</option>
            </select>
          </div>
        </div>

        {/* 파트너 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    파트너
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    인증 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    활동 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    크레딧
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    매출
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      파트너가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((partner) => (
                    <tr key={partner.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{partner.display_name}</div>
                          <div className="text-sm text-gray-500">{partner.email}</div>
                          <div className="text-xs text-gray-400">@{partner.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={partner.verification_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          partner.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {partner.is_active ? '활동 중' : '중지됨'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {partner.ai_credits || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₩{((partner.total_revenue || 0) / 10000).toFixed(1)}만
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(partner.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {partner.verification_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerification(partner.user_id, 'approve')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="승인"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleVerification(partner.user_id, 'reject')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="거절"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleToggleActive(partner.user_id, partner.is_active)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                            title={partner.is_active ? '활동 중지' : '활동 재개'}
                          >
                            <UserX className="w-5 h-5" />
                          </button>
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
    pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: '대기 중' },
    approved: { bg: 'bg-green-100', text: 'text-green-800', label: '승인됨' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: '거절됨' }
  }

  const { bg, text, label } = config[status as keyof typeof config]

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  )
}
