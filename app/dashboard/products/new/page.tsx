'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'

const problemCategories = [
  { value: 'revenue', label: '💰 수익 창출', description: '돈을 더 벌고 싶어요' },
  { value: 'growth', label: '📈 비즈니스 성장', description: '사업을 확장하고 싶어요' },
  { value: 'time', label: '⏰ 시간 자유', description: '시간을 효율적으로 쓰고 싶어요' },
  { value: 'skills', label: '🎯 기술 습득', description: '새로운 기술을 배우고 싶어요' },
  { value: 'marketing', label: '📢 마케팅', description: '고객을 찾고 싶어요' },
  { value: 'brand', label: '✨ 브랜딩', description: '브랜드를 만들고 싶어요' },
  { value: 'productivity', label: '⚡ 생산성', description: '업무 효율을 높이고 싶어요' },
  { value: 'career', label: '🚀 커리어 전환', description: '새로운 커리어를 시작하고 싶어요' },
]

const solutionTypes = [
  { value: 'online_course', label: '🎓 온라인 강의', description: '동영상 강의 콘텐츠' },
  { value: 'ebook', label: '📚 전자책', description: 'PDF/전자책 형태' },
  { value: 'consulting', label: '💼 컨설팅', description: '1:1 전문 상담' },
  { value: 'coaching', label: '🎯 코칭', description: '지속적인 코칭 프로그램' },
  { value: 'template', label: '📋 템플릿', description: '바로 사용 가능한 템플릿' },
  { value: 'tool', label: '🛠️ 도구/툴', description: '소프트웨어/도구' },
  { value: 'community', label: '👥 커뮤니티', description: '멤버십/커뮤니티 접근' },
  { value: 'workshop', label: '🎪 워크샵', description: '오프라인/온라인 워크샵' },
]

export default function NewProductPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    targetCustomer: '',
    problemCategory: '',
    solutionTypes: [] as string[],
    problemDescription: '',
    solutionProcess: '',
    expectedResults: '',
    price: '',
    originalPrice: '',
    features: [''],
    thumbnail: null as File | null,
  })

  const [currentStep, setCurrentStep] = useState(1)
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

  const toggleSolutionType = (value: string) => {
    setFormData(prev => ({
      ...prev,
      solutionTypes: prev.solutionTypes.includes(value)
        ? prev.solutionTypes.filter(v => v !== value)
        : [...prev.solutionTypes, value]
    }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API 연동
    console.log('Form submitted:', formData)
    router.push('/dashboard/products')
  }

  const steps = [
    { number: 1, title: '문제 정의', description: '어떤 문제를 해결하나요?' },
    { number: 2, title: '솔루션', description: '어떻게 해결하나요?' },
    { number: 3, title: '상품 정보', description: '상품 세부 내용' },
    { number: 4, title: '가격 및 특징', description: '판매 정보 설정' },
  ]

  return (
    <div className="min-h-screen pb-20">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          상품 목록으로
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">새 상품 등록</h1>
        <p className="text-gray-400">고객의 문제를 해결하는 상품을 등록하세요</p>
      </div>

      {/* 진행 단계 */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-4xl">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep >= step.number
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {step.number}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-white' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-4 rounded ${currentStep > step.number ? 'bg-primary-600' : 'bg-gray-800'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: 문제 정의 */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">어떤 문제를 해결하나요?</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    문제 카테고리 선택
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {problemCategories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => handleInputChange('problemCategory', category.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.problemCategory === category.value
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                        }`}
                      >
                        <div className="text-lg font-semibold text-white mb-1">{category.label}</div>
                        <div className="text-sm text-gray-400">{category.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    타겟 고객
                  </label>
                  <input
                    type="text"
                    placeholder="예: 1인 사업자, 프리랜서, 스타트업 창업가"
                    value={formData.targetCustomer}
                    onChange={(e) => handleInputChange('targetCustomer', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    문제 상세 설명
                  </label>
                  <textarea
                    rows={4}
                    placeholder="고객이 겪고 있는 구체적인 문제를 설명하세요"
                    value={formData.problemDescription}
                    onChange={(e) => handleInputChange('problemDescription', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all"
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 솔루션 */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">어떻게 해결하나요?</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    솔루션 형태 (다중 선택 가능)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {solutionTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => toggleSolutionType(type.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.solutionTypes.includes(type.value)
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                        }`}
                      >
                        <div className="text-lg font-semibold text-white mb-1">{type.label}</div>
                        <div className="text-sm text-gray-400">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    해결 과정
                  </label>
                  <textarea
                    rows={4}
                    placeholder="이 상품이 어떻게 문제를 해결하는지 단계별로 설명하세요"
                    value={formData.solutionProcess}
                    onChange={(e) => handleInputChange('solutionProcess', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    기대 결과
                  </label>
                  <textarea
                    rows={4}
                    placeholder="고객이 이 상품을 구매하면 어떤 결과를 얻을 수 있나요?"
                    value={formData.expectedResults}
                    onChange={(e) => handleInputChange('expectedResults', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
              >
                이전
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all"
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 상품 정보 */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">상품 세부 정보</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    상품명
                  </label>
                  <input
                    type="text"
                    placeholder="예: SNS 마케팅 완전정복 강의"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL 슬러그
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">/products/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    상품 설명
                  </label>
                  <textarea
                    rows={4}
                    placeholder="상품에 대한 상세한 설명을 입력하세요"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    썸네일 이미지
                  </label>
                  <FileUpload
                    description="클릭하여 이미지 업로드"
                    accept="image/*"
                    maxSize={5}
                    value={thumbnailPreview}
                    onChange={(file, preview) => {
                      handleInputChange('thumbnail', file)
                      if (preview) setThumbnailPreview(preview)
                    }}
                    preview={true}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
              >
                이전
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all"
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 가격 및 특징 */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">가격 및 특징</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      판매 가격 (원)
                    </label>
                    <input
                      type="number"
                      placeholder="99000"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      정가 (선택)
                    </label>
                    <input
                      type="number"
                      placeholder="150000"
                      value={formData.originalPrice}
                      onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    주요 특징 및 포함 내용
                  </label>
                  <div className="space-y-3">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder={`특징 ${index + 1}`}
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
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
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
              >
                이전
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-green-500/20 transition-all"
              >
                상품 등록 완료
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
