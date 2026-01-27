import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Clock, Bell, ShoppingBag, CheckCircle } from 'lucide-react'

export default async function ClientDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/user/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/auth/user/signup')
  if (profile.user_type !== 'client') redirect('/dashboard')

  // 데이터 로드
  const [myNeedsResult, receivedProposalsResult] = await Promise.all([
    supabase
      .from('client_needs')
      .select('id, title, budget_max, status, created_at')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    
    supabase
      .from('partner_proposals')
      .select(`
        id, title, status, proposed_amount, created_at,
        client_needs!inner(id, client_id),
        user_profiles(full_name)
      `)
      .eq('client_needs.client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const myNeeds = myNeedsResult.data || []
  const receivedProposals = receivedProposalsResult.data || []

  const stats = {
    totalNeeds: myNeeds.length,
    openNeeds: myNeeds.filter((n: any) => n.status === 'open').length,
    newProposals: receivedProposals.filter((p: any) => p.status === 'pending').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">안녕하세요, {profile.full_name}님! 👋</h1>
          <p className="text-gray-400 text-sm md:text-base">필요한 서비스를 찾아보세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-gray-400">진행 중</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">{stats.openNeeds}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-green-400" />
              <span className="text-xs text-gray-400">새 제안</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">{stats.newProposals}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-gray-400">총 서비스 요청</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">{stats.totalNeeds}</p>
          </div>
        </div>

        {/* 내 서비스 요청 */}
        <div className="mb-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold">내 서비스 요청</h2>
            <Link
              href="/needs/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              등록
            </Link>
          </div>

          {myNeeds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-4">찾고 있는 서비스가 있나요?</p>
              <Link
                href="/needs/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg font-semibold transition-colors text-sm"
              >
                <Plus className="w-5 h-5" />
                서비스 요청 등록하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myNeeds.map((need: any) => (
                <Link
                  key={need.id}
                  href={`/needs/${need.id}`}
                  className="block p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex-1 truncate">{need.title}</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      need.status === 'open' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {need.status === 'open' ? '모집 중' : '종료'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>예산 최대 ₩{(need.budget_max / 10000).toFixed(0)}만원</span>
                    <span>{new Date(need.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 받은 제안서 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 md:p-6">
          <div className="mb-4">
            <h2 className="text-lg md:text-xl font-bold">받은 제안서</h2>
            <p className="text-xs md:text-sm text-gray-400 mt-1">파트너의 제안을 확인하세요</p>
          </div>

          {receivedProposals.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">아직 받은 제안서가 없습니다</p>
              <p className="text-xs text-gray-500 mt-2">서비스 요청를 등록하면 파트너가 제안서를 보내드립니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedProposals.map((proposal: any) => (
                <Link
                  key={proposal.id}
                  href={`/needs/${proposal.client_needs.id}`}
                  className="block p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{proposal.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {proposal.user_profiles?.full_name || '익명 파트너'}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                      proposal.status === 'pending' 
                        ? 'bg-orange-500/20 text-orange-400' 
                        : proposal.status === 'accepted'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {proposal.status === 'pending' ? '대기' : 
                       proposal.status === 'accepted' ? '승인' : '거절'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="text-primary-400 font-semibold">
                      ₩{(proposal.proposed_amount / 10000).toFixed(0)}만원
                    </span>
                    <span>{new Date(proposal.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 서비스 둘러보기 */}
        <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white mb-1">마켓플레이스 구경하기</h3>
              <p className="text-sm text-gray-300">다양한 전문가의 서비스를 만나보세요</p>
            </div>
            <Link
              href="/marketplace"
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
            >
              둘러보기 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
