'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, Star, TrendingUp, Clock, MapPin, ArrowRight, Package, FileText, ChevronLeft, X, Home } from 'lucide-react'

interface Service {
  id: string
  title: string
  description: string
  price: number
  category: string
  type: string
  image_url?: string
  rating: number
  review_count: number
  user_profiles: {
    display_name: string
    username: string
    partner_success_rate: number
  }
}

interface Need {
  id: string
  title: string
  description: string
  category: string
  budget_min: number
  budget_max: number
  deadline: string
  location: string
  status: string
  proposal_count: number
  created_at: string
  client_id: string
  user_profiles: {
    display_name: string
  }
}

const categories = [
  { id: 'all', name: '전체', icon: '🎯' },
  { id: 'development', name: '개발 & 기술', icon: '💻' },
  { id: 'design', name: '디자인 & 크리에이티브', icon: '🎨' },
  { id: 'marketing', name: '마케팅 & 세일즈', icon: '📢' },
  { id: 'business', name: '비즈니스 & 전략', icon: '📊' },
  { id: 'content', name: '콘텐츠 & 크리에이터', icon: '✍️' },
  { id: 'education', name: '교육 & 멘토링', icon: '📚' },
  { id: 'lifestyle', name: '라이프스타일 & 웰니스', icon: '🧘' },
  { id: 'writing', name: '크리에이티브 라이팅', icon: '✒️' },
]

const serviceTypes = [
  { id: 'all', name: '전체' },
  { id: 'online_course', name: '온라인 강의' },
  { id: 'one_on_one_mentoring', name: '1:1 멘토링' },
  { id: 'group_coaching', name: '그룹 코칭' },
  { id: 'digital_product', name: '디지털 콘텐츠' },
  { id: 'project_service', name: '프로젝트 대행' },
  { id: 'consulting', name: '컨설팅' },
  { id: 'agency_service', name: '대행 서비스' },
  { id: 'premium_membership', name: '프리미엄 멤버십' },
  { id: 'live_workshop', name: '라이브 워크샵' },
  { id: 'promotion_service', name: '홍보/마케팅' },
]

