import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Search, Eye, Edit, Trash2, Package } from 'lucide-react'

export const metadata: Metadata = {
  title: '상품 관리 | Corefy',
}

const mockProducts = [
  { id: '1', title: 'SNS 마케팅 완전정복 강의', category: '온라인 강의', price: 99000, status: '판매중' },
  { id: '2', title: '유튜브 채널 성장 가이드북', category: '전자책', price: 29000, status: '판매중' },
  { id: '3', title: '1:1 컨설팅 서비스', category: '컨설팅', price: 500000, status: '준비중' },
]

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">상품 관리</h1>
          <p className="text-gray-400">판매할 상품을 등록하고 관리하세요</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-purple-500 transition-all"
        >
          <Plus className="w-5 h-5" />
          새 상품 등록
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="상품 검색..."
            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>
        <select className="px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-primary-500">
          <option>전체 카테고리</option>
          <option>온라인 강의</option>
          <option>전자책</option>
          <option>컨설팅</option>
        </select>
      </div>

      {/* 상품 목록 */}
      {mockProducts.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-16 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">등록된 상품이 없습니다</h3>
          <p className="text-gray-400 mb-6">첫 상품을 등록하고 판매를 시작하세요</p>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            상품 등록하기
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">상품명</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">카테고리</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">가격</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">상태</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-300">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {mockProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg" />
                      <span className="text-white font-medium">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-lg">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{product.price.toLocaleString()}원</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-sm rounded-lg ${
                      product.status === '판매중' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
