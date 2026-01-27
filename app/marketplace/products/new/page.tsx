'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

const SERVICE_TYPES = [
  { value: 'online_course', label: '온라인 강의', icon: '🎓', desc: '사전 녹화된 강의 콘텐츠' },
  { value: 'one_on_one_mentoring', label: '1:1 멘토링', icon: '👥', desc: '실시간 맞춤형 조언' },
  { value: 'group_coaching', label: '그룹 코칭', icon: '👨‍👩‍👧‍👦', desc: '소그룹 라이브 세션' },
  { value: 'digital_product', label: '디지털 콘텐츠', icon: '📄', desc: '전자책, 템플릿 등' },
  { value: 'project_service', label: '프로젝트 대행', icon: '🔧', desc: '작업 수행 및 납품' },
  { value: 'consulting', label: '컨설팅', icon: '💼', desc: '전문가 자문 및 전략' },
  { value: 'agency_service', label: '대행 서비스', icon: '📢', desc: 'SNS, 광고 운영 대행' },
  { value: 'premium_membership', label: '프리미엄 멤버십', icon: '⭐', desc: '정기 구독형 콘텐츠' },
  { value: 'live_workshop', label: '라이브 워크샵', icon: '🎯', desc: '단기 집중 실습' },
  { value: 'promotion_service', label: '홍보/마케팅 서비스', icon: '📣', desc: '인플루언서 협업' }
]

const CATEGORIES = [
  { value: 'development', label: '개발 & 기술', icon: '💻' },
  { value: 'design', label: '디자인 & 크리에이티브', icon: '🎨' },
  { value: 'marketing', label: '마케팅 & 세일즈', icon: '📢' },
  { value: 'business', label: '비즈니스 & 전략', icon: '📊' },
  { value: 'content', label: '콘텐츠 & 크리에이터', icon: '✍️' },
  { value: 'education', label: '교육 & 멘토링', icon: '📚' },
  { value: 'lifestyle', label: '라이프스타일 & 웰니스', icon: '🧘' },
  { value: 'writing', label: '크리에이티브 라이팅', icon: '✒️' }
]

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)

  // Form data
  const [serviceType, setServiceType] = useState('')
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pricingModel, setPricingModel] = useState<'fixed' | 'negotiable'>('fixed')
  const [price, setPrice] = useState<number>(0)
  const [priceRangeMin, setPriceRangeMin] = useState<number>(0)
  const [priceRangeMax, setPriceRangeMax] = useState<number>(0)

  const handleSubmit = async () => {
    // 유효성 검사
    if (!serviceType || !category || !title || !description) {
      alert('모든 필수 항목을 입력해주세요')
      return
    }

    if (pricingModel === 'fixed' && price <= 0) {
      alert('정액제는 가격을 입력해주세요')
      return
    }

    if (pricingModel === 'negotiable' && priceRangeMin <= 0) {
      alert('협의제는 최소 가격을 입력해주세요')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const insertData: any = {
        user_id: user.id,
        service_type: serviceType,
        title,
        description,
        pricing_model: pricingModel,
        is_published: true
      }

      if (pricingModel === 'fixed') {
        insertData.price = price
      } else {
        insertData.base_price = priceRangeMin
        insertData.price_range_min = priceRangeMin
        insertData.price_range_max = priceRangeMax || null
        insertData.consultation_required = true
        insertData.custom_quotation = true
      }

      const { error } = await supabase
        .from('products')
        .insert(insertData)

      if (error) throw error

      alert('서비스가 등록되었습니다! 🎉')
      router.push('/partner/dashboard')
    } catch (error: any) {
      console.error('서비스 등록 오류:', error)
      alert(error.message || '서비스 등록에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <button
          onClick={() => step === 1 ? router.back() : setStep((s) => (s - 1) as 1 | 2)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          뒤로 가기
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">서비스 등록</h1>
          <p className="text-gray-400">당신의 전문성을 서비스로 제공하세요</p>
        </div>

        {/* 진행 바 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">단계 {step}/3</span>
            <span className="text-sm text-primary-400 font-semibold">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: 서비스 타입 선택 */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">어떤 형태로 제공하시나요?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setServiceType(type.value)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    serviceType === type.value
                      ? 'bg-primary-500/20 border-primary-500'
                      : 'bg-white/5 border-white/10 hover:border-primary-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{type.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">{type.label}</h3>
                      <p className="text-sm text-gray-400">{type.desc}</p>
                    </div>
                    {serviceType === type.value && (
                      <CheckCircle className="w-6 h-6 text-primary-400 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!serviceType}
              className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음 단계
            </button>
          </div>
        )}

        {/* Step 2: 카테고리 선택 */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">어떤 분야인가요?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    category === cat.value
                      ? 'bg-primary-500/20 border-primary-500'
                      : 'bg-white/5 border-white/10 hover:border-primary-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cat.icon}</span>
                    <h3 className="font-bold text-white">{cat.label}</h3>
                    {category === cat.value && (
                      <CheckCircle className="w-6 h-6 text-primary-400 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(3)}
              disabled={!category}
              className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음 단계
            </button>
          </div>
        )}

        {/* Step 3: 상세 정보 */}
        {step === 3 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                서비스 제목 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 3주 완성 웹 개발 부트캠프"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                상세 설명 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="서비스에 대해 자세히 설명해주세요"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>

            {/* 가격 책정 모델 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                가격 책정 방식 <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setPricingModel('fixed')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    pricingModel === 'fixed'
                      ? 'bg-primary-500/20 border-primary-500'
                      : 'bg-white/5 border-white/10 hover:border-primary-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💰</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">정액제</h3>
                      <p className="text-xs text-gray-400">명확한 가격으로 즉시 구매 가능</p>
                      <p className="text-xs text-gray-500 mt-1">강의, 콘텐츠, 멤버십 등</p>
                    </div>
                    {pricingModel === 'fixed' && (
                      <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPricingModel('negotiable')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    pricingModel === 'negotiable'
                      ? 'bg-primary-500/20 border-primary-500'
                      : 'bg-white/5 border-white/10 hover:border-primary-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🤝</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">협의 후 결정</h3>
                      <p className="text-xs text-gray-400">견적서 제공 후 가격 협의</p>
                      <p className="text-xs text-gray-500 mt-1">프로젝트 대행, 컨설팅 등</p>
                    </div>
                    {pricingModel === 'negotiable' && (
                      <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* 정액제 가격 입력 */}
            {pricingModel === 'fixed' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  가격 <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="100000"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">원</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">구매자가 바로 결제할 수 있는 확정 가격입니다</p>
              </div>
            )}

            {/* 협의제 가격 범위 입력 */}
            {pricingModel === 'negotiable' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    시작 가격 (최소) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={priceRangeMin || ''}
                      onChange={(e) => setPriceRangeMin(Number(e.target.value))}
                      placeholder="3000000"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">원</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    최대 가격 (선택)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={priceRangeMax || ''}
                      onChange={(e) => setPriceRangeMax(Number(e.target.value))}
                      placeholder="10000000"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">원</span>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    💡 <strong>협의제 안내</strong>
                  </p>
                  <ul className="mt-2 text-xs text-gray-400 space-y-1">
                    <li>• 클라이언트가 견적을 요청하면 맞춤 견적서를 작성할 수 있습니다</li>
                    <li>• 프로젝트 범위에 따라 가격을 조정할 수 있습니다</li>
                    <li>• 계약 체결 후 안전한 에스크로로 진행됩니다</li>
                  </ul>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  등록 중...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  서비스 등록
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