export default function MarketplacePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState<'services' | 'needs'>('services')
  const [services, setServices] = useState<Service[]>([])
  const [needs, setNeeds] = useState<Need[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('latest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (activeTab === 'services') {
      loadServices()
    } else {
      loadNeeds()
    }
  }, [activeTab, selectedCategory, selectedType, sortBy])

  const loadServices = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('products')
        .select(`
          *,
          user_profiles!products_user_id_fkey (
            display_name,
            username,
            partner_success_rate
          )
        `)
        .eq('is_published', true)

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      if (selectedType !== 'all') {
        query = query.eq('service_type', selectedType)
      }

      if (sortBy === 'latest') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'popular') {
        query = query.order('view_count', { ascending: false })
      } else if (sortBy === 'rating') {
        query = query.order('rating', { ascending: false })
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('서비스 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNeeds = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('client_needs')
        .select(`
          *,
          user_profiles!client_needs_client_id_fkey (
            display_name
          )
        `)
        .eq('status', 'open')

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query.limit(50)

      if (error) throw error
      setNeeds(data || [])
    } catch (error) {
      console.error('서비스 요청 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(service => {
    if (searchQuery && !service.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (service.price < priceRange[0] || service.price > priceRange[1]) {
      return false
    }
    return true
  })

  const filteredNeeds = needs.filter(need => {
    if (searchQuery && !need.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const resetFilters = () => {
    setSelectedCategory('all')
    setSelectedType('all')
    setPriceRange([0, 1000000])
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Compact Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Back Button */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
                <span className="text-xl font-bold text-white hidden sm:block">JobsClass</span>
              </Link>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">홈</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Link href="/marketplace/products/new" className="px-3 py-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg text-white text-sm font-medium hover:shadow-lg transition-all">
                서비스 등록
              </Link>
              <Link href="/dashboard" className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors">
                대시보드
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'services'
                ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>서비스</span>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{services.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('needs')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'needs'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>서비스 요청</span>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{needs.length}</span>
          </button>
        </div>

        {/* Compact Search & Filter Bar */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'services' ? '어떤 서비스를 찾으시나요?' : '어떤 요청을 찾으시나요?'}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900/50 border border-white/10 hover:border-primary-500/50 rounded-xl text-white transition-all"
            >
              <Filter className="w-5 h-5" />
              <span>필터</span>
              {(selectedCategory !== 'all' || selectedType !== 'all') && (
                <span className="px-2 py-0.5 bg-primary-500 rounded-full text-xs">●</span>
              )}
            </button>

            {/* Sort Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  sortBy === 'latest'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                최신순
              </button>
              {activeTab === 'services' && (
                <>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`hidden sm:block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      sortBy === 'popular'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    인기순
                  </button>
                  <button
                    onClick={() => setSortBy('rating')}
                    className={`hidden sm:block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      sortBy === 'rating'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    평점순
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Category Chips (Horizontal Scroll) */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="text-sm font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Modal/Drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)}>
            <div 
              className="bg-gray-900 border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-gray-900 z-10">
                <h3 className="text-xl font-bold text-white">필터</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetFilters}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    초기화
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Service Type Filter */}
                {activeTab === 'services' && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">서비스 유형</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {serviceTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedType(type.id)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            selectedType === type.id
                              ? 'bg-primary-500 text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                {activeTab === 'services' && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">가격 범위</h4>
                    <div className="space-y-4">
                      <input
                        type="range"
                        min="0"
                        max="1000000"
                        step="10000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                        className="w-full accent-primary-500"
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">₩0</span>
                        <span className="text-white font-semibold">₩{priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Apply Button */}
              <div className="p-6 border-t border-white/10 sticky bottom-0 bg-gray-900">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg transition-all"
                >
                  필터 적용
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            <span className="text-white font-semibold text-lg">
              {activeTab === 'services' ? filteredServices.length : filteredNeeds.length}
            </span>
            <span className="ml-1">개의 {activeTab === 'services' ? '서비스' : '요청'}</span>
          </p>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : activeTab === 'services' ? (
          // 서비스 그리드
          filteredServices.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">등록된 서비스가 없습니다</h3>
              <p className="text-gray-400 mb-6">첫 번째 서비스를 등록해보세요</p>
              <Link href="/marketplace/products/new" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg transition-all">
                서비스 등록하기
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <Link
                  key={service.id}
                  href={`/marketplace/products/${service.id}`}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:scale-[1.02] hover:border-primary-500/50 transition-all group"
                >
                  {/* Service Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-900/20 to-purple-900/20">
                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {categories.find(c => c.id === service.category)?.icon || '🎯'}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-gray-900/80 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                      {serviceTypes.find(t => t.id === service.type)?.name || '서비스'}
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Partner Info */}
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                        {service.user_profiles.display_name[0]}
                      </div>
                      <span className="text-sm text-gray-400">
                        {service.user_profiles.display_name}
                      </span>
                      {service.user_profiles.partner_success_rate > 0 && (
                        <span className="text-xs text-green-400 ml-auto">
                          ✓ {service.user_profiles.partner_success_rate}%
                        </span>
                      )}
                    </div>

                    {/* Stats & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          {service.rating || 0}
                        </span>
                        <span>({service.review_count || 0})</span>
                      </div>
                      <div className="text-xl font-bold text-primary-400">
                        ₩{service.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          // 니즈 그리드
          filteredNeeds.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">등록된 요청이 없습니다</h3>
              <p className="text-gray-400 mb-6">첫 번째 요청을 등록해보세요</p>
              <Link href="/needs/new" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-semibold hover:shadow-lg transition-all">
                서비스 요청 등록하기
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNeeds.map(need => (
                <Link
                  key={need.id}
                  href={`/needs/${need.id}`}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-[1.02] hover:border-green-500/50 transition-all group"
                >
                  {/* Need Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {categories.find(c => c.id === need.category)?.icon || '🎯'}
                      </span>
                      <span className="text-xs px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full">
                        {categories.find(c => c.id === need.category)?.name}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                      제안 {need.proposal_count}개
                    </span>
                  </div>

                  {/* Need Title */}
                  <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-green-400 transition-colors">
                    {need.title}
                  </h3>

                  {/* Need Description */}
                  <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                    {need.description}
                  </p>

                  {/* Need Info */}
                  <div className="space-y-2 text-sm text-gray-500 mb-4 pb-4 border-b border-white/10">
                    {need.budget_min > 0 && (
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span>
                          ₩{need.budget_min.toLocaleString()} ~ ₩{need.budget_max.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {need.deadline && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(need.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    {need.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{need.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                        {need.user_profiles.display_name[0]}
                      </div>
                      <span className="text-xs text-gray-400">
                        {need.user_profiles.display_name}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
