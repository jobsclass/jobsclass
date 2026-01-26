'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, Loader2, User, Building2 } from 'lucide-react'

// Step 0: 프로필 타입 선택
const profileTypes = [
  {
    id: 'individual',
    icon: User,
    title: '👤 개인',
    subtitle: '프리랜서, 전문가, 크리에이터',
    description: '개인 포트폴리오, 1인 사업, 퍼스널 브랜딩'
  },
  {
    id: 'organization',
    icon: Building2,
    title: '🏢 조직',
    subtitle: '스타트업, 회사, 에이전시',
    description: '회사 소개 사이트, 서비스/제품 소개, 팀 및 연혁'
  }
]

// 개인용 질문
const individualQuestions = [
  {
    id: 1,
    question: '무슨 일을 하시나요?',
    placeholder: '예: SNS 마케팅 프리랜서',
    field: 'occupation'
  },
  {
    id: 2,
    question: '주로 누구를 도와주시나요?',
    placeholder: '예: 중소기업, 스타트업, 개인 사업자',
    field: 'targetAudience'
  },
  {
    id: 3,
    question: '어떤 서비스를 제공하시나요?',
    placeholder: '예: 인스타그램 광고 대행, 브랜딩 컨설팅',
    field: 'services',
    multiline: true
  },
  {
    id: 4,
    question: '경력이 어떻게 되시나요?',
    placeholder: '예: 5년, 네이버에서 마케팅 담당',
    field: 'experience',
    multiline: true
  },
  {
    id: 5,
    question: '(선택) 특별히 강조하고 싶은 성과가 있나요?',
    placeholder: '예: MAU 100만 달성, 매출 300% 증가',
    field: 'achievements',
    multiline: true,
    optional: true
  }
]

// 조직용 질문
const organizationQuestions = [
  {
    id: 1,
    question: '회사/조직 이름은 무엇인가요?',
    placeholder: '예: (주)잡스클라스',
    field: 'organizationName'
  },
  {
    id: 2,
    question: '어떤 서비스/제품을 제공하나요?',
    placeholder: '예: AI 기반 채용 플랫폼, 웹사이트 빌더',
    field: 'services',
    multiline: true
  },
  {
    id: 3,
    question: '주요 고객은 누구인가요?',
    placeholder: '예: 스타트업, 중소기업, 프리랜서',
    field: 'targetAudience'
  },
  {
    id: 4,
    question: '회사를 한 줄로 소개한다면?',
    placeholder: '예: AI로 누구나 쉽게 웹사이트를 만드는 플랫폼',
    field: 'tagline'
  },
  {
    id: 5,
    question: '주요 제품/서비스는 무엇인가요? (최대 3개)',
    placeholder: '예: 잡스빌드, 잡스벤처스, 잡스마켓',
    field: 'products',
    multiline: true,
    optional: true
  }
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(-1) // -1: 프로필 타입 선택
  const [profileType, setProfileType] = useState<'individual' | 'organization' | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)

  const questions = profileType === 'organization' ? organizationQuestions : individualQuestions
  const currentQuestion = currentStep >= 0 ? questions[currentStep] : null

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleGenerate()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else if (currentStep === 0) {
      // 프로필 타입 선택으로 돌아가기
      setCurrentStep(-1)
      setProfileType(null)
    }
  }

  const handleProfileTypeSelect = (type: 'individual' | 'organization') => {
    setProfileType(type)
    setAnswers({ profileType: type })
    setCurrentStep(0)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers)
      })

      if (!response.ok) throw new Error('생성 실패')

      const data = await response.json()
      
      // 웹사이트 생성 완료 후 대시보드로 이동
      router.push('/dashboard?onboarding=complete')
    } catch (error) {
      console.error('AI 생성 오류:', error)
      alert('웹사이트 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const canProceed = currentStep < 0 || currentQuestion?.optional || answers[currentQuestion?.field || '']?.trim()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">AI 웹사이트 생성</h1>
          </div>
          <p className="text-gray-400">
            몇 가지 질문에 답하시면 AI가 10분 안에 웹사이트를 만들어드립니다
          </p>
        </div>

        {/* Step 0: 프로필 타입 선택 */}
        {currentStep === -1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                어떤 웹사이트를 만들고 싶으신가요?
              </h2>
              <p className="text-gray-400">
                용도에 맞는 템플릿과 질문을 제공해드립니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => handleProfileTypeSelect(type.id as 'individual' | 'organization')}
                    className="group relative p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl hover:border-primary-500 hover:bg-gray-800 transition-all duration-300 text-left"
                  >
                    {/* 아이콘 */}
                    <div className="mb-4">
                      <Icon className="w-12 h-12 text-primary-400 group-hover:scale-110 transition-transform" />
                    </div>

                    {/* 제목 */}
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {type.title}
                    </h3>
                    
                    {/* 부제목 */}
                    <p className="text-gray-400 mb-3">
                      {type.subtitle}
                    </p>

                    {/* 설명 */}
                    <p className="text-sm text-gray-500">
                      {type.description}
                    </p>

                    {/* Hover 효과 */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/0 to-purple-500/0 group-hover:from-primary-500/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 1~5: 질문 */}
        {currentStep >= 0 && (
          <>
            {/* 진행 바 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  {currentStep + 1} / {questions.length}
                </span>
                <span className="text-sm text-gray-400">
                  {Math.round(((currentStep + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* 질문 카드 */}
            {currentQuestion && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {currentQuestion.question}
            {currentQuestion.optional && (
              <span className="text-sm text-gray-400 ml-2">(선택사항)</span>
            )}
          </h2>

          {currentQuestion.multiline ? (
            <textarea
              value={answers[currentQuestion.field] || ''}
              onChange={(e) => setAnswers({ ...answers, [currentQuestion.field]: e.target.value })}
              placeholder={currentQuestion.placeholder}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors min-h-[120px] resize-none"
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={answers[currentQuestion.field] || ''}
              onChange={(e) => setAnswers({ ...answers, [currentQuestion.field]: e.target.value })}
              placeholder={currentQuestion.placeholder}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
          )}
        </div>
            )}

        {/* 버튼 */}
        <div className="flex gap-4">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
            >
              이전
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={!canProceed || isGenerating}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI가 웹사이트를 생성하는 중...
              </>
            ) : currentStep === questions.length - 1 ? (
              <>
                <Sparkles className="w-5 h-5" />
                웹사이트 생성하기
              </>
            ) : (
              <>
                다음
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* 안내 텍스트 */}
        {isGenerating && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-sm text-blue-400 text-center">
              ✨ AI가 프로필, 서비스, 블로그, 포트폴리오를 자동으로 생성하고 있습니다...
            </p>
          </div>
        )}
      </>
    )}
  </div>
</div>
  )
}
