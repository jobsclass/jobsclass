import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, ShoppingBag, Package, Plus } from 'lucide-react'

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          안녕하세요, {profile?.display_name}님! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          오늘도 멋진 하루 보내세요!
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="총 매출"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="이번 달 주문"
          value={`${thisMonthOrders}건`}
          icon={<ShoppingBag className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="운영 중인 서비스"
          value={`${services?.length || 0}개`}
          icon={<Package className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* 빠른 액션 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">빠른 액션</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            title="새 서비스 등록"
            href="/dashboard/services/new"
            icon={<Plus className="w-5 h-5" />}
          />
          <ActionCard
            title="쿠폰 만들기"
            href="/dashboard/coupons"
            icon={<Plus className="w-5 h-5" />}
          />
          <ActionCard
            title="내 페이지 보기"
            href={`/p/${profile?.profile_url}`}
            icon={<Package className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* 최근 주문 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">최근 주문</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {!recentOrders || recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>아직 주문이 없습니다</p>
              <Link
                href="/dashboard/services/new"
                className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-semibold"
              >
                첫 서비스 등록하기 →
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    서비스
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    구매자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.service?.title || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.buyer?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.final_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status === 'completed'
                          ? '완료'
                          : order.status === 'pending'
                          ? '대기중'
                          : order.status === 'cancelled'
                          ? '취소'
                          : '환불'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  color,
}: {
  title: string
  value: string
  icon: React.ReactNode
  color: 'green' | 'blue' | 'purple'
}) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color]} text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

function ActionCard({
  title,
  href,
  icon,
}: {
  title: string
  href: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-primary-300"
    >
      <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
        {icon}
      </div>
      <span className="font-medium text-gray-900">{title}</span>
    </Link>
  )
}
