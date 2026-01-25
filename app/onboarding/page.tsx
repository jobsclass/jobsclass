'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'

const questions = [
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

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)

  const currentQuestion = questions[currentStep]

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
    }
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

  const canProceed = currentQuestion.optional || answers[currentQuestion.field]?.trim()

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
      </div>
    </div>
  )
}
