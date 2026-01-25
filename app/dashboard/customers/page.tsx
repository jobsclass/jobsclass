'use client'

import { useEffect, useState } from 'react'
import { Mail, Phone, Calendar, CheckCircle, Clock, XCircle, Trash2, Filter } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  status: 'new' | 'contacted' | 'completed' | 'cancelled'
  created_at: string
  services: { id: string; title: string } | null
}

const statusConfig = {
  new: { label: '신규', color: 'blue', icon: Mail },
  contacted: { label: '연락함', color: 'yellow', icon: Clock },
  completed: { label: '완료', color: 'green', icon: CheckCircle },
  cancelled: { label: '취소', color: 'gray', icon: XCircle }
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [filter])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const url = filter === 'all' 
        ? '/api/customers' 
        : `/api/customers?status=${filter}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Fetch customers error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await fetchCustomers()
        setSelectedCustomer(null)
      }
    } catch (error) {
      console.error('Update status error:', error)
      alert('상태 업데이트 실패')
    }
  }

  const deleteCustomer = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCustomers()
        setSelectedCustomer(null)
      }
    } catch (error) {
      console.error('Delete customer error:', error)
      alert('삭제 실패')
    }
  }

  const stats = {
    total: customers.length,
    new: customers.filter(c => c.status === 'new').length,
    contacted: customers.filter(c => c.status === 'contacted').length,
    completed: customers.filter(c => c.status === 'completed').length
  }

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          고객 관리
        </h1>
        <p className="text-gray-400">
          문의 고객을 관리하고 상태를 추적하세요
        </p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl">
          <p className="text-sm text-blue-400 mb-1">전체 문의</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl">
          <p className="text-sm text-yellow-400 mb-1">신규</p>
          <p className="text-3xl font-bold text-white">{stats.new}</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl">
          <p className="text-sm text-purple-400 mb-1">연락함</p>
          <p className="text-3xl font-bold text-white">{stats.contacted}</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl">
          <p className="text-sm text-green-400 mb-1">완료</p>
          <p className="text-3xl font-bold text-white">{stats.completed}</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-gray-400" />
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter('new')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'new'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          신규
        </button>
        <button
          onClick={() => setFilter('contacted')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'contacted'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          연락함
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-green-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          완료
        </button>
      </div>

      {/* 고객 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">로딩 중...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
          <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">아직 문의가 없습니다</p>
          <p className="text-sm text-gray-500">
            고객이 문의를 남기면 여기에 표시됩니다
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {customers.map((customer) => {
            const config = statusConfig[customer.status]
            const StatusIcon = config.icon

            return (
              <div
                key={customer.id}
                className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-primary-500/50 transition-colors cursor-pointer"
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-500/20 rounded-lg">
                      <Mail className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {customer.name}
                      </h3>
                      <p className="text-sm text-gray-400">{customer.email}</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-${config.color}-500/20 text-${config.color}-400`}>
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                </div>

                {customer.phone && (
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {customer.phone}
                  </p>
                )}

                {customer.services && (
                  <p className="text-sm text-primary-400 mb-2">
                    문의 서비스: {customer.services.title}
                  </p>
                )}

                <p className="text-gray-300 mb-3 line-clamp-2">
                  {customer.message}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(customer.created_at).toLocaleString('ko-KR')}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 상세 모달 */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">문의 상세</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400">이름</label>
                <p className="text-white font-medium">{selectedCustomer.name}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400">이메일</label>
                <p className="text-white">{selectedCustomer.email}</p>
              </div>

              {selectedCustomer.phone && (
                <div>
                  <label className="text-sm text-gray-400">연락처</label>
                  <p className="text-white">{selectedCustomer.phone}</p>
                </div>
              )}

              {selectedCustomer.services && (
                <div>
                  <label className="text-sm text-gray-400">문의 서비스</label>
                  <p className="text-primary-400">{selectedCustomer.services.title}</p>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400">문의 내용</label>
                <p className="text-white whitespace-pre-wrap">{selectedCustomer.message}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">상태 변경</label>
                <div className="flex gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => updateStatus(selectedCustomer.id, key)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedCustomer.status === key
                          ? `bg-${config.color}-500 text-white`
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex gap-3">
              <button
                onClick={() => deleteCustomer(selectedCustomer.id)}
                className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
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
