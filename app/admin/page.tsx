'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Clock, FileText, DollarSign, Users, TrendingUp, Settings, ArrowRight } from 'lucide-react'

interface Partner {
  user_id: string
  display_name: string
  email: string
  username: string
  business_number: string
  business_registration_file: string
  verification_status: 'pending' | 'approved' | 'rejected'
  verification_message: string | null
  ai_credits: number
  total_revenue: number
  total_orders: number
  created_at: string
}

export default function AdminPage() {
  const supabase = createClient()
  
  const [pendingPartners, setPendingPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPartners: 0,
    totalClients: 0,
    totalServices: 0,
    pendingVerifications: 0,
    totalRevenue: 0,
    totalOrders: 0,
    activeServices: 0,
    draftServices: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // 파트너 통계
      const { data: partners, count: partnerCount } = await supabase
        .from('user_profiles')
        .select('*, user_type', { count: 'exact' })
        .eq('user_type', 'partner')

      // 클라이언트 통계
      const { count: clientCount } = await supabase
        .from('user_profiles')
        .select('user_id', { count: 'exact' })
        .eq('user_type', 'client')

      // 대기 중인 파트너
      const { data: pending } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_type', 'partner')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10)

      setPendingPartners(pending || [])

      // 서비스 통계
      const { data: services } = await supabase
        .from('services')
        .select('is_published')

      const totalServices = services?.length || 0
      const activeServices = services?.filter(s => s.is_published === true).length || 0
      const draftServices = services?.filter(s => s.is_published === false).length || 0

      // 주문 및 매출 통계
      const { data: orders } = await supabase
        .from('orders')
        .select('amount, status')

      const totalOrders = orders?.length || 0
      const totalRevenue = orders?.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.amount || 0), 0) || 0

      setStats({
        totalPartners: partnerCount || 0,
        totalClients: clientCount || 0,
        totalServices,
        pendingVerifications: pending?.length || 0,
        totalRevenue,
        totalOrders,
        activeServices,
        draftServices
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
            title="파트너"
            value={stats.totalPartners}
            subtitle={`대기 ${stats.pendingVerifications}명`}
            color="blue"
          />
          <StatCard
            icon={Users}
            title="클라이언트"
            value={stats.totalClients}
            color="purple"
          />
          <StatCard
            icon={FileText}
            title="서비스"
            value={stats.totalServices}
            subtitle={`활성 ${stats.activeServices} / 초안 ${stats.draftServices}`}
            color="green"
          />
          <StatCard
            icon={DollarSign}
            title="총 매출"
            value={`₩${(stats.totalRevenue / 10000).toFixed(1)}만`}
            subtitle={`주문 ${stats.totalOrders}건`}
            color="orange"
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

        {/* 빠른 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="파트너 관리"
            description="전체 파트너 목록 및 상세 관리"
            href="/admin/partners"
            icon={Users}
            count={stats.totalPartners}
          />
          <QuickActionCard
            title="서비스 관리"
            description="등록된 서비스 승인 및 관리"
            href="/admin/services"
            icon={FileText}
            count={stats.totalServices}
          />
          <QuickActionCard
            title="설정"
            description="푸터 정보 및 사이트 설정"
            href="/admin/settings/footer"
            icon={Settings}
          />
        </div>
      </div>
    </div>
  )
}

// 통계 카드
function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle,
  color 
}: { 
  icon: any; 
  title: string; 
  value: string | number; 
  subtitle?: string;
  color: 'blue' | 'orange' | 'green' | 'purple' 
}) {
  const colors = {
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4">
        <div className={`${colors[color]} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// 빠른 액션 카드
function QuickActionCard({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  count 
}: { 
  title: string; 
  description: string; 
  href: string; 
  icon: any; 
  count?: number 
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      {count !== undefined && (
        <p className="text-2xl font-bold text-primary-600 mt-4">{count}</p>
      )}
    </Link>
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
