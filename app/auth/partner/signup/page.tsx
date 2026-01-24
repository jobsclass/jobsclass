'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'

export default function PartnerSignupPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    profileUrl: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    try {
      // 1. Supabase Auth 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('회원가입에 실패했습니다')

      // 2. 파트너 프로필 생성
      const { error: profileError } = await supabase
        .from('partner_profiles')
        .insert({
          user_id: authData.user.id,
          display_name: formData.displayName,
          profile_url: formData.profileUrl,
          subscription_plan: 'FREE',
        })

      if (profileError) throw profileError

      // 3. 대시보드로 이동
      router.push('/dashboard')
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
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-3xl font-bold text-white">Corefy</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">
            파트너 회원가입
          </h2>
          <p className="mt-2 text-gray-400">
            무료로 시작하고 30분 만에 판매하세요
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
                프로필 URL
              </label>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-sm px-3">
                  corefy.com/p/
                </span>
                <input
                  type="text"
                  required
                  value={formData.profileUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, profileUrl: e.target.value })
                  }
                  className="input flex-1"
                  placeholder="your-name"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                고객들이 접속할 URL입니다
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? '가입 중...' : '무료로 시작하기'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/auth/partner/login"
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
