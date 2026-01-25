'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'

export default function UserSignupPage() {
  const router = useRouter()
  const supabase = createClient()
  
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

      // AI 온보딩으로 이동
      router.push('/onboarding')
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || '회원가입 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

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
            <span className="text-3xl font-bold text-white">잡스빌드</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">
            회원가입
          </h2>
          <p className="mt-2 text-gray-400">
            AI로 1분 만에 웹사이트를 만드세요
          </p>
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
                  jobsbuild.com/
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
                내 웹사이트 URL에 사용됩니다 (예: jobsbuild.com/username)
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
