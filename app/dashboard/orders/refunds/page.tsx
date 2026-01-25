'use client'

import { AlertCircle } from 'lucide-react'

export default function RefundsPage() {
  const refunds: any[] = []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">환불 요청</h1>
        <p className="text-gray-400">환불 요청을 확인하고 처리하세요</p>
      </div>

      {refunds.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-16 text-center">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">환불 요청이 없습니다</h3>
          <p className="text-gray-400">환불 요청이 들어오면 여기에 표시됩니다</p>
        </div>
      ) : (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">주문번호</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">고객</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">금액</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">사유</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">상태</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-300">작업</th>
              </tr>
            </thead>
            <tbody>
              {/* 환불 목록 */}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
