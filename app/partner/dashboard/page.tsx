import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Sparkles, Clock, TrendingUp, Bell, CheckCircle } from 'lucide-react'

export default async function PartnerDashboard({
  searchParams
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/user/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/auth/user/signup')
  if (profile.profile_type !== 'partner') redirect('/dashboard')

  const isVerified = profile.business_verified === true
  const params = await searchParams
  const showWelcome = params.welcome === 'true'

  // 데이터 로드
  const [myProductsResult, myProposalsResult, matchingNeedsResult] = await Promise.all([
    supabase
      .from('products')
      .select('id, title, price, status')
      .eq('partner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
    
    supabase
      .from('partner_proposals')
      .select(`id, title, status, client_needs(id, title)`)
      .eq('partner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
    
    supabase
      .from('client_needs')
      .select('id, title, budget_min, budget_max, deadline')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(6)
  ])

  const myProducts = myProductsResult.data || []
  const myProposals = myProposalsResult.data || []
  const matchingNeeds = matchingNeedsResult.data || []

  const stats = {
    aiCredits: profile.ai_credits || 0,
    totalRevenue: profile.total_revenue || 0,
    activeProducts: myProducts.filter((p: any) => p.status === 'active').length,
    pendingProposals: myProposals.filter((p: any) => p.status === 'pending').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        
        {/* 환영 메시지 */}
        {showWelcome && (
          <div className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 md:p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-1">등록 완료!</h3>
                <p className="text-sm text-gray-300">
                  사업자 정보가 제출되었습니다. 승인 후 100 크레딧이 지급됩니다! 🎉
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">안녕하세요, {profile.full_name}님! 👋</h1>
          <p className="text-gray-400 text-sm md:text-base">오늘도 멋진 서비스를 만들어봅시다</p>
        </div>

        {/* 검증 대기 알림 */}
        {!isVerified && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-400 mb-1">검증 대기 중</h3>
                <p className="text-sm text-gray-300">
                  승인 완료 후 서비스 등록 및 제안서 제출이 가능합니다
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary-400" />
              <span className="text-xs text-gray-400">크레딧</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">{stats.aiCredits}</p>
            <Link href="#" className="text-xs text-primary-400 hover:underline mt-1 inline-block">
              충전하기 →
            </Link>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-xs text-gray-400">총 매출</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">₩{(stats.totalRevenue / 10000).toFixed(0)}만</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-gray-400">활성 서비스</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">{stats.activeProducts}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-xs text-gray-400">대기 제안</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">{stats.pendingProposals}</p>
          </div>
        </div>

        {/* 내 서비스 */}
        <div className="mb-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold">내 서비스</h2>
            <Link
              href={isVerified ? "/marketplace/products/new" : "#"}
              onClick={(e) => {
                if (!isVerified) {
                  e.preventDefault()
                  alert('사업자 검증 완료 후 서비스 등록이 가능합니다')
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              등록
            </Link>
          </div>

          {myProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-4">아직 등록된 서비스가 없습니다</p>
              <Link
                href={isVerified ? "/marketplace/products/new" : "#"}
                onClick={(e) => {
                  if (!isVerified) {
                    e.preventDefault()
                    alert('사업자 검증 완료 후 서비스 등록이 가능합니다')
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg font-semibold transition-colors text-sm"
              >
                <Plus className="w-5 h-5" />
                첫 서비스 만들기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myProducts.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/marketplace/products/${product.id}`}
                  className="block p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{product.title}</h3>
                      <p className="text-sm text-gray-400">₩{product.price.toLocaleString()}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      product.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {product.status === 'active' ? '판매중' : '준비중'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 새로운 니즈 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold">새로운 니즈</h2>
              <p className="text-xs md:text-sm text-gray-400 mt-1">클라이언트가 찾는 서비스에 제안하세요</p>
            </div>
            <Link
              href="/marketplace?tab=needs"
              className="text-primary-400 hover:text-primary-300 text-sm font-semibold whitespace-nowrap"
            >
              전체 보기 →
            </Link>
          </div>

          {matchingNeeds.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">현재 매칭 가능한 니즈가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matchingNeeds.map((need: any) => (
                <Link
                  key={need.id}
                  href={`/needs/${need.id}`}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <h3 className="font-semibold mb-2 line-clamp-2">{need.title}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>₩{(need.budget_min / 10000).toFixed(0)}~{(need.budget_max / 10000).toFixed(0)}만</span>
                    {need.deadline && (
                      <span className="text-orange-400">
                        {new Date(need.deadline).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}까지
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
