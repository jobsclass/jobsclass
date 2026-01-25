'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, GraduationCap } from 'lucide-react'

export default function EducationsPage() {
  const [educations, setEducations] = useState([
    { id: 1, school: '한국대학교', degree: '학사', field: '컴퓨터공학', startDate: '2016-03', endDate: '2020-02' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">학력 사항</h1>
          <p className="text-gray-400">학력을 추가하고 관리하세요</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20">
          <Plus className="w-5 h-5" />
          학력 추가
        </button>
      </div>

      <div className="space-y-4">
        {educations.map((edu) => (
          <div key={edu.id} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">{edu.school}</h3>
                <p className="text-primary-400 mb-2">{edu.degree} · {edu.field}</p>
                <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                  <Edit className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
