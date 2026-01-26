'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Clock, FileText, DollarSign, Users, TrendingUp } from 'lucide-react'

interface Partner {
  user_id: string
  display_name: string
  email: string
  username: string
  business_number: string
  business_registration_file: string
  verification_status: 'pending' | 'approved' | 'rejected'
  verification_message: string | null
  partner_plan_id: string | null
  total_revenue: number
  total_orders: number
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [pendingPartners, setPendingPartners] = useState<Partner[]>([])
  const [allPartners, setAllPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPartners: 0,
    pendingVerifications: 0,
    totalRevenue: 0,
    totalOrders: 0
  })

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/user/login')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        alert('관리자만 접근할 수 있습니다.')
        router.push('/dashboard')
        return
      }

      setCurrentUser(profile)
      loadData()
    } catch (error) {
      console.error('관리자 확인 오류:', error)
      router.push('/dashboard')
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)

      // 대기 중인 파트너
      const { data: pending } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'partner')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false })

      setPendingPartners(pending || [])

      // 전체 파트너
      const { data: all } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'partner')
        .order('created_at', { ascending: false })

      setAllPartners(all || [])

      // 통계
      const totalPartners = all?.length || 0
      const pendingCount = pending?.length || 0
      const totalRevenue = all?.reduce((sum, p) => sum + (p.total_revenue || 0), 0) || 0
      const totalOrders = all?.reduce((sum, p) => sum + (p.total_orders || 0), 0) || 0

      setStats({
        totalPartners,
        pendingVerifications: pendingCount,
        totalRevenue,
        totalOrders
      })
    } catch (error) {
      console.error('데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (partnerId: string, action: 'approve' | 'reject', message?: string) => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected'
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          verification_status: status,
          business_verified: action === 'approve',
          verification_message: message || null,
          verified_at: action === 'approve' ? new Date().toISOString() : null
        })
        .eq('user_id', partnerId)

      if (error) throw error

      alert(action === 'approve' ? '파트너가 승인되었습니다!' : '파트너가 거절되었습니다.')
      loadData()
    } catch (error) {
      console.error('검증 처리 오류:', error)
      alert('처리 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
          <p className="text-gray-600">파트너 승인 및 플랫폼 관리</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="전체 파트너"
            value={stats.totalPartners}
            color="blue"
          />
          <StatCard
            icon={Clock}
            title="승인 대기"
            value={stats.pendingVerifications}
            color="orange"
          />
          <StatCard
            icon={DollarSign}
            title="총 매출"
            value={`₩${stats.totalRevenue.toLocaleString()}`}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            title="총 주문"
            value={stats.totalOrders}
            color="purple"
          />
        </div>

        {/* 승인 대기 중인 파트너 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">승인 대기 중</h2>
          </div>
          <div className="p-6">
            {pendingPartners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                승인 대기 중인 파트너가 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPartners.map(partner => (
                  <PartnerCard
                    key={partner.user_id}
                    partner={partner}
                    onApprove={() => handleVerification(partner.user_id, 'approve')}
                    onReject={() => {
                      const message = prompt('거절 사유를 입력하세요:')
                      if (message) {
                        handleVerification(partner.user_id, 'reject', message)
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 전체 파트너 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">전체 파트너</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      파트너
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사업자번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요금제
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      매출
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allPartners.map(partner => (
                    <tr key={partner.user_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{partner.display_name}</div>
                          <div className="text-sm text-gray-500">{partner.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {partner.business_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={partner.verification_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {partner.partner_plan_id?.toUpperCase() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₩{(partner.total_revenue || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(partner.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 통계 카드
function StatCard({ icon: Icon, title, value, color }: { icon: any; title: string; value: string | number; color: 'blue' | 'orange' | 'green' | 'purple' }) {
  const colors = {
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4">
        <div className={`${colors[color]} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

// 파트너 카드
function PartnerCard({ partner, onApprove, onReject }: any) {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{partner.display_name}</h3>
          <p className="text-sm text-gray-600">{partner.email}</p>
          <p className="text-sm text-gray-600">@{partner.username}</p>
        </div>
        <StatusBadge status={partner.verification_status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">사업자등록번호</p>
          <p className="text-sm font-medium text-gray-900">{partner.business_number}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">가입일</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(partner.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">사업자등록증</p>
        <a
          href={partner.business_registration_file}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
        >
          <FileText className="w-4 h-4" />
          파일 보기
        </a>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onApprove}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          승인
        </button>
        <button
          onClick={onReject}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          거절
        </button>
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
