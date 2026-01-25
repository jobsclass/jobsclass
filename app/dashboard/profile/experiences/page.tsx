'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState([
    { id: 1, company: '테크 스타트업', position: '시니어 개발자', startDate: '2022-01', endDate: '2024-01', isCurrent: false },
    { id: 2, company: '디자인 에이전시', position: '프론트엔드 개발자', startDate: '2020-03', endDate: '2022-01', isCurrent: false },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">경력 사항</h1>
          <p className="text-gray-400">경력을 추가하고 관리하세요</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-purple-500 transition-all">
          <Plus className="w-5 h-5" />
          경력 추가
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-16 text-center">
          <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">등록된 경력이 없습니다</h3>
          <p className="text-gray-400">첫 경력을 추가하세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{exp.position}</h3>
                  <p className="text-primary-400 mb-2">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} - {exp.isCurrent ? '현재' : exp.endDate}
                  </p>
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
      )}
    </div>
  )
}
