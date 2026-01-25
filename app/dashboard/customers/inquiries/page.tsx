'use client'

import { useState } from 'react'
import { Mail, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([
    { id: 1, name: '김철수', email: 'kim@example.com', subject: '상품 문의', status: 'pending', date: '2024-01-20' },
    { id: 2, name: '이영희', email: 'lee@example.com', subject: '결제 관련 문의', status: 'completed', date: '2024-01-19' },
  ])

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-300',
      completed: 'bg-green-500/20 text-green-300',
      closed: 'bg-gray-500/20 text-gray-300',
    }
    const labels = {
      pending: '대기중',
      completed: '완료',
      closed: '종료',
    }
    return (
      <span className={\`px-3 py-1 rounded-lg text-sm \${styles[status as keyof typeof styles]}\`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">문의 관리</h1>
        <p className="text-gray-400">고객 문의를 확인하고 답변하세요</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">전체 문의</p>
            <Mail className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">{inquiries.length}</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">대기중</p>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-white">
            {inquiries.filter(i => i.status === 'pending').length}
          </p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">완료</p>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white">
            {inquiries.filter(i => i.status === 'completed').length}
          </p>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800/50 border-b border-gray-800">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">문의자</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">제목</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">상태</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">날짜</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="hover:bg-gray-800/30 transition-colors cursor-pointer">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-white font-medium">{inquiry.name}</p>
                    <p className="text-sm text-gray-400">{inquiry.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-white">{inquiry.subject}</span>
                </td>
                <td className="px-6 py-4">{getStatusBadge(inquiry.status)}</td>
                <td className="px-6 py-4">
                  <span className="text-gray-400">{inquiry.date}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
