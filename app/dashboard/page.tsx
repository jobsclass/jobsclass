import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, ShoppingBag, Package, Plus, TrendingUp, ArrowUpRight, Eye, Globe, ExternalLink } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // 파트너 프로필 가져오기
  const { data: profile } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // 통계 데이터 가져오기
  const { data: services } = await supabase
    .from('services')
    .select('id')
    .eq('partner_id', user.id)

  const { data: orders } = await supabase
    .from('orders')
    .select('final_amount, status, created_at')
    .eq('partner_id', user.id)
    .eq('status', 'completed')

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.final_amount), 0) || 0
  
  const thisMonthOrders = orders?.filter((order) => {
    const orderDate = new Date(order.created_at)
    const now = new Date()
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
  }).length || 0

  // 최근 주문
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      *,
      service:services(title),
      buyer:buyers(name, email)
    `)
    .eq('partner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          안녕하세요, {profile?.display_name}님! 👋
        </h1>
        <p className="text-gray-400 text-lg">
          오늘도 멋진 하루 보내세요!
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="총 매출"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          trend="+12.5%"
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="이번 달 주문"
          value={`${thisMonthOrders}건`}
          icon={<ShoppingBag className="w-6 h-6" />}
          trend="+8.2%"
          gradient="from-blue-500 to-cyan-600"
        />
        <StatCard
          title="운영 중인 서비스"
          value={`${services?.length || 0}개`}
          icon={<Package className="w-6 h-6" />}
          gradient="from-purple-500 to-pink-600"
        />
      </div>

      {/* 빠른 액션 */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-6">빠른 액션</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 내 웹사이트 카드 - 강조 */}
          <Link
            href={`/p/${profile?.profile_url}`}
            target="_blank"
            className="relative group col-span-1 md:col-span-2"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">내 웹사이트</h3>
              <p className="text-gray-400 text-sm mb-3">
                고객이 보는 페이지를 확인하세요
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary-400 font-mono">
                  corefy.com/p/{profile?.profile_url}
                </span>
              </div>
            </div>
          </Link>

          <ActionCard
            title="새 서비스 등록"
            description="새로운 강의나 서비스를 등록하세요"
            href="/dashboard/services/new"
            icon={<Plus className="w-6 h-6" />}
            gradient="from-primary-500 to-purple-600"
          />
          <ActionCard
            title="쿠폰 만들기"
            description="할인 쿠폰을 생성하세요"
            href="/dashboard/coupons"
            icon={<TrendingUp className="w-6 h-6" />}
            gradient="from-emerald-500 to-teal-600"
          />
        </div>
      </div>

      {/* 최근 주문 */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">최근 주문</h2>
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
          {!recentOrders || recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-2xl mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg mb-4">아직 주문이 없습니다</p>
              <Link
                href="/dashboard/services/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/20 transition-all font-semibold"
              >
                첫 서비스 등록하기
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      주문번호
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      서비스
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      구매자
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      금액
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {order.service?.title || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {order.buyer?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        {formatCurrency(order.final_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  trend,
  gradient,
}: {
  title: string
  value: string
  icon: React.ReactNode
  trend?: string
  gradient: string
}) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
      <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
          <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>{trend}</span>
            <span className="text-gray-500">이번 달</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ActionCard({
  title,
  description,
  href,
  icon,
  gradient,
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  gradient: string
}) {
  return (
    <Link
      href={href}
      className="group relative"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
      <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all">
        <div className="flex items-start gap-4">
          <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{description}</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
        </div>
      </div>
    </Link>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    completed: {
      label: '완료',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    pending: {
      label: '대기중',
      className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    cancelled: {
      label: '취소',
      className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    },
    refunded: {
      label: '환불',
      className: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.className}`}
    >
      {config.label}
    </span>
  )
}
