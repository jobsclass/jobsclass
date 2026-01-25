'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Briefcase, X } from 'lucide-react'

interface Experience {
  id: string
  company: string
  position: string
  start_date: string
  end_date: string | null
  is_current: boolean
  description?: string
}

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  })

  useEffect(() => {
    loadExperiences()
  }, [])

  const loadExperiences = async () => {
    try {
      const response = await fetch('/api/profile/experiences')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setExperiences(data.experiences || [])
    } catch (error) {
      console.error('Error loading experiences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    setFormData({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    })
    setShowModal(true)
  }

  const handleEdit = (exp: Experience) => {
    setEditingId(exp.id)
    setFormData({
      company: exp.company,
      position: exp.position,
      startDate: exp.start_date,
      endDate: exp.end_date || '',
      isCurrent: exp.is_current,
      description: exp.description || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 경력을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/profile/experiences?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      loadExperiences()
    } catch (error) {
      console.error('Error deleting experience:', error)
      alert('경력 삭제에 실패했습니다')
    }
  }

  const handleSave = async () => {
    try {
      const url = '/api/profile/experiences'
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...formData } : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('Failed to save')

      setShowModal(false)
      loadExperiences()
    } catch (error) {
      console.error('Error saving experience:', error)
      alert('경력 저장에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">경력 사항</h1>
          <p className="text-gray-400">경력을 추가하고 관리하세요</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-purple-500 transition-all"
        >
          <Plus className="w-5 h-5" />
          경력 추가
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-16 text-center">
          <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">등록된 경력이 없습니다</h3>
          <p className="text-gray-400 mb-6">첫 경력을 추가하세요</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            경력 추가하기
          </button>
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
                    {exp.start_date} - {exp.is_current ? '현재' : exp.end_date}
                  </p>
                  {exp.description && (
                    <p className="text-gray-400 mt-3">{exp.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingId ? '경력 수정' : '경력 추가'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">회사명 *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">직책 *</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">시작일 *</label>
                  <input
                    type="month"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">종료일</label>
                  <input
                    type="month"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.isCurrent}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={formData.isCurrent}
                  onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isCurrent" className="text-sm text-gray-300">현재 재직 중</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">업무 내용</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
