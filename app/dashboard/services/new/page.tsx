'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Sparkles } from 'lucide-react'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'

// 🎓 지식 서비스 카테고리 (직관적으로!)
const serviceCategories = [
  { value: 'online_course', label: '💻 온라인 강의', description: '동영상 강의 콘텐츠' },
  { value: 'offline_course', label: '📚 오프라인 강의/강연', description: '대면 강의 및 강연' },
  { value: 'coaching', label: '🎯 1:1 코칭/멘토링', description: '개인 맞춤 코칭' },
  { value: 'bootcamp', label: '🏃 부트캠프/그룹 프로그램', description: '집중 트레이닝' },
  { value: 'consulting', label: '💼 컨설팅', description: '전문가 상담 서비스' },
  { value: 'development', label: '🛠️ 개발 대행', description: '웹/앱 개발 서비스' },
  { value: 'marketing', label: '📊 마케팅 대행', description: 'SNS/광고 마케팅' },
  { value: 'design', label: '🎨 디자인 대행', description: '브랜드/그래픽 디자인' },
  { value: 'content', label: '📝 콘텐츠 제작', description: '영상/글 콘텐츠' },
  { value: 'ebook', label: '📖 전자책/가이드', description: 'PDF/전자책 형태' },
  { value: 'digital_product', label: '📦 디지털 상품', description: '템플릿, 툴킷 등' },
  { value: 'other', label: '🔧 기타 서비스', description: '기타 지식 서비스' },
]

