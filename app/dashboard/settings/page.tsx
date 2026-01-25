'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/partner/login')
        return
      }

      setUser(user)

      const { data: profile } = await supabase
        .from('partner_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setProfile(profile)
        setFormData({
          display_name: profile.display_name || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || '',
        })
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('partner_profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setSuccess('프로필이 성공적으로 업데이트되었습니다!')
      
      // 프로필 새로고침
      const { data: updatedProfile } = await supabase
        .from('partner_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
    } catch (err: any) {
      console.error('Update error:', err)
      setError(err.message || '업데이트 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">설정</h1>
        <p className="text-gray-400">프로필 및 계정 설정을 관리하세요</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* 프로필 정보 */}
        <form onSubmit={handleSubmit} className="card">
          <h2 className="text-xl font-bold text-white mb-6">프로필 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                표시 이름 *
              </label>
              <input
                type="text"
                required
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                className="input w-full"
                placeholder="홍길동"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                프로필 URL
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">corefy.com/p/</span>
                <input
                  type="text"
                  value={profile?.profile_url}
                  className="input flex-1"
                  disabled
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                프로필 URL은 변경할 수 없습니다
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                소개
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="input w-full h-24"
                placeholder="자기소개를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                아바타 URL
              </label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) =>
                  setFormData({ ...formData, avatar_url: e.target.value })
                }
                className="input w-full"
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="mt-2 text-xs text-gray-500">
                이미지 URL을 입력하세요 (향후 업로드 기능 추가 예정)
              </p>
              
              {formData.avatar_url && (
                <div className="mt-3">
                  <img
                    src={formData.avatar_url}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-dark-700">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        </form>

        {/* 구독 정보 */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">구독 정보</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">현재 플랜</p>
              <p className="text-2xl font-bold text-primary-400">
                {profile?.subscription_plan || 'FREE'}
              </p>
            </div>
            <button className="btn-secondary" disabled>
              플랜 업그레이드 (준비 중)
            </button>
          </div>
        </div>

        {/* 계정 정보 */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">계정 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={user?.email}
                className="input w-full"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                비밀번호
              </label>
              <button className="btn-secondary" disabled>
                비밀번호 변경 (준비 중)
              </button>
            </div>
          </div>
        </div>

        {/* 위험 영역 */}
        <div className="card border border-red-500/20">
          <h2 className="text-xl font-bold text-red-400 mb-6">위험 영역</h2>
          <p className="text-sm text-gray-400 mb-4">
            계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
          </p>
          <button className="btn-secondary text-red-400 hover:bg-red-500/10" disabled>
            계정 삭제 (준비 중)
          </button>
        </div>
      </div>
    </div>
  )
}
