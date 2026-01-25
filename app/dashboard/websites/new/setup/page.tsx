'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Sparkles, Palette, Globe, Check } from 'lucide-react'

interface FormData {
  template: string
  // 문제-해결 중심 필드
  problem_category: string
  solution_types: string[]
  target_customer: string
  // 기본 정보
  title: string
  slug: string
  description: string
  logo: string
  // 콘텐츠
  content: {
    problem: {
      title: string
      description: string
      painPoints: string[]
    }
    solution: {
      title: string
      description: string
      features: Array<{
        title: string
        description: string
        icon: string
      }>
    }
    process: {
      title: string
      steps: Array<{
        title: string
        description: string
      }>
    }
    results: {
      title: string
      items: string[]
    }
    pricing: {
      title: string
      price: string
      features: string[]
    }
    contact: {
      email: string
      phone: string
      cta: string
    }
  }
  settings: {
    colors: {
      primary: string
      secondary: string
      accent: string
    }
    fonts: {
      heading: string
      body: string
    }
  }
}

export default function WebsiteSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>
}) {
  const params = use(searchParams)
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    template: params.template || 'modern',
    // 문제-해결 중심
    problem_category: '',
    solution_types: [],
    target_customer: '',
    // 기본 정보
    title: '',
    slug: '',
    description: '',
    logo: '',
    // 콘텐츠
    content: {
      problem: {
        title: '',
        description: '',
        painPoints: ['', '', '']
      },
      solution: {
        title: '',
        description: '',
        features: [
          { title: '', description: '', icon: '💡' },
          { title: '', description: '', icon: '🚀' },
          { title: '', description: '', icon: '⭐' }
        ]
      },
      process: {
        title: '진행 과정',
        steps: [
          { title: '', description: '' },
          { title: '', description: '' },
          { title: '', description: '' }
        ]
      },
      results: {
        title: '기대 효과',
        items: ['', '', '']
      },
      pricing: {
        title: '가격',
        price: '',
        features: ['', '', '']
      },
      contact: {
        email: '',
        phone: '',
        cta: '지금 시작하기'
      }
    },
    settings: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#F59E0B'
      },
      fonts: {
        heading: 'Pretendard',
        body: 'Pretendard'
      }
    }
  })

  const handleNext = () => {
    if (step < 5) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const [isDeploying, setIsDeploying] = useState(false)
  const [error, setError] = useState('')

  const handleDeploy = async () => {
    setIsDeploying(true)
    setError('')

    try {
      const response = await fetch('/api/websites/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '웹사이트 생성 실패')
      }

      // 성공 시 대시보드로 이동
      router.push('/dashboard/websites')
    } catch (err: any) {
      setError(err.message)
      setIsDeploying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-12">
          <Link
            href="/dashboard/websites/new"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            템플릿 선택으로 돌아가기
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">웹사이트 설정</h1>
              <p className="text-gray-400 text-lg mt-2">
                단계별로 정보를 입력하세요
              </p>
            </div>
          </div>
        </div>

        {/* 진행 단계 */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <StepIndicator number={1} label="문제 정의" completed active={step === 1} />
            <StepLine completed={step > 1} />
            <StepIndicator number={2} label="해결 방법" completed={step > 2} active={step === 2} />
            <StepLine completed={step > 2} />
            <StepIndicator number={3} label="기본 정보" completed={step > 3} active={step === 3} />
            <StepLine completed={step > 3} />
            <StepIndicator number={4} label="세부 내용" completed={step > 4} active={step === 4} />
            <StepLine completed={step > 4} />
            <StepIndicator number={5} label="배포" active={step === 5} />
          </div>
        </div>

        {/* 폼 콘텐츠 */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 mb-8">
          {step === 1 && <Step1ProblemDefinition formData={formData} setFormData={setFormData} />}
          {step === 2 && <Step2SolutionType formData={formData} setFormData={setFormData} />}
          {step === 3 && <Step3BasicInfo formData={formData} setFormData={setFormData} />}
          {step === 4 && <Step4Details formData={formData} setFormData={setFormData} />}
          {step === 5 && <Step5Deploy formData={formData} />}
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            이전
          </button>

          {step < 5 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/20 hover:scale-105 transition-all"
            >
              다음
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeploying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  배포 중...
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5" />
                  배포하기
                </>
              )}
            </button>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  )
}

function StepIndicator({
  number,
  label,
  active = false,
  completed = false,
}: {
  number: number
  label: string
  active?: boolean
  completed?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
          completed
            ? 'bg-emerald-500 text-white'
            : active
            ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-lg shadow-primary-500/20'
            : 'bg-gray-800 text-gray-500'
        }`}
      >
        {completed ? <Check className="w-6 h-6" /> : number}
      </div>
      <span className={`text-sm font-medium ${active || completed ? 'text-white' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )
}

function StepLine({ completed = false }: { completed?: boolean }) {
  return (
    <div
      className={`w-16 h-0.5 transition-colors ${completed ? 'bg-emerald-500' : 'bg-gray-800'}`}
    ></div>
  )
}

// Step 1: 문제 정의
function Step1ProblemDefinition({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: (data: FormData) => void
}) {
  const problemCategories = [
    { id: '💰 수익 창출', emoji: '💰', title: '수익 창출', desc: '돈을 더 벌고 싶어요' },
    { id: '🚀 비즈니스 성장', emoji: '🚀', title: '비즈니스 성장', desc: '내 사업을 키우고 싶어요' },
    { id: '⏰ 시간 자유', emoji: '⏰', title: '시간 자유', desc: '시간/장소 자유롭게 일하고 싶어요' },
    { id: '🎯 전문성 활용', emoji: '🎯', title: '전문성 활용', desc: '내 전문성을 돈으로 바꾸고 싶어요' },
    { id: '💼 커리어 전환', emoji: '💼', title: '커리어 전환', desc: '새로운 분야로 이직하고 싶어요' },
    { id: '🎨 창작/제작', emoji: '🎨', title: '창작/제작', desc: '내 작품/콘텐츠를 만들고 싶어요' },
    { id: '📚 스킬 습득', emoji: '📚', title: '스킬 습득', desc: '새로운 기술을 배우고 싶어요' },
    { id: '🏢 조직/팀 관리', emoji: '🏢', title: '조직/팀 관리', desc: '팀을 잘 이끌고 싶어요' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">어떤 문제를 해결해주시나요?</h2>
        <p className="text-gray-400">고객이 겪고 있는 핵심 문제를 선택하세요</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {problemCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setFormData({ ...formData, problem_category: category.id })}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              formData.problem_category === category.id
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="text-4xl mb-3">{category.emoji}</div>
            <h3 className="text-lg font-bold text-white mb-1">{category.title}</h3>
            <p className="text-sm text-gray-400">{category.desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          타겟 고객을 구체적으로 설명해주세요 *
        </label>
        <input
          type="text"
          placeholder="예: 부업을 시작하고 싶은 직장인, 매출이 정체된 소상공인"
          value={formData.target_customer}
          onChange={(e) => setFormData({ ...formData, target_customer: e.target.value })}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>
    </div>
  )
}

// Step 2: 해결 방법
function Step2SolutionType({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: (data: FormData) => void
}) {
  const solutionTypes = [
    { id: '온라인 강의', emoji: '💻', desc: '동영상 강의 제공' },
    { id: '오프라인 교육', emoji: '🎓', desc: '대면 교육 진행' },
    { id: '전자책', emoji: '📚', desc: 'PDF/이북 제공' },
    { id: '컨설팅', emoji: '💬', desc: '1:1 상담/자문' },
    { id: '코칭', emoji: '🎯', desc: '코칭 프로그램' },
    { id: '외주 서비스', emoji: '🛠️', desc: '작업물 제작/납품' },
    { id: '템플릿/툴', emoji: '⚙️', desc: '템플릿/도구 제공' },
    { id: '커뮤니티', emoji: '👥', desc: '멤버십/커뮤니티 운영' }
  ]

  const toggleSolutionType = (type: string) => {
    const current = formData.solution_types || []
    if (current.includes(type)) {
      setFormData({
        ...formData,
        solution_types: current.filter(t => t !== type)
      })
    } else {
      setFormData({
        ...formData,
        solution_types: [...current, type]
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">어떤 형태로 제공하시나요?</h2>
        <p className="text-gray-400">제공하는 솔루션 형태를 모두 선택하세요 (복수 선택 가능)</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {solutionTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => toggleSolutionType(type.id)}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              formData.solution_types?.includes(type.id)
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{type.emoji}</div>
              <div>
                <h3 className="text-lg font-bold text-white">{type.id}</h3>
                <p className="text-sm text-gray-400">{type.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {formData.solution_types?.length > 0 && (
        <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
          <p className="text-primary-400 font-semibold">
            ✨ 선택됨: {formData.solution_types.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}

// Step 3: 기본 정보
function Step3BasicInfo({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: (data: FormData) => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">기본 정보</h2>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          웹사이트/상품 이름 *
        </label>
        <input
          type="text"
          placeholder="예: 블로그 수익화 완전 정복"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          URL 슬러그 *
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">corefy.com/username/</span>
          <input
            type="text"
            placeholder="blog-revenue"
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })
            }
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          한 줄 소개 *
        </label>
        <textarea
          placeholder="예: 블로그로 월 300만원 버는 실전 노하우 공개"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>
    </div>
  )
}

// Step 4: 세부 내용
function Step4Details({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: (data: FormData) => void
}) {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">세부 내용 작성</h2>

      {/* 문제 정의 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">💡 고객의 문제</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">문제 설명</label>
          <textarea
            placeholder="고객이 겪는 문제를 구체적으로 설명하세요"
            value={formData.content.problem.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                content: {
                  ...formData.content,
                  problem: { ...formData.content.problem, description: e.target.value }
                }
              })
            }
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      {/* 해결 방법 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">✨ 해결 방법</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">해결 방법 설명</label>
          <textarea
            placeholder="이 상품/서비스로 어떻게 문제를 해결하는지 설명하세요"
            value={formData.content.solution.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                content: {
                  ...formData.content,
                  solution: { ...formData.content.solution, description: e.target.value }
                }
              })
            }
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      {/* 가격 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">💰 가격</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">가격</label>
          <input
            type="text"
            placeholder="예: ₩99,000 또는 무료"
            value={formData.content.pricing.price}
            onChange={(e) =>
              setFormData({
                ...formData,
                content: {
                  ...formData.content,
                  pricing: { ...formData.content.pricing, price: e.target.value }
                }
              })
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      {/* 연락처 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">📞 연락처</h3>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">이메일</label>
          <input
            type="email"
            placeholder="hello@example.com"
            value={formData.content.contact.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                content: {
                  ...formData.content,
                  contact: { ...formData.content.contact, email: e.target.value }
                }
              })
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">전화번호 (선택)</label>
          <input
            type="tel"
            placeholder="010-1234-5678"
            value={formData.content.contact.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                content: {
                  ...formData.content,
                  contact: { ...formData.content.contact, phone: e.target.value }
                }
              })
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">CTA 버튼 텍스트</label>
          <input
            type="text"
            placeholder="지금 시작하기"
            value={formData.content.contact.cta}
            onChange={(e) =>
              setFormData({
                ...formData,
                content: {
                  ...formData.content,
                  contact: { ...formData.content.contact, cta: e.target.value }
                }
              })
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>
    </div>
  )
}

// Step 5: 배포
function Step5Deploy({ formData }: { formData: FormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">배포 준비 완료!</h2>

      <div className="bg-gray-800/50 rounded-2xl p-6 space-y-4">
        <div>
          <span className="text-gray-400">웹사이트 이름:</span>
          <span className="ml-2 text-white font-semibold">{formData.title}</span>
        </div>
        <div>
          <span className="text-gray-400">타겟 고객:</span>
          <span className="ml-2 text-white font-semibold">{formData.target_customer}</span>
        </div>
        <div>
          <span className="text-gray-400">해결하는 문제:</span>
          <span className="ml-2 text-white font-semibold">{formData.problem_category}</span>
        </div>
        <div>
          <span className="text-gray-400">제공 형태:</span>
          <span className="ml-2 text-white font-semibold">{formData.solution_types?.join(', ')}</span>
        </div>
        <div>
          <span className="text-gray-400">URL:</span>
          <span className="ml-2 text-primary-400 font-semibold">
            corefy.com/[username]/{formData.slug}
          </span>
        </div>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <p className="text-emerald-400 font-semibold mb-2">✨ 모든 준비가 완료되었습니다!</p>
        <p className="text-gray-300">
          배포하기 버튼을 누르면 즉시 웹사이트가 생성됩니다.
        </p>
      </div>
    </div>
  )
}