export default function NewServicePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: 서비스 카테고리
    category: '',
    
    // Step 2: 서비스 정보 + 가격
    title: '',
    slug: '',
    description: '',
    thumbnail: null as File | null,
    
    // 상세 설명
    targetCustomer: '',
    problemDescription: '',
    solutionProcess: '',
    expectedResults: '',
    
    // 가격 정보
    price: '',
    originalPrice: '',
    currency: 'KRW',
    
    // 특징
    features: [''],
    
    // 공개 설정
    isPublished: false,
  })

  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isGeneratingPrice, setIsGeneratingPrice] = useState(false)

  const handleAIGenerate = async () => {
    if (!formData.title) {
      alert('서비스명을 먼저 입력해주세요')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'service',
          prompt: `서비스명: ${formData.title}\n카테고리: ${formData.category}\n\n이 서비스에 대한 매력적인 설명을 작성해주세요.`,
        }),
      })

      if (!response.ok) throw new Error('AI 생성 실패')

      const data = await response.json()
      handleInputChange('description', data.text)
      alert('AI가 설명을 생성했습니다!')
    } catch (error) {
      console.error('AI generation error:', error)
      alert('AI 생성에 실패했습니다')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAIImageGenerate = async () => {
    if (!formData.title) {
      alert('서비스명을 먼저 입력해주세요')
      return
    }

    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${formData.title} - ${formData.description || '전문 서비스'}`,
          type: 'service'
        }),
      })

      if (!response.ok) throw new Error('AI 이미지 생성 실패')

      const data = await response.json()
      setThumbnailPreview(data.imageUrl)
      alert('AI가 썸네일을 생성했습니다! (임시 URL이므로 저장 후 업로드됩니다)')
    } catch (error) {
      console.error('AI image generation error:', error)
      alert('AI 이미지 생성에 실패했습니다')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleAIPriceSuggest = async () => {
    if (!formData.title || !formData.category) {
      alert('서비스명과 카테고리를 먼저 입력해주세요')
      return
    }

    setIsGeneratingPrice(true)
    try {
      const response = await fetch('/api/ai/suggest-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTitle: formData.title,
          category: formData.category,
          description: formData.description
        }),
      })

      if (!response.ok) throw new Error('AI 가격 추천 실패')

      const data = await response.json()
      const pricing = data.pricing
      
      handleInputChange('price', pricing.recommendedPrice.toString())
      handleInputChange('originalPrice', pricing.priceRange.max.toString())
      
      alert(`AI 추천 가격: ${pricing.recommendedPrice.toLocaleString()}원\n\n근거: ${pricing.reasoning}\n\n가격 범위: ${pricing.priceRange.min.toLocaleString()}원 ~ ${pricing.priceRange.max.toLocaleString()}원`)
    } catch (error) {
      console.error('AI price suggestion error:', error)
      alert('AI 가격 추천에 실패했습니다')
    } finally {
      setIsGeneratingPrice(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 썸네일 업로드 (Supabase Storage)
      let thumbnailUrl = ''
      if (formData.thumbnail) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', formData.thumbnail)
        
        // TODO: 실제 파일 업로드 구현
        // 지금은 임시로 빈 문자열
        thumbnailUrl = ''
      }

      // API 요청
      const response = await fetch('/api/services/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.category,
          serviceCategory: formData.category,
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          thumbnail: thumbnailUrl,
          targetCustomer: formData.targetCustomer,
          problemDescription: formData.problemDescription,
          solutionProcess: formData.solutionProcess,
          expectedResults: formData.expectedResults,
          price: formData.price,
          originalPrice: formData.originalPrice,
          currency: formData.currency,
          features: formData.features.filter(f => f.trim()),
          isPublished: formData.isPublished,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create service')
      }

      // 성공
      alert('✅ 서비스가 성공적으로 등록되었습니다!')
      router.push('/dashboard/services')
    } catch (error: any) {
      console.error('Submit error:', error)
      alert('❌ 오류: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/services"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">새 서비스 등록</h1>
            <p className="text-gray-400 mt-1">판매할 지식 서비스를 등록하세요</p>
          </div>
        </div>
      </div>

      {/* 진행 단계 */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center gap-4">
          <div className={`flex-1 flex items-center gap-3 ${currentStep >= 1 ? 'text-primary-400' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-800'
            }`}>
              1
            </div>
            <span className="font-medium">서비스 선택</span>
          </div>
          <div className={`h-px flex-1 ${currentStep >= 2 ? 'bg-primary-500' : 'bg-gray-800'}`} />
          <div className={`flex-1 flex items-center gap-3 ${currentStep >= 2 ? 'text-primary-400' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-800'
            }`}>
              2
            </div>
            <span className="font-medium">정보 입력</span>
          </div>
        </div>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: 서비스 카테고리 선택 */}
        {currentStep === 1 && (
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">어떤 서비스를 제공할 건가요?</h2>
              <p className="text-gray-400">가장 적합한 서비스 유형을 선택하세요</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleInputChange('category', category.value)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.category === category.value
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-gray-800 hover:border-gray-700 bg-gray-800/30'
                  }`}
                >
                  <div className="text-2xl mb-2">{category.label.split(' ')[0]}</div>
                  <h3 className={`font-bold mb-1 ${
                    formData.category === category.value ? 'text-primary-400' : 'text-white'
                  }`}>
                    {category.label.split(' ').slice(1).join(' ')}
                  </h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!formData.category}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl font-medium transition-colors"
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 서비스 정보 + 가격 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 space-y-6">
              <h2 className="text-xl font-bold text-white">서비스 기본 정보</h2>

              {/* 서비스명 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  서비스명 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="예: SNS 마케팅 완전정복 온라인 강의"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              {/* URL 슬러그 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL 슬러그
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">corefy.co/yourname/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* 간단 설명 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    간단 설명 *
                  </label>
                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !formData.title}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 text-white text-sm rounded-lg font-medium transition-all"
                  >
                    <span>✨</span>
                    {isGenerating ? 'AI 생성 중...' : 'AI로 작성'}
                  </button>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  placeholder="고객이 볼 수 있는 서비스 요약 (1-2줄)"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                  required
                />
              </div>

              {/* 썸네일 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    썸네일 이미지
                  </label>
                  <button
                    type="button"
                    onClick={handleAIImageGenerate}
                    disabled={isGeneratingImage || !formData.title}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 text-white text-sm rounded-lg font-medium transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingImage ? 'AI 생성 중...' : 'AI 이미지 생성'}
                  </button>
                </div>
                <FileUpload
                  onChange={(file: File | null, previewUrl?: string) => {
                    handleInputChange('thumbnail', file)
                    if (previewUrl) {
                      setThumbnailPreview(previewUrl)
                    }
                  }}
                  accept="image/*"
                  maxSize={5}
                  value={thumbnailPreview}
                  preview={true}
                />
              </div>
            </div>

            {/* 상세 설명 */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 space-y-6">
              <h2 className="text-xl font-bold text-white">상세 설명</h2>

              {/* 타겟 고객 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  누구를 위한 서비스인가요?
                </label>
                <input
                  type="text"
                  value={formData.targetCustomer}
                  onChange={(e) => handleInputChange('targetCustomer', e.target.value)}
                  placeholder="예: SNS 마케팅을 시작하려는 소상공인"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* 어떤 문제를 해결하나요? */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  어떤 문제를 해결하나요?
                </label>
                <textarea
                  value={formData.problemDescription}
                  onChange={(e) => handleInputChange('problemDescription', e.target.value)}
                  rows={3}
                  placeholder="고객이 겪고 있는 문제를 구체적으로 설명하세요"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              {/* 어떻게 해결하나요? */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  어떻게 해결하나요?
                </label>
                <textarea
                  value={formData.solutionProcess}
                  onChange={(e) => handleInputChange('solutionProcess', e.target.value)}
                  rows={3}
                  placeholder="이 서비스로 문제를 해결하는 과정을 설명하세요"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              {/* 기대 효과 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  어떤 결과를 기대할 수 있나요?
                </label>
                <textarea
                  value={formData.expectedResults}
                  onChange={(e) => handleInputChange('expectedResults', e.target.value)}
                  rows={3}
                  placeholder="이 서비스를 통해 얻을 수 있는 결과를 설명하세요"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">가격 정보</h2>
                <button
                  type="button"
                  onClick={handleAIPriceSuggest}
                  disabled={isGeneratingPrice || !formData.title || !formData.category}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-700 disabled:to-gray-700 text-white text-sm rounded-lg font-medium transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGeneratingPrice ? 'AI 분석 중...' : 'AI 가격 추천'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* 판매 가격 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    판매 가격 *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="99000"
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                      required
                    />
                    <span className="text-gray-400">원</span>
                  </div>
                </div>

                {/* 정가 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    정가 (선택)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                      placeholder="149000"
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                    <span className="text-gray-400">원</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">할인율을 표시하려면 정가를 입력하세요</p>
                </div>
              </div>
            </div>

            {/* 특징 */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">서비스 특징</h2>
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  특징 추가
                </button>
              </div>

              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="예: 평생 수강 가능"
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center justify-between bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl font-medium transition-colors"
              >
                이전 단계
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    handleInputChange('isPublished', false)
                    handleSubmit(e as any)
                  }}
                >
                  임시 저장
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                  onClick={(e) => {
                    handleInputChange('isPublished', true)
                  }}
                >
                  {isSubmitting ? '등록 중...' : '서비스 등록'}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
