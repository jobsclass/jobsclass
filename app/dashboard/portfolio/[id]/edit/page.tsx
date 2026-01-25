'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'

export default function EditPortfolioPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    client: '',
    projectDate: '',
    projectDuration: '',
    projectUrl: '',
    technologies: [''],
    category: '',
  })
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')

  useEffect(() => {
    if (itemId) loadItem()
  }, [itemId])

  const loadItem = async () => {
    try {
      const response = await fetch(`/api/portfolio/edit?id=${itemId}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      
      if (data.item) {
        setFormData({
          title: data.item.title || '',
          slug: data.item.slug || '',
          description: data.item.description || '',
          client: data.item.client || '',
          projectDate: data.item.project_date || '',
          projectDuration: data.item.project_duration || '',
          projectUrl: data.item.project_url || '',
          technologies: data.item.technologies || [''],
          category: data.item.category || '',
        })
        if (data.item.thumbnail_url) {
          setThumbnailPreview(data.item.thumbnail_url)
        }
      }
    } catch (error) {
      console.error('Error loading item:', error)
      alert('포트폴리오를 불러오는데 실패했습니다')
      router.push('/dashboard/portfolio')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    if (field === 'title') {
      newData.slug = value.toLowerCase().replace(/[^a-z0-9가-힣\s-]/g, '').replace(/\s+/g, '-')
    }
    setFormData(newData)
  }

  const addTechnology = () => {
    setFormData(prev => ({ ...prev, technologies: [...prev.technologies, ''] }))
  }

  const updateTechnology = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.map((t, i) => i === index ? value : t)
    }))
  }

  const removeTechnology = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/portfolio/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: itemId,
          ...formData,
          isPublished: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '저장 실패')
      }

      alert('포트폴리오가 성공적으로 수정되었습니다!')
      router.push('/dashboard/portfolio')
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || '포트폴리오 수정에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="text-gray-400">로딩 중...</div></div>
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="mb-8">
        <Link href="/dashboard/portfolio" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          포트폴리오 목록으로
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">포트폴리오 수정</h1>
        <p className="text-gray-400">프로젝트 정보를 수정하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">프로젝트 제목</label>
            <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="예: 스타트업 브랜딩 프로젝트" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">프로젝트 설명</label>
            <textarea rows={5} value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="프로젝트에 대한 상세 설명" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none" required />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">클라이언트</label>
              <input type="text" value={formData.client} onChange={(e) => handleInputChange('client', e.target.value)} placeholder="예: ABC 스타트업" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">프로젝트 기간</label>
              <input type="text" value={formData.projectDuration} onChange={(e) => handleInputChange('projectDuration', e.target.value)} placeholder="예: 3개월" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">사용 기술</label>
            <div className="space-y-3">
              {formData.technologies.map((tech, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input type="text" placeholder={`기술 ${index + 1}`} value={tech} onChange={(e) => updateTechnology(index, e.target.value)} className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500" />
                  {formData.technologies.length > 1 && (
                    <button type="button" onClick={() => removeTechnology(index)} className="p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addTechnology} className="flex items-center gap-2 px-4 py-2 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors text-sm">
                <Plus className="w-4 h-4" />
                기술 추가
              </button>
            </div>
          </div>

          <FileUpload label="프로젝트 이미지" description="클릭하여 이미지 업로드 (권장 크기: 1200x800px)" accept="image/*" maxSize={5} value={thumbnailPreview} onChange={(file, preview) => { if (preview) setThumbnailPreview(preview) }} preview={true} />
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors">취소</button>
          <button type="submit" disabled={saving} className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50">
            {saving ? '수정 중...' : '수정 완료'}
          </button>
        </div>
      </form>
    </div>
  )
}
