'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, Loader2, Upload, CheckCircle, Building2, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type OnboardingStep = 'business_info' | 'business_file' | 'complete'

export default function PartnerOnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('business_info')
  const [loading, setLoading] = useState(false)
  
  // 사업자 정보
  const [businessNumber, setBusinessNumber] = useState('')
  const [businessFile, setBusinessFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  // 사업자등록번호 포맷팅
  const formatBusinessNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`
  }

  const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBusinessNumber(e.target.value)
    setBusinessNumber(formatted)
  }

  // 파일 업로드
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBusinessFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 다음 단계
  const handleNext = async () => {
    if (currentStep === 'business_info') {
      if (businessNumber.replace(/[^0-9]/g, '').length !== 10) {
        alert('올바른 사업자등록번호를 입력해주세요.')
        return
      }
      setCurrentStep('business_file')
    } else if (currentStep === 'business_file') {
      if (!businessFile) {
        alert('사업자등록증을 업로드해주세요.')
        return
      }
      await handleSubmit()
    }
  }

  // 최종 제출
  const handleSubmit = async () => {
    setLoading(true)
    try {
      // 1. 파일 업로드 (Supabase Storage)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      const fileExt = businessFile!.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      const filePath = `business-registrations/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, businessFile!)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      // 2. user_profiles 업데이트
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          business_number: businessNumber.replace(/[^0-9]/g, ''),
          business_registration_file: publicUrl,
          verification_status: 'pending'
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setCurrentStep('complete')
    } catch (error) {
      console.error('제출 오류:', error)
      alert('제출 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 요금제 데이터
  const plans = [
    {
      id: 'basic',
      name: 'BASIC',
      nameKo: '베이직',
      price: { monthly: 0, yearly: 0 },
      revenueShare: '20%',
      features: [
        '월 요금 무료',
        '서비스 등록 5개',
        '매출 쉐어 20%',
        '기본 관리 도구',
        '니즈 제안 가능'
      ]
    },
    {
      id: 'pro',
      name: 'PRO',
      nameKo: '프로',
      price: { monthly: 49000, yearly: 470400 },
      revenueShare: '12%',
      recommended: true,
      features: [
        '서비스 등록 무제한',
        '매출 쉐어 12%',
        '우선 노출',
        'AI 프로필 작성',
        '고급 분석 도구',
        '니즈 우선 알림'
      ]
    },
    {
      id: 'enterprise',
      name: 'ENTERPRISE',
      nameKo: '엔터프라이즈',
      price: { monthly: 99000, yearly: 950400 },
      revenueShare: '8%',
      features: [
        '서비스 등록 무제한',
        '매출 쉐어 8%',
        '최우선 노출',
        'AI 프로필 작성',
        '배너 광고',
        '스타트업잡스 인터뷰',
        '전담 매니저',
        '니즈 최우선 알림'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="w-8 h-8 text-primary-400" />
            <h1 className="text-4xl font-bold text-white">파트너 등록</h1>
          </div>
          <p className="text-gray-400">
            진정성 있는 지식 비즈니스 파트너가 되어주세요
          </p>
        </div>

        {/* 진행 단계 */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Step number={1} title="사업자 정보" active={currentStep === 'business_info'} completed={['business_file', 'complete'].includes(currentStep)} />
          <div className="h-0.5 w-12 bg-gray-700" />
          <Step number={2} title="서류 업로드" active={currentStep === 'business_file'} completed={currentStep === 'complete'} />
        </div>

        {/* Step 1: 사업자 정보 */}
        {currentStep === 'business_info' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">사업자 정보</h2>
              <p className="text-gray-400">
                단순한 프리랜서가 아닌, 진정성 있는 사업자만 등록할 수 있습니다.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  사업자등록번호 *
                </label>
                <input
                  type="text"
                  value={businessNumber}
                  onChange={handleBusinessNumberChange}
                  placeholder="123-45-67890"
                  maxLength={12}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  개인사업자 또는 법인사업자 모두 가능합니다.
                </p>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-300">
                  <strong>왜 사업자만 등록할 수 있나요?</strong><br />
                  JobsClass는 클라이언트에게 신뢰할 수 있는 지식 서비스를 제공합니다. 
                  사업자 등록은 파트너의 책임감과 진정성을 보장하는 기준입니다.
                </p>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={businessNumber.replace(/[^0-9]/g, '').length !== 10}
              className="w-full mt-8 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              다음
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: 사업자등록증 업로드 */}
        {currentStep === 'business_file' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">사업자등록증 업로드</h2>
              <p className="text-gray-400">
                사업자등록증을 업로드해주세요. 관리자 확인 후 승인됩니다.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  사업자등록증 파일 *
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    id="business-file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  <label
                    htmlFor="business-file"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    {filePreview ? (
                      <>
                        <CheckCircle className="w-16 h-16 text-green-400" />
                        <div className="text-center">
                          <p className="text-white font-medium">{businessFile?.name}</p>
                          <p className="text-sm text-gray-400 mt-1">클릭하여 다른 파일 선택</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-16 h-16 text-gray-400" />
                        <div className="text-center">
                          <p className="text-white font-medium">파일을 선택하거나 드래그하세요</p>
                          <p className="text-sm text-gray-400 mt-1">JPG, PNG, PDF (최대 5MB)</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  사업자등록증은 안전하게 암호화되어 저장됩니다.
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setCurrentStep('business_info')}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                이전
              </button>
              <button
                onClick={handleNext}
                disabled={!businessFile}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                다음
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 완료 */}
        {currentStep === 'complete' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">등록 완료!</h2>
            <p className="text-gray-400 mb-8">
              사업자 정보가 제출되었습니다.<br />
              관리자 확인 후 24시간 내에 승인 결과를 이메일로 알려드립니다.<br /><br />
              <span className="text-primary-400 font-semibold">💡 매출 쉐어 10% 고정 + AI 크레딧으로 운영됩니다</span>
            </p>

            <div className="p-6 bg-primary-500/10 border border-primary-500/20 rounded-xl mb-8">
              <h3 className="text-white font-semibold mb-2">🎉 가입 축하 선물</h3>
              <p className="text-primary-300">50 AI 크레딧이 지급되었습니다!</p>
              <p className="text-sm text-gray-400 mt-2">
                AI 프로필 생성, 니즈 매칭 등에 사용하세요
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all"
              >
                대시보드로 이동
              </button>
              <button
                onClick={() => router.push('/marketplace')}
                className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                마켓플레이스 둘러보기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 진행 단계 컴포넌트
function Step({ number, title, active, completed }: { number: number; title: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
        completed ? 'bg-green-500 text-white' :
        active ? 'bg-primary-500 text-white' :
        'bg-gray-700 text-gray-400'
      }`}>
        {completed ? <CheckCircle className="w-6 h-6" /> : number}
      </div>
      <span className={`text-xs font-medium ${active || completed ? 'text-white' : 'text-gray-500'}`}>
        {title}
      </span>
    </div>
  )
}
