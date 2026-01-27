'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building2, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react'

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [step, setStep] = useState<1 | 2>(1)
  const [profileType, setProfileType] = useState<'partner' | 'client' | null>(
    searchParams.get('type') === 'partner' ? 'partner' : 
    searchParams.get('type') === 'client' ? 'client' : null
  )
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    fullName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profileType) {
      setError('파트너 또는 클라이언트를 선택해주세요')
      return
    }
    
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Supabase Auth 회원가입
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            profile_type: profileType
          }
        }
      })

      if (signUpError) throw signUpError

      if (!authData.user) {
        throw new Error('회원가입에 실패했습니다')
      }

      // 2. user_profiles 테이블에 프로필 생성
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          profile_type: profileType,
          ai_credits: 10000, // 신규 가입 시 10,000 크레딧 무료 제공 (= 10,000원)
          onboarding_complete: profileType === 'client' // 클라이언트는 즉시 완료
        })

      if (profileError) {
        console.error('프로필 생성 오류:', profileError)
        // 프로필 생성 실패 시 auth 사용자 삭제는 하지 않음 (이메일 인증 링크 유효)
      }

      // 3. 크레딧 거래 내역 추가
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: authData.user.id,
          type: 'bonus',
          amount: 10000,
          balance_after: 10000,
          description: '신규 가입 축하 크레딧',
          metadata: { source: 'signup_bonus' }
        })

      // 4. 타입별 리디렉션
      if (profileType === 'partner') {
        router.push('/onboarding') // 파트너는 사업자 정보 입력
      } else {
        router.push('/client/dashboard?welcome=true') // 클라이언트는 바로 대시보드
      }
    } catch (error: any) {
      console.error('회원가입 오류:', error)
      setError(error.message || '회원가입에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">J</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">회원가입</h1>
          <p className="text-gray-400">JobsClass에 오신 것을 환영합니다</p>
        </div>

        {/* Step 1: 타입 선택 */}
        {step === 1 && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setProfileType('partner')
                setStep(2)
              }}
              className={`w-full p-6 rounded-2xl border-2 transition-all ${
                profileType === 'partner'
                  ? 'bg-primary-500/20 border-primary-500'
                  : 'bg-white/5 border-white/10 hover:border-primary-500/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-500/20 rounded-xl">
                  <Building2 className="w-8 h-8 text-primary-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-white mb-1">파트너 가입</h3>
                  <p className="text-sm text-gray-400">서비스를 판매하고 싶어요</p>
                  <p className="text-xs text-gray-500 mt-1">* 사업자등록번호 필수</p>
                </div>
                <ArrowRight className="w-6 h-6 text-primary-400" />
              </div>
            </button>

            <button
              onClick={() => {
                setProfileType('client')
                setStep(2)
              }}
              className={`w-full p-6 rounded-2xl border-2 transition-all ${
                profileType === 'client'
                  ? 'bg-green-500/20 border-green-500'
                  : 'bg-white/5 border-white/10 hover:border-green-500/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <User className="w-8 h-8 text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-white mb-1">클라이언트 가입</h3>
                  <p className="text-sm text-gray-400">전문가를 찾고 있어요</p>
                  <p className="text-xs text-gray-500 mt-1">무료 이용 가능</p>
                </div>
                <ArrowRight className="w-6 h-6 text-green-400" />
              </div>
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-400">
                이미 계정이 있으신가요?{' '}
                <Link href="/auth/user/login" className="text-primary-400 hover:underline">
                  로그인
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: 정보 입력 */}
        {step === 2 && profileType && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
            >
              ← 뒤로 가기
            </button>

            <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                {profileType === 'partner' ? (
                  <>
                    <Building2 className="w-5 h-5 text-primary-400" />
                    <span className="font-semibold text-white">파트너 계정</span>
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-white">클라이언트 계정</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400">
                가입 시 <strong className="text-primary-400">10,000 크레딧</strong>이 무료로 제공됩니다! 🎉
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이름 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이메일 <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  비밀번호 <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="최소 6자"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  비밀번호 확인 <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  placeholder="비밀번호 재입력"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    가입 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    가입 완료
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default function UserSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
