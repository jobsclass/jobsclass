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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-primary-600">
            JobsClass
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            파트너 회원가입
          </h2>
          <p className="mt-2 text-gray-600">
            무료로 시작하고 바로 판매하세요
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="최소 6자 이상"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                표시 이름
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로필 URL
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 text-sm">
                  jobsclass.com/p/
                </span>
                <input
                  type="text"
                  required
                  value={formData.profileUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, profileUrl: e.target.value })
                  }
                  className="flex-1 ml-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="your-name"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                고객들이 접속할 URL입니다
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '가입 중...' : '무료로 시작하기'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/auth/partner/login"
                className="text-primary-600 hover:text-primary-700 font-semibold"
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
