'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'

const SERVICE_CATEGORIES = [
  { value: '온라인 강의', label: '💻 온라인 강의', description: '온라인 교육 콘텐츠' },
  { value: '오프라인 강의/강연', label: '📚 오프라인 강의/강연', description: '대면 강의 및 세미나' },
  { value: '1:1 코칭/멘토링', label: '🎯 1:1 코칭/멘토링', description: '개인 맞춤 코칭' },
  { value: '부트캠프/그룹 프로그램', label: '🏃 부트캠프/그룹 프로그램', description: '집중 교육 프로그램' },
  { value: '컨설팅', label: '💼 컨설팅', description: '전문 컨설팅 서비스' },
  { value: '개발 대행', label: '🛠️ 개발 대행', description: '개발 프로젝트 대행' },
  { value: '마케팅 대행', label: '📊 마케팅 대행', description: '마케팅 서비스' },
  { value: '디자인 대행', label: '🎨 디자인 대행', description: '디자인 작업 대행' },
  { value: '콘텐츠 제작', label: '📝 콘텐츠 제작', description: '콘텐츠 제작 서비스' },
  { value: '전자책/가이드', label: '📖 전자책/가이드', description: '디지털 출판물' },
  { value: '디지털 상품', label: '📦 디지털 상품', description: '템플릿, 툴킷 등' },
  { value: '기타 서비스', label: '🔧 기타 서비스', description: '기타 지식 서비스' },
]

export default function EditServicePage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    slug: '',
    description: '',
    thumbnail: null as File | null,
    targetCustomer: '',
    problemDescription: '',
    solutionProcess: '',
    expectedResults: '',
    price: '',
    originalPrice: '',
    currency: 'KRW',
    features: [''],
    isPublished: false,
  })

  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')

  useEffect(() => {
    if (serviceId) {
      loadService()
    }
  }, [serviceId])

  const loadService = async () => {
    try {
      const response = await fetch(`/api/services/edit?id=${serviceId}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      
      if (data.service) {
        setFormData({
          category: data.service.service_category || '',
          title: data.service.title || '',
          slug: data.service.slug || '',
          description: data.service.description || '',
          thumbnail: null,
          targetCustomer: data.service.target_customer || '',
          problemDescription: data.service.problem_description || '',
          solutionProcess: data.service.solution_process || '',
          expectedResults: data.service.expected_results || '',
          price: data.service.price?.toString() || '',
          originalPrice: data.service.original_price?.toString() || '',
          currency: data.service.currency || 'KRW',
          features: data.service.features || [''],
          isPublished: data.service.is_published || false,
        })
        if (data.service.thumbnail_url) {
          setThumbnailPreview(data.service.thumbnail_url)
        }
        setCurrentStep(2) // 카테고리는 이미 선택됨
      }
    } catch (error) {
      console.error('Error loading service:', error)
      alert('서비스를 불러오는데 실패했습니다')
      router.push('/dashboard/services')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    
    if (field === 'title') {
      newData.slug = value
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
    }
    
    setFormData(newData)
  }

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }))
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/services/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: serviceId,
          service_category: formData.category,
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          target_customer: formData.targetCustomer,
          problem_description: formData.problemDescription,
          solution_process: formData.solutionProcess,
          expected_results: formData.expectedResults,
          price: parseFloat(formData.price),
          original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          currency: formData.currency,
          features: formData.features.filter(f => f.trim()),
          is_published: publish,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '저장 실패')
      }

      alert('서비스가 성공적으로 수정되었습니다!')
      router.push('/dashboard/services')
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || '서비스 수정에 실패했습니다')
    } finally {
      setSaving(false)
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
    <div className="min-h-screen pb-20">
      <div className="mb-8">
        <Link href="/dashboard/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          서비스 목록으로
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">서비스 수정</h1>
        <p className="text-gray-400">서비스 정보를 수정하세요</p>
      </div>

      <form className="space-y-6">
        {/* 서비스 정보 */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">카테고리</label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">선택하세요</option>
              {SERVICE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">서비스명 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="예: SNS 마케팅 완전 정복 강의"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL 슬러그 *</label>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">/services/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">서비스 설명 *</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="서비스에 대한 간단한 설명"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
              required
            />
          </div>

          <FileUpload
            label="썸네일 이미지"
            description="클릭하여 이미지 업로드 (권장 크기: 1200x630px)"
            accept="image/*"
            maxSize={5}
            value={thumbnailPreview}
            onChange={(file: File | null, preview?: string) => {
              handleInputChange('thumbnail', file)
              if (preview) setThumbnailPreview(preview)
            }}
            preview={true}
          />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">가격 (원) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="99000"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">정가 (할인 표시용)</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                placeholder="150000"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">포함 사항</label>
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder={`특징 ${index + 1}`}
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 px-4 py-2 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                특징 추가
              </button>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard/services"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
          >
            취소
          </Link>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={saving}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '임시 저장'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50"
          >
            {saving ? '수정 중...' : '수정 완료'}
          </button>
        </div>
      </form>
    </div>
  )
}
