import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function OrdersPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/partner/login')
  }

  // Fetch orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      service:services(title),
      buyer:buyers(name, email)
    `)
    .eq('partner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">주문 관리</h1>
        <p className="text-gray-400">고객 주문을 관리하세요</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 mb-4">아직 주문이 없습니다</p>
          <p className="text-sm text-gray-500">서비스를 등록하고 고객을 기다려보세요!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800/50 border-b border-dark-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">주문번호</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">서비스</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">구매자</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">금액</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">상태</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">주문일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-dark-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-mono">{order.order_number}</td>
                    <td className="px-6 py-4 text-sm text-white">{order.service?.title}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{order.buyer?.name}</div>
                      <div className="text-xs text-gray-400">{order.buyer?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      {formatCurrency(order.final_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : order.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : order.status === 'cancelled'
                          ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {order.status === 'completed' ? '완료' : 
                         order.status === 'pending' ? '대기중' :
                         order.status === 'cancelled' ? '취소' : '환불'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
