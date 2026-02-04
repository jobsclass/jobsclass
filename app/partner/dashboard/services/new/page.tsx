'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { 
  getAllServiceTypes, 
  getAllCategories,
  type JobsClassServiceType,
  type JobsClassCategory 
} from '@/lib/constants/jobsclass'

export default function NewServicePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Step 1: 서비스 타입
    service_type: '' as JobsClassServiceType | '',
    
    // Step 2: 카테고리
    category: '' as JobsClassCategory | '',
    subcategory: '',
    
    // Step 3: 기본 정보
    title: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    
    // Step 4: 가격 정보
    price: '',
    original_price: '',
    
    // Step 5: 상세 정보
    features: ['', '', ''],
    requirements: [''],
    deliverables: [''],
    
    // 타입별 추가 필드
    duration_hours: '', // coaching
    duration_days: '',  // course, consulting, service, community
    curriculum: '',     // course
    
    // 상태
    is_active: true,
    is_published: false,
  })

  const serviceTypes = getAllServiceTypes()
  const categories = getAllCategories()

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

  const updateArrayField = (field: keyof typeof formData, index: number, value: string) => {
    const currentArray = formData[field] as string[]
    const newArray = [...currentArray]
    newArray[index] = value
    setFormData(prev => ({ ...prev, [field]: newArray }))
  }

  const addArrayField = (field: keyof typeof formData) => {
    const currentArray = formData[field] as string[]
    setFormData(prev => ({ ...prev, [field]: [...currentArray, ''] }))
  }

  const removeArrayField = (field: keyof typeof formData, index: number) => {
    const currentArray = formData[field] as string[]
    setFormData(prev => ({ 
      ...prev, 
      [field]: currentArray.filter((_, i) => i !== index) 
    }))
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    // 유효성 검사
    if (!formData.title || !formData.service_type || !formData.category || !formData.price) {
      alert('필수 항목을 모두 입력해주세요')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/services/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('서비스 등록 실패')

      const data = await response.json()
      alert('서비스가 등록되었습니다!')
      router.push('/partner/dashboard/services')
    } catch (error) {
      console.error('Error:', error)
      alert('서비스 등록에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canGoNext = () => {
    if (currentStep === 0) return !!formData.service_type
    if (currentStep === 1) return !!formData.category
    if (currentStep === 2) return !!formData.title && !!formData.description
    if (currentStep === 3) return !!formData.price
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/partner/dashboard/services"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>뒤로가기</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">새 서비스 등록</h1>
            <p className="text-gray-400 mt-1">단계별로 서비스 정보를 입력하세요</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {['서비스 타입', '카테고리', '기본 정보', '가격', '상세 정보'].map((label, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep === index 
                    ? 'bg-primary-600 text-white' 
                    : currentStep > index
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {currentStep > index ? '✓' : index + 1}
                </div>
                {index < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > index ? 'bg-green-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm">
            {['서비스 타입', '카테고리', '기본 정보', '가격', '상세 정보'][currentStep]}
          </p>
        </div>

        {/* Form Content */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-8">
          {/* Step 0: 서비스 타입 선택 */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">어떤 유형의 서비스인가요?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleInputChange('service_type', type.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      formData.service_type === type.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                    }`}
                  >
                    <div className="text-4xl mb-3">{type.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{type.name}</h3>
                    <p className="text-gray-400 text-sm">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: 카테고리 선택 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">카테고리를 선택하세요</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleInputChange('category', cat.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      formData.category === cat.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                    }`}
                  >
                    <div className="text-3xl mb-3">{cat.emoji}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{cat.name}</h3>
                    <p className="text-gray-400 text-sm">{cat.description}</p>
                  </button>
                ))}
              </div>

              {/* 세부 카테고리 */}
              {formData.category && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    세부 카테고리 (선택)
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="">선택하지 않음</option>
                    {categories.find(c => c.id === formData.category)?.subcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 2: 기본 정보 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">기본 정보를 입력하세요</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  서비스명 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="예: React 완전 정복 강의"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL 슬러그 (자동 생성)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  jobsclass.kr/services/{formData.slug || '...'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  서비스 설명 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="서비스에 대해 자세히 설명해주세요..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: 가격 정보 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">가격을 설정하세요</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    판매 가격 * (원)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="99000"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    정가 (선택)
                  </label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => handleInputChange('original_price', e.target.value)}
                    placeholder="150000"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">할인율 표시에 사용됩니다</p>
                </div>
              </div>

              {formData.price && (
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">클라이언트 결제 금액</span>
                    <span className="text-white font-bold">{parseInt(formData.price).toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-300">플랫폼 수수료 (10%)</span>
                    <span className="text-red-400">-{Math.round(parseInt(formData.price) * 0.1).toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-bold mt-3 pt-3 border-t border-primary-500/20">
                    <span className="text-white">파트너 정산 금액 (90%)</span>
                    <span className="text-green-400">{Math.round(parseInt(formData.price) * 0.9).toLocaleString()}원</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: 상세 정보 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">상세 정보를 입력하세요</h2>
              
              {/* 특징 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  주요 특징
                </label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateArrayField('features', index, e.target.value)}
                      placeholder={`특징 ${index + 1}`}
                      className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                    {formData.features.length > 1 && (
                      <button
                        onClick={() => removeArrayField('features', index)}
                        className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayField('features')}
                  className="mt-2 px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-lg transition-colors text-sm"
                >
                  + 특징 추가
                </button>
              </div>

              {/* 타입별 추가 필드 */}
              {(formData.service_type === 'coaching') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    진행 시간 (시간)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                    placeholder="2"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
              )}

              {(formData.service_type === 'online-course' || formData.service_type === 'community') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    진행 기간 (일)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => handleInputChange('duration_days', e.target.value)}
                    placeholder="30"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canGoNext()}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    등록 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    서비스 등록
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
