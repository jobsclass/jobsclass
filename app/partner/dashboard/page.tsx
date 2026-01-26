import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  Plus, 
  Sparkles, 
  CreditCard, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  TrendingUp,
  Bell
} from 'lucide-react'

export default async function PartnerDashboard() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/user/login')
  }

  // 프로필 정보 가져오기
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/user/signup')
  }

  // 파트너가 아니면 리디렉션
  if (profile.profile_type !== 'partner') {
    redirect('/dashboard')
  }

  // 사업자 검증 상태 확인
  const isVerified = profile.business_verified === true

  // 데이터 병렬 로드
  const [
    myProductsResult,
    myProposalsResult,
    matchingNeedsResult,
    revenueResult
  ] = await Promise.all([
    // 내 상품 목록
    supabase
      .from('products')
      .select('id, title, price, status, created_at')
      .eq('partner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    
    // 제출한 제안서
    supabase
      .from('partner_proposals')
      .select(`
        id,
        title,
        proposed_amount,
        status,
        created_at,
        client_needs (
          id,
          title,
          budget_min,
          budget_max
        )
      `)
      .eq('partner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    
    // 매칭 가능한 니즈 (최신 10개)
    supabase
      .from('client_needs')
      .select('id, title, budget_min, budget_max, location, deadline, created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(10),
    
    // 매출 통계
    supabase
      .from('user_profiles')
      .select('total_revenue, total_orders')
      .eq('user_id', user.id)
      .single()
  ])

  const myProducts = myProductsResult.data || []
  const myProposals = myProposalsResult.data || []
  const matchingNeeds = matchingNeedsResult.data || []
  const revenue = revenueResult.data || { total_revenue: 0, total_orders: 0 }

  // 통계
  const stats = {
    totalRevenue: revenue.total_revenue || 0,
    totalOrders: revenue.total_orders || 0,
    aiCredits: profile.ai_credits || 0,
    activeProducts: myProducts.filter((p: any) => p.status === 'active').length,
    pendingProposals: myProposals.filter((p: any) => p.status === 'pending').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">파트너 대시보드</h1>
          <p className="text-gray-400">
            안녕하세요, <span className="text-primary-400 font-semibold">{profile.full_name}</span>님! 👋
          </p>
        </div>

        {/* 사업자 검증 미완료 경고 */}
        {!isVerified && (
          <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Clock className="w-10 h-10 text-amber-400" />
              <div>
                <h3 className="text-xl font-bold text-amber-400 mb-1">
                  사업자 검증 대기 중
                </h3>
                <p className="text-gray-300">
                  관리자 확인 후 24시간 내에 승인 결과를 이메일로 알려드립니다.
                  <br />
                  승인 완료 후 서비스 등록 및 제안서 제출이 가능합니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* AI 크레딧 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-8 h-8 text-primary-400" />
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  alert('크레딧 충전 기능은 곧 추가됩니다! 🚀')
                }}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                충전하기
              </Link>
            </div>
            <p className="text-2xl font-bold mb-1">{stats.aiCredits.toLocaleString()}</p>
            <p className="text-sm text-gray-400">AI 크레딧</p>
          </div>

          {/* 총 매출 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-2xl font-bold mb-1">₩{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-400">총 매출</p>
          </div>

          {/* 판매 건수 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-2xl font-bold mb-1">{stats.totalOrders}</p>
            <p className="text-sm text-gray-400">판매 건수</p>
          </div>

          {/* 대기 중 제안서 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-2xl font-bold mb-1">{stats.pendingProposals}</p>
            <p className="text-sm text-gray-400">대기 중 제안서</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 내 상품 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">내 상품</h2>
              <Link
                href="/marketplace/products/new"
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                새 상품 등록
              </Link>
            </div>

            {myProducts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">등록된 상품이 없습니다</p>
                <Link
                  href="/marketplace/products/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  첫 상품 등록하기
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myProducts.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/marketplace/products/${product.id}`}
                    className="block p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{product.title}</h3>
                        <p className="text-sm text-gray-400">
                          ₩{product.price.toLocaleString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {product.status === 'active' ? '판매중' : '미등록'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 제출한 제안서 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">제출한 제안서</h2>
            </div>

            {myProposals.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">제출한 제안서가 없습니다</p>
                <p className="text-sm text-gray-500">
                  아래 "매칭 가능한 니즈"에서 제안서를 제출해보세요!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myProposals.map((proposal: any) => (
                  <Link
                    key={proposal.id}
                    href={`/needs/${proposal.client_needs.id}`}
                    className="block p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold flex-1">{proposal.title}</h3>
                      {proposal.status === 'pending' && (
                        <Clock className="w-5 h-5 text-orange-400" />
                      )}
                      {proposal.status === 'accepted' && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      {proposal.status === 'rejected' && (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      니즈: {proposal.client_needs.title}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary-400 font-semibold">
                        ₩{proposal.proposed_amount.toLocaleString()}
                      </span>
                      <span className="text-gray-500">
                        {new Date(proposal.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 매칭 가능한 니즈 */}
        <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">매칭 가능한 니즈</h2>
              <p className="text-sm text-gray-400 mt-1">
                클라이언트가 등록한 니즈에 제안서를 제출하세요
              </p>
            </div>
            <Link
              href="/marketplace?tab=needs"
              className="text-primary-400 hover:text-primary-300 text-sm font-semibold"
            >
              전체 보기 →
            </Link>
          </div>

          {matchingNeeds.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">현재 매칭 가능한 니즈가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchingNeeds.map((need: any) => (
                <Link
                  key={need.id}
                  href={`/needs/${need.id}`}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <h3 className="font-semibold mb-2">{need.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>
                      ₩{need.budget_min.toLocaleString()} ~ ₩{need.budget_max.toLocaleString()}
                    </span>
                    {need.location && (
                      <span>📍 {need.location}</span>
                    )}
                  </div>
                  {need.deadline && (
                    <p className="text-sm text-orange-400 mt-2">
                      마감: {new Date(need.deadline).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
