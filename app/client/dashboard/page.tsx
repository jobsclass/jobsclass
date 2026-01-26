import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Bell,
  ShoppingBag,
  Heart,
  MessageSquare
} from 'lucide-react'

export default async function ClientDashboard() {
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

  // 클라이언트가 아니면 리디렉션
  if (profile.profile_type !== 'client') {
    redirect('/dashboard')
  }

  // 데이터 병렬 로드
  const [
    myNeedsResult,
    receivedProposalsResult,
    purchasedProductsResult
  ] = await Promise.all([
    // 내가 등록한 니즈
    supabase
      .from('client_needs')
      .select('id, title, budget_min, budget_max, status, created_at')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    
    // 받은 제안서 (내 니즈에 대한)
    supabase
      .from('partner_proposals')
      .select(`
        id,
        title,
        proposed_amount,
        status,
        created_at,
        client_needs!inner (
          id,
          title,
          client_id
        ),
        user_profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('client_needs.client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    
    // 구매한 상품
    supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        created_at,
        products (
          id,
          title,
          thumbnail_url
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const myNeeds = myNeedsResult.data || []
  const receivedProposals = receivedProposalsResult.data || []
  const purchasedProducts = purchasedProductsResult.data || []

  // 통계
  const stats = {
    totalNeeds: myNeeds.length,
    openNeeds: myNeeds.filter((n: any) => n.status === 'open').length,
    pendingProposals: receivedProposals.filter((p: any) => p.status === 'pending').length,
    totalPurchases: purchasedProducts.length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">클라이언트 대시보드</h1>
          <p className="text-gray-400">
            안녕하세요, <span className="text-primary-400 font-semibold">{profile.full_name}</span>님! 👋
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 등록한 니즈 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-2xl font-bold mb-1">{stats.totalNeeds}</p>
            <p className="text-sm text-gray-400">등록한 니즈</p>
          </div>

          {/* 진행 중 니즈 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-2xl font-bold mb-1">{stats.openNeeds}</p>
            <p className="text-sm text-gray-400">진행 중 니즈</p>
          </div>

          {/* 받은 제안서 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-2xl font-bold mb-1">{stats.pendingProposals}</p>
            <p className="text-sm text-gray-400">새 제안서</p>
          </div>

          {/* 구매 내역 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <ShoppingBag className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-2xl font-bold mb-1">{stats.totalPurchases}</p>
            <p className="text-sm text-gray-400">구매 내역</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 내 니즈 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">내 니즈</h2>
              <Link
                href="/needs/new"
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                니즈 등록
              </Link>
            </div>

            {myNeeds.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">등록된 니즈가 없습니다</p>
                <Link
                  href="/needs/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  첫 니즈 등록하기
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myNeeds.map((need: any) => (
                  <Link
                    key={need.id}
                    href={`/needs/${need.id}`}
                    className="block p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold flex-1">{need.title}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        need.status === 'open' 
                          ? 'bg-green-500/20 text-green-400' 
                          : need.status === 'matched'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {need.status === 'open' ? '모집 중' : 
                         need.status === 'matched' ? '매칭 완료' : '종료'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        ₩{need.budget_min.toLocaleString()} ~ ₩{need.budget_max.toLocaleString()}
                      </span>
                      <span className="text-gray-500">
                        {new Date(need.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 받은 제안서 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">받은 제안서</h2>
            </div>

            {receivedProposals.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">받은 제안서가 없습니다</p>
                <p className="text-sm text-gray-500">
                  니즈를 등록하면 파트너가 제안서를 보내드립니다!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedProposals.map((proposal: any) => (
                  <Link
                    key={proposal.id}
                    href={`/needs/${proposal.client_needs.id}`}
                    className="block p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{proposal.title}</h3>
                        <p className="text-sm text-gray-400">
                          파트너: {proposal.user_profiles?.full_name || '익명'}
                        </p>
                      </div>
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

        {/* 구매 내역 */}
        <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">구매 내역</h2>
              <p className="text-sm text-gray-400 mt-1">
                구매한 서비스 목록
              </p>
            </div>
            <Link
              href="/marketplace"
              className="text-primary-400 hover:text-primary-300 text-sm font-semibold"
            >
              마켓플레이스 →
            </Link>
          </div>

          {purchasedProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">구매한 서비스가 없습니다</p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold transition-colors"
              >
                서비스 둘러보기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchasedProducts.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/marketplace/products/${order.products.id}`}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="aspect-video bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    {order.products.thumbnail_url ? (
                      <img 
                        src={order.products.thumbnail_url} 
                        alt={order.products.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FileText className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{order.products.title}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-400 font-semibold">
                      ₩{order.total_amount.toLocaleString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {order.status === 'completed' ? '완료' : '진행 중'}
                    </span>
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
