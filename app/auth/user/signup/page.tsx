'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'

export default function UserSignupPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [role, setRole] = useState<'partner' | 'buyer' | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    displayName: '',
    profileUrl: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usernameCheck, setUsernameCheck] = useState<{
    checking: boolean
    available: boolean | null
    message: string
  }>({
    checking: false,
    available: null,
    message: ''
  })

  // 사용자 이름 중복 체크 (debounce 적용)
  useEffect(() => {
    if (!formData.profileUrl || formData.profileUrl.length < 3) {
      setUsernameCheck({ checking: false, available: null, message: '' })
      return
    }

    const timer = setTimeout(async () => {
      setUsernameCheck({ checking: true, available: null, message: '' })
      
      try {
        const response = await fetch('/api/auth/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.profileUrl })
        })
        
        const data = await response.json()
        
        setUsernameCheck({
          checking: false,
          available: data.available,
          message: data.message || data.error || ''
        })
      } catch (err) {
        setUsernameCheck({
          checking: false,
          available: null,
          message: '중복 확인 중 오류가 발생했습니다'
        })
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [formData.profileUrl])

  const handleDisplayNameChange = (value: string) => {
    setFormData({
      ...formData,
      displayName: value,
      profileUrl: generateSlug(value),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 비밀번호 확인 검증
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다')
      setLoading(false)
      return
    }

    try {
      // API 호출로 회원가입 (서버 측에서 처리)
      const response = await fetch('/api/auth/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          profileUrl: formData.profileUrl,
          role: role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다')
      }

      // 회원가입 성공 - 로그인 처리
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) throw signInError

      // 역할별 온보딩으로 이동
      if (role === 'partner') {
        router.push('/onboarding')
      } else {
        router.push('/marketplace')
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || '회원가입 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 역할 선택 화면
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              JobsClass에 오신 것을 환영합니다!
            </h1>
            <p className="text-xl text-gray-700">
              어떻게 시작하시겠어요?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 판매자 카드 */}
            <button
              onClick={() => setRole('partner')}
              className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 text-left group border-4 border-transparent hover:border-blue-500"
            >
              <div className="text-6xl mb-6">👨‍🏫</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition">
                판매자
              </h2>
              <p className="text-gray-700 text-lg mb-6">
                내 지식을 판매하고 싶어요
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>AI로 3분 만에 상품 등록</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>AI 썸네일 자동 생성</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>수수료 5-15% (업계 최저)</span>
                </li>
              </ul>
              <div className="mt-6 text-blue-600 font-bold text-lg group-hover:underline">
                판매자로 시작하기 →
              </div>
            </button>

            {/* 구매자 카드 */}
            <button
              onClick={() => setRole('buyer')}
              className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 text-left group border-4 border-transparent hover:border-purple-500"
            >
              <div className="text-6xl mb-6">👨‍🎓</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition">
                구매자
              </h2>
              <p className="text-gray-700 text-lg mb-6">
                새로운 것을 배우고 싶어요
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>AI 학습 경로 추천</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>내 수준에 맞는 강의 찾기</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>안전한 결제 & 환불 보장</span>
                </li>
              </ul>
              <div className="mt-6 text-purple-600 font-bold text-lg group-hover:underline">
                구매자로 시작하기 →
              </div>
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/auth/user/login"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              이미 계정이 있으신가요? 로그인 →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 회원가입 폼
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 py-12 px-4">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/10 via-dark-950 to-accent-900/10 pointer-events-none"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <span className="text-3xl font-bold text-white">JobsClass</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">
            {role === 'partner' ? '판매자' : '구매자'} 회원가입
          </h2>
          <p className="mt-2 text-gray-400">
            {role === 'partner' ? 'AI로 3분 만에 상품을 등록하세요' : '새로운 학습 여정을 시작하세요'}
          </p>
          <button
            onClick={() => setRole(null)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-300"
          >
            ← 역할 다시 선택
          </button>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                이메일
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input w-full"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input w-full"
                placeholder="최소 6자 이상"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.passwordConfirm}
                onChange={(e) =>
                  setFormData({ ...formData, passwordConfirm: e.target.value })
                }
                className="input w-full"
                placeholder="비밀번호를 다시 입력하세요"
              />
              {formData.passwordConfirm && formData.password !== formData.passwordConfirm && (
                <p className="mt-1 text-xs text-red-400">
                  비밀번호가 일치하지 않습니다
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                표시 이름
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                className="input w-full"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                사용자 이름 (Username)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-sm px-3">
                  jobsclass.kr/{role === 'partner' ? 'partners/' : ''}
                </span>
                <input
                  type="text"
                  required
                  value={formData.profileUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, profileUrl: e.target.value })
                  }
                  className="input flex-1"
                  placeholder="your-username"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {role === 'partner'
                  ? '내 파트너 프로필 URL에 사용됩니다 (예: jobsclass.kr/partners/username)'
                  : '내 계정 식별자로 사용됩니다'}
              </p>
              
              {/* 중복 체크 상태 표시 */}
              {formData.profileUrl.length >= 3 && (
                <div className="mt-2">
                  {usernameCheck.checking && (
                    <p className="text-xs text-gray-400">
                      사용 가능 여부 확인 중...
                    </p>
                  )}
                  {!usernameCheck.checking && usernameCheck.available === true && (
                    <p className="text-xs text-green-400">
                      ✓ {usernameCheck.message}
                    </p>
                  )}
                  {!usernameCheck.checking && usernameCheck.available === false && (
                    <p className="text-xs text-red-400">
                      ✗ {usernameCheck.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || usernameCheck.checking || usernameCheck.available === false}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '가입 중...' : '무료로 시작하기'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/auth/user/login"
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
