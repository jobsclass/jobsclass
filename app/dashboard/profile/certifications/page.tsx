'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Award } from 'lucide-react'

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState([
    { id: 1, title: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', issuedDate: '2023-06' },
    { id: 2, title: '정보처리기사', issuer: '한국산업인력공단', issuedDate: '2019-11' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">자격증 및 수상</h1>
          <p className="text-gray-400">자격증과 수상 이력을 관리하세요</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20">
          <Plus className="w-5 h-5" />
          자격증 추가
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {certifications.map((cert) => (
          <div key={cert.id} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
            <div className="flex items-start justify-between mb-4">
              <Award className="w-8 h-8 text-primary-400" />
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{cert.title}</h3>
            <p className="text-sm text-gray-400 mb-1">{cert.issuer}</p>
            <p className="text-xs text-gray-500">발급일: {cert.issuedDate}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
