'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Sparkles, Palette, Globe, Check } from 'lucide-react'

interface FormData {
  template: string
  title: string
  slug: string
  description: string
  logo: string
  content: {
    hero: {
      title: string
      subtitle: string
      image: string
      cta: { text: string; link: string }
    }
    about: {
      text: string
      image: string
    }
    services: Array<{
      title: string
      description: string
      icon: string
    }>
    contact: {
      email: string
      phone: string
      address: string
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
    title: '',
    slug: '',
    description: '',
    logo: '',
    content: {
      hero: {
        title: '',
        subtitle: '',
        image: '',
        cta: { text: '시작하기', link: '#' }
      },
      about: {
        text: '',
        image: ''
      },
      services: [
        { title: '', description: '', icon: '💼' },
        { title: '', description: '', icon: '🚀' },
        { title: '', description: '', icon: '⭐' }
      ],
      contact: {
        email: '',
        phone: '',
        address: ''
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

  const handleDeploy = async () => {
    // TODO: API 호출하여 웹사이트 생성
    console.log('Deploying website:', formData)
    router.push('/dashboard')
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
            <StepIndicator number={1} label="템플릿" completed active={step === 1} />
            <StepLine completed={step > 1} />
            <StepIndicator number={2} label="기본 정보" completed={step > 2} active={step === 2} />
            <StepLine completed={step > 2} />
            <StepIndicator number={3} label="콘텐츠" completed={step > 3} active={step === 3} />
            <StepLine completed={step > 3} />
            <StepIndicator number={4} label="디자인" completed={step > 4} active={step === 4} />
            <StepLine completed={step > 4} />
            <StepIndicator number={5} label="배포" active={step === 5} />
          </div>
        </div>

        {/* 폼 콘텐츠 */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 mb-8">
          {step === 1 && <Step1TemplateConfirm template={formData.template} />}
          {step === 2 && <Step2BasicInfo formData={formData} setFormData={setFormData} />}
          {step === 3 && <Step3Content formData={formData} setFormData={setFormData} />}
          {step === 4 && <Step4Design formData={formData} setFormData={setFormData} />}
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
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all"
            >
              <Globe className="w-5 h-5" />
              배포하기
            </button>
          )}
        </div>
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

// Step 1: 템플릿 확인
function Step1TemplateConfirm({ template }: { template: string }) {
  const templates: Record<string, { name: string; description: string }> = {
    modern: { name: 'Modern Business', description: '세련된 비즈니스 웹사이트' },
    minimal: { name: 'Minimal Portfolio', description: '미니멀한 포트폴리오' },
    creative: { name: 'Creative Agency', description: '창의적인 에이전시' }
  }

  const selected = templates[template] || templates.modern

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">선택한 템플릿</h2>
      <div className="bg-gray-800/50 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-6xl">🎨</div>
          <div>
            <h3 className="text-2xl font-bold text-white">{selected.name}</h3>
            <p className="text-gray-400">{selected.description}</p>
          </div>
        </div>
        <p className="text-gray-300">
          이 템플릿으로 웹사이트를 만들겠습니다. 다음 단계로 진행하세요.
        </p>
      </div>
    </div>
  )
}

// Step 2: 기본 정보
function Step2BasicInfo({
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
          웹사이트 이름 *
        </label>
        <input
          type="text"
          placeholder="예: 내 카페"
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
          <span className="text-gray-500">corefy.com/</span>
          <input
            type="text"
            placeholder="my-cafe"
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
          간단한 설명
        </label>
        <textarea
          placeholder="웹사이트를 간단히 설명해주세요"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>
    </div>
  )
}

// Step 3: 콘텐츠
function Step3Content({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: (data: FormData) => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">콘텐츠 작성</h2>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">히어로 섹션</h3>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">메인 제목</label>
          <input
            type="text"
            placeholder="환영합니다"
            value={formData.content.hero.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                content: { ...formData.content, hero: { ...formData.content.hero, title: e.target.value } }
              })
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">부제목</label>
          <input
            type="text"
            placeholder="당신을 위한 최고의 서비스"
            value={formData.content.hero.subtitle}
            onChange={(e) =>
              setFormData({
                ...formData,
                content: { ...formData.content, hero: { ...formData.content.hero, subtitle: e.target.value } }
              })
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">연락처</h3>

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
          <label className="block text-sm font-medium text-gray-300 mb-2">전화번호</label>
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
      </div>
    </div>
  )
}

// Step 4: 디자인
function Step4Design({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: (data: FormData) => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">디자인 설정</h2>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Palette className="w-6 h-6 text-primary-400" />
          색상 팔레트
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Primary</label>
            <input
              type="color"
              value={formData.settings.colors.primary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  settings: {
                    ...formData.settings,
                    colors: { ...formData.settings.colors, primary: e.target.value }
                  }
                })
              }
              className="w-full h-12 rounded-xl cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Secondary</label>
            <input
              type="color"
              value={formData.settings.colors.secondary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  settings: {
                    ...formData.settings,
                    colors: { ...formData.settings.colors, secondary: e.target.value }
                  }
                })
              }
              className="w-full h-12 rounded-xl cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Accent</label>
            <input
              type="color"
              value={formData.settings.colors.accent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  settings: {
                    ...formData.settings,
                    colors: { ...formData.settings.colors, accent: e.target.value }
                  }
                })
              }
              className="w-full h-12 rounded-xl cursor-pointer"
            />
          </div>
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
          <span className="text-gray-400">URL:</span>
          <span className="ml-2 text-primary-400 font-semibold">
            corefy.com/{formData.slug}
          </span>
        </div>
        <div>
          <span className="text-gray-400">템플릿:</span>
          <span className="ml-2 text-white font-semibold">{formData.template}</span>
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
