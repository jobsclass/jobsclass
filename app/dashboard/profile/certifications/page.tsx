'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Award, X } from 'lucide-react'

interface Certification {
  id: string
  name: string
  issuer: string
  issued_date: string
  expiry_date: string | null
  credential_id?: string
  credential_url?: string
}

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issuedDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  })

  useEffect(() => {
    loadCertifications()
  }, [])

  const loadCertifications = async () => {
    try {
      const response = await fetch('/api/profile/certifications')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setCertifications(data.certifications || [])
    } catch (error) {
      console.error('Error loading certifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    setFormData({ name: '', issuer: '', issuedDate: '', expiryDate: '', credentialId: '', credentialUrl: '' })
    setShowModal(true)
  }

  const handleEdit = (cert: Certification) => {
    setEditingId(cert.id)
    setFormData({
      name: cert.name,
      issuer: cert.issuer,
      issuedDate: cert.issued_date,
      expiryDate: cert.expiry_date || '',
      credentialId: cert.credential_id || '',
      credentialUrl: cert.credential_url || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 자격증을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/profile/certifications?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      loadCertifications()
    } catch (error) {
      console.error('Error deleting certification:', error)
      alert('자격증 삭제에 실패했습니다')
    }
  }

  const handleSave = async () => {
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...formData } : formData

      const response = await fetch('/api/profile/certifications', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('Failed to save')
      setShowModal(false)
      loadCertifications()
    } catch (error) {
      console.error('Error saving certification:', error)
      alert('자격증 저장에 실패했습니다')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="text-gray-400">로딩 중...</div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">자격증</h1>
          <p className="text-gray-400">자격증을 추가하고 관리하세요</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-purple-500 transition-all">
          <Plus className="w-5 h-5" />
          자격증 추가
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-16 text-center">
          <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">등록된 자격증이 없습니다</h3>
          <p className="text-gray-400 mb-6">첫 자격증을 추가하세요</p>
          <button onClick={handleAdd} className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors">
            <Plus className="w-5 h-5" />
            자격증 추가하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((cert) => (
            <div key={cert.id} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{cert.name}</h3>
                  <p className="text-primary-400 mb-2">{cert.issuer}</p>
                  <p className="text-sm text-gray-500">발급일: {cert.issued_date}</p>
                  {cert.expiry_date && <p className="text-sm text-gray-500">만료일: {cert.expiry_date}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(cert)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(cert.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {cert.credential_url && (
                <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-400 hover:text-primary-300">인증서 보기 →</a>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{editingId ? '자격증 수정' : '자격증 추가'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">자격증명 *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">발급 기관 *</label>
                <input type="text" value={formData.issuer} onChange={(e) => setFormData({ ...formData, issuer: e.target.value })} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">발급일 *</label>
                  <input type="month" value={formData.issuedDate} onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">만료일</label>
                  <input type="month" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">자격증 번호</label>
                <input type="text" value={formData.credentialId} onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">인증서 URL</label>
                <input type="url" value={formData.credentialUrl} onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500" />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors">취소</button>
                <button onClick={handleSave} className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all">저장</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
