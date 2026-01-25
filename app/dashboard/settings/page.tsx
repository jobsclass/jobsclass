import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/partner/login')
  }

  // Fetch partner profile
  const { data: profile } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">설정</h1>
        <p className="text-gray-400">프로필 및 계정 설정을 관리하세요</p>
      </div>

      <div className="space-y-6">
        {/* 프로필 정보 */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">프로필 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                표시 이름
              </label>
              <input
                type="text"
                defaultValue={profile?.display_name}
                className="input w-full"
                disabled
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
                  defaultValue={profile?.profile_url}
                  className="input flex-1"
                  disabled
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                소개
              </label>
              <textarea
                defaultValue={profile?.bio || ''}
                className="input w-full h-24"
                placeholder="자기소개를 입력하세요"
                disabled
              />
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-dark-700">
            <button className="btn-primary" disabled>
              저장 (준비 중)
            </button>
          </div>
        </div>

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
                defaultValue={user.email}
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
