'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Folder } from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([
    { id: 1, name: '온라인 강의', slug: 'online-course', count: 5 },
    { id: 2, name: '전자책', slug: 'ebook', count: 3 },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">카테고리 관리</h1>
          <p className="text-gray-400">카테고리를 추가하고 관리하세요</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20">
          <Plus className="w-5 h-5" />
          카테고리 추가
        </button>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800/50 border-b border-gray-800">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">카테고리명</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">슬러그</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">항목 수</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-300">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-primary-400" />
                    <span className="text-white font-medium">{category.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-400">{category.slug}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                    {category.count}개
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
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
    </div>
  )
}
