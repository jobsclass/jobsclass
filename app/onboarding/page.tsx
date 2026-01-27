'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Upload, CheckCircle, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  
  // Step 1: 사업자등록번호
  const [businessNumber, setBusinessNumber] = useState('')
  
  // Step 2: 사업자등록증
  const [businessFile, setBusinessFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  // 사업자등록번호 포맷팅 (000-00-00000)
  const formatBusinessNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`
  }

  const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessNumber(formatBusinessNumber(e.target.value))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBusinessFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setFilePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleNext = () => {
    if (businessNumber.replace(/[^0-9]/g, '').length !== 10) {
      alert('올바른 사업자등록번호를 입력해주세요 (10자리)')
      return
    }
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!businessFile) {
      alert('사업자등록증을 업로드해주세요')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      // 파일 업로드
      const fileExt = businessFile.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      const filePath = `business/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, businessFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      // 프로필 업데이트
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          business_number: businessNumber.replace(/[^0-9]/g, ''),
          business_registration_file: publicUrl,
          verification_status: 'pending',
          onboarding_complete: true
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      router.push('/partner/dashboard?welcome=true')
    } catch (error: any) {
      console.error('온보딩 에러:', error)
      alert(error.message || '등록에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* 진행 바 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">단계 {step}/2</span>
            <span className="text-sm text-primary-400 font-semibold">{step === 1 ? '50%' : '100%'}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-500"
              style={{ width: `${step * 50}%` }}
            />
          </div>
        </div>

        {/* Step 1: 사업자등록번호 */}
        {step === 1 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary-500/20 rounded-xl">
                <Building2 className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">파트너 등록</h2>
                <p className="text-sm text-gray-400">사업자 정보를 입력해주세요</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  사업자등록번호 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={businessNumber}
                  onChange={handleBusinessNumberChange}
                  placeholder="000-00-00000"
                  maxLength={12}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
                <p className="mt-2 text-xs text-gray-500">
                  * 숫자 10자리를 입력하세요 (자동으로 포맷됩니다)
                </p>
              </div>

              <button
                onClick={handleNext}
                disabled={businessNumber.replace(/[^0-9]/g, '').length !== 10}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 사업자등록증 업로드 */}
        {step === 2 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary-500/20 rounded-xl">
                <Upload className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">사업자등록증</h2>
                <p className="text-sm text-gray-400">파일을 업로드해주세요</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* 파일 업로드 영역 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  사업자등록증 파일 <span className="text-red-400">*</span>
                </label>
                
                {filePreview ? (
                  <div className="relative">
                    <img 
                      src={filePreview} 
                      alt="사업자등록증 미리보기" 
                      className="w-full h-64 object-contain bg-white/5 rounded-xl"
                    />
                    <button
                      onClick={() => {
                        setBusinessFile(null)
                        setFilePreview(null)
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-primary-500/50 transition-colors bg-white/5">
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-400 mb-2">클릭하여 파일 선택</p>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF (최대 5MB)</p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!businessFile || loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      등록 중...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      등록 완료
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 안내 사항 */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-300">
            ℹ️ 관리자 승인 후 24시간 내에 이메일로 알림을 받으실 수 있습니다.
            <br />
            승인 완료 시 <strong>100 크레딧</strong>이 무료로 제공됩니다! 🎉
          </p>
        </div>
      </div>
    </div>
  )
}
