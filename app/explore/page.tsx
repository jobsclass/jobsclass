import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { getCategoryById, getSubcategoryById, CATEGORIES } from '@/lib/categories'
import { Search, Tag, Sparkles, Gift, TrendingUp, Users, Mail } from 'lucide-react'

export const metadata = {
  title: 'Explore Services | Corefy',
  description: '다양한 전문가들의 서비스를 찾아보세요',
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const params = await searchParams
  const selectedCategory = params.category || ''
  const searchQuery = params.search || ''

  const supabase = await createClient()

  // 모든 공개 서비스 가져오기
  let query = supabase
    .from('services')
    .select('*, partner:partner_id(display_name, profile_url)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // 카테고리 필터
  if (selectedCategory) {
    query = query.eq('category_1', selectedCategory)
  }

  // 검색어 필터
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`)
  }

  const { data: services, error } = await query

  if (error) {
    console.error('Error fetching services:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="bg-gray-950/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold text-white">Corefy</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/explore"
                className="text-sm font-medium text-white hover:text-primary-400 transition-colors"
              >
                서비스 탐색
              </Link>
              <Link
                href="/my/enrollments"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                내 수강 목록
              </Link>
              <Link
                href="/auth/buyer/login"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/auth/buyer/signup"
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              서비스 <span className="text-gradient">탐색</span>
            </h1>
            <p className="text-xl text-gray-400">
              전문가들의 다양한 서비스를 찾아보세요
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            {/* 검색 바 */}
            <form method="get" className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={searchQuery}
                  placeholder="서비스 검색..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </form>

            {/* 카테고리 필터 */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Link
                href="/explore"
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                전체
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/explore?category=${cat.id}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          {services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service: any) => {
                const category = service.category_1 ? getCategoryById(service.category_1) : null
                const subcategory =
                  service.category_1 && service.category_2
                    ? getSubcategoryById(service.category_1, service.category_2)
                    : null
                const tags = service.tags
                  ? typeof service.tags === 'string'
                    ? JSON.parse(service.tags)
                    : service.tags
                  : []

                return (
                  <Link
                    key={service.id}
                    href={`/p/${service.partner.profile_url}/${service.slug}`}
                    className="group relative"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                    <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300">
                      {/* 썸네일 */}
                      {service.thumbnail_url ? (
                        <div className="w-full h-48 bg-gray-800 rounded-xl mb-4 overflow-hidden">
                          <img
                            src={service.thumbnail_url}
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-4 flex items-center justify-center">
                          <span className="text-6xl">📚</span>
                        </div>
                      )}

                      {/* 카테고리 */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {category && (
                          <span className="px-2 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-full text-xs font-semibold">
                            {category.name}
                          </span>
                        )}
                        {subcategory && (
                          <span className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs font-semibold">
                            {subcategory.name}
                          </span>
                        )}
                      </div>

                      {/* 제목 */}
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                        {service.title}
                      </h3>

                      {/* 설명 */}
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {service.description}
                      </p>

                      {/* 강사 */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {service.partner.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-300">
                          {service.partner.display_name}
                        </span>
                      </div>

                      {/* 태그 */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 text-gray-400 rounded-full text-xs"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="px-2 py-1 text-gray-500 text-xs">
                              +{tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* 가격 */}
                      <div className="pt-4 border-t border-gray-800">
                        {service.base_price ? (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">
                              {formatCurrency(service.base_price)}
                            </span>
                            {service.discount_price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatCurrency(service.discount_price)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-lg font-semibold text-gray-400">가격 문의</span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <WaitlistSection searchQuery={searchQuery} />
          )}
        </div>
      </main>
    </div>
  )
}

function WaitlistSection({ searchQuery }: { searchQuery: string }) {
  if (searchQuery) {
    // 검색 결과 없음
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-bold text-white mb-2">검색 결과가 없습니다</h3>
        <p className="text-gray-400">다른 검색어를 시도해보세요</p>
      </div>
    )
  }

  // 서비스 없을 때 - 대기자 등록 폼
  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* Gradient Border Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
        
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-primary-500/20">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              🚀 곧 오픈합니다!
            </h2>
            <p className="text-xl text-gray-400">
              현재 <span className="text-primary-400 font-semibold">30명의 전문가</span>가 준비 중입니다
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="text-center p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <div className="text-3xl font-bold text-gradient mb-2">30+</div>
              <div className="text-sm text-gray-400">준비 중인 전문가</div>
            </div>
            <div className="text-center p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <div className="text-3xl font-bold text-gradient mb-2">100+</div>
              <div className="text-sm text-gray-400">등록 예정 서비스</div>
            </div>
            <div className="text-center p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <div className="text-3xl font-bold text-gradient mb-2">7일</div>
              <div className="text-sm text-gray-400">예상 오픈 시간</div>
            </div>
          </div>

          {/* Waitlist Form */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex-shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  🎁 베타 유저 혜택
                </h3>
                <p className="text-gray-300 mb-4">
                  오픈 알림을 받고 <strong className="text-primary-400">첫 구매 50% 할인</strong> 쿠폰을 받으세요!
                </p>
              </div>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이메일 주소
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  관심 분야 (선택)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {CATEGORIES.slice(0, 8).map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 p-3 bg-gray-900 border border-gray-700 rounded-xl cursor-pointer hover:border-primary-500 transition-colors"
                    >
                      <input type="checkbox" className="rounded text-primary-500" />
                      <span className="text-sm text-gray-300">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl text-lg font-bold hover:shadow-lg hover:shadow-primary-500/20 hover:scale-105 transition-all"
              >
                알림 받기 (50% 할인 쿠폰 받기)
              </button>
            </form>
          </div>

          {/* Preview Services */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6">
              📚 준비 중인 서비스 (샘플)
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <PreviewServiceCard
                icon="💻"
                title="웹개발 1:1 코칭"
                category="IT·개발"
                price="₩150,000"
              />
              <PreviewServiceCard
                icon="🎨"
                title="디자인 포트폴리오 첨삭"
                category="디자인·크리에이티브"
                price="₩80,000"
              />
              <PreviewServiceCard
                icon="📈"
                title="마케팅 컨설팅"
                category="비즈니스·마케팅"
                price="₩200,000"
              />
              <PreviewServiceCard
                icon="💰"
                title="재테크 멘토링"
                category="재테크·금융"
                price="₩100,000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewServiceCard({
  icon,
  title,
  category,
  price,
}: {
  icon: string
  title: string
  category: string
  price: string
}) {
  return (
    <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4 opacity-70">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-full text-xs font-semibold">
              {category}
            </span>
          </div>
          <h4 className="font-bold text-white mb-1">{title}</h4>
          <p className="text-primary-400 font-semibold">{price}</p>
        </div>
      </div>
    </div>
  )
}
