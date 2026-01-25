'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, DollarSign, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

type Order = {
  id: string
  order_number: string
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  total_amount: number
  created_at: string
  paid_at?: string
  service: {
    id: string
    title: string
    thumbnail_url?: string
    base_price: number
  }
  customer: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

type Stats = {
  total: number
  pending: number
  paid: number
  cancelled: number
  refunded: number
  totalRevenue: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        role: 'partner', // 파트너: 판매 내역
      })
      
      if (filter !== 'all') {
        queryParams.append('status', filter)
      }

      const response = await fetch(`/api/orders?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        alert('✅ 주문 상태가 변경되었습니다')
        fetchOrders()
        setSelectedOrder(null)
      } else {
        alert('❌ 상태 변경 실패')
      }
    } catch (error) {
      console.error('Status change error:', error)
      alert('❌ 오류가 발생했습니다')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: '대기 중', icon: Clock },
      paid: { bg: 'bg-green-500/20', text: 'text-green-400', label: '결제 완료', icon: CheckCircle },
      cancelled: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: '취소됨', icon: XCircle },
      refunded: { bg: 'bg-red-500/20', text: 'text-red-400', label: '환불됨', icon: RefreshCw },
    }
    const badge = badges[status as keyof typeof badges]
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-white">주문 관리</h1>
        <p className="text-gray-400 mt-1">서비스 판매 내역을 확인하고 관리하세요</p>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">총 주문</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">총 수익</p>
                <p className="text-2xl font-bold text-white">₩{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">대기 중</p>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">완료</p>
                <p className="text-2xl font-bold text-white">{stats.paid}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            전체 ({stats?.total || 0})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            대기 중 ({stats?.pending || 0})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'paid'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            완료 ({stats?.paid || 0})
          </button>
          <button
            onClick={() => setFilter('refunded')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'refunded'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            환불 ({stats?.refunded || 0})
          </button>
        </div>
      </div>

      {/* 주문 목록 */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">주문 번호</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">서비스</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">고객</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">금액</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">상태</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">주문 일시</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    로딩 중...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    주문 내역이 없습니다
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-white">{order.order_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">{order.service.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{order.customer.name}</p>
                      <p className="text-xs text-gray-400">{order.customer.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-white">₩{order.total_amount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-sm text-primary-400 hover:text-primary-300 font-medium"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 모달 */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">주문 상세</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 주문 정보 */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">주문 번호</h3>
                <p className="text-lg font-mono text-white">{selectedOrder.order_number}</p>
              </div>

              {/* 서비스 정보 */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">서비스</h3>
                <p className="text-lg text-white">{selectedOrder.service.title}</p>
              </div>

              {/* 고객 정보 */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">고객 정보</h3>
                <div className="space-y-1">
                  <p className="text-white">{selectedOrder.customer.name}</p>
                  <p className="text-gray-400">{selectedOrder.customer.email}</p>
                  {selectedOrder.customer.phone && (
                    <p className="text-gray-400">{selectedOrder.customer.phone}</p>
                  )}
                </div>
              </div>

              {/* 금액 */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">결제 금액</h3>
                <p className="text-2xl font-bold text-white">₩{selectedOrder.total_amount.toLocaleString()}</p>
              </div>

              {/* 상태 */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">현재 상태</h3>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* 상태 변경 (파트너만) */}
              {selectedOrder.status === 'pending' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">상태 변경</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'paid')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                    >
                      결제 완료 처리
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                    >
                      주문 취소
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-800">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
