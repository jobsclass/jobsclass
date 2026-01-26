'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, Star, TrendingUp, Clock, MapPin, ArrowRight } from 'lucide-react'

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

const categories = [
  { id: 'all', name: '전체', icon: '🎯' },
  { id: 'design', name: '디자인', icon: '🎨' },
  { id: 'development', name: '개발', icon: '💻' },
  { id: 'marketing', name: '마케팅', icon: '📈' },
  { id: 'writing', name: '콘텐츠', icon: '✍️' },
  { id: 'business', name: '비즈니스', icon: '💼' },
  { id: 'education', name: '교육', icon: '📚' },
]

const serviceTypes = [
  { id: 'all', name: '전체' },
  { id: 'course', name: '온라인 강의' },
  { id: 'mentoring', name: '1:1 멘토링' },
  { id: 'consulting', name: '컨설팅' },
  { id: 'content', name: '디지털 콘텐츠' },
]

export default function MarketplacePage() {
  const supabase = createClient()
  
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('latest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])

  useEffect(() => {
    loadServices()
  }, [selectedCategory, selectedType, sortBy])

  const loadServices = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('services')
        .select(`
          *,
          user_profiles!services_user_id_fkey (
            display_name,
            username,
            partner_success_rate
          )
        `)
        .eq('status', 'published')

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType)
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

  const filteredServices = services.filter(service => {
    if (searchQuery && !service.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (service.price < priceRange[0] || service.price > priceRange[1]) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="glass border-b border-dark-800/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">J</span>
              </div>
              <span className="text-2xl font-bold text-white">JobsClass</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/needs/new" className="btn-secondary text-sm">
                니즈 등록하기
              </Link>
              <Link href="/dashboard" className="btn-ghost text-sm">
                대시보드
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="어떤 서비스를 찾으시나요?"
              className="w-full pl-12 pr-4 py-3 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-32 space-y-6">
              {/* Category Filter */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">카테고리</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-400 hover:bg-dark-800'
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">서비스 유형</h3>
                <div className="space-y-2">
                  {serviceTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                        selectedType === type.id
                          ? 'bg-primary-500/20 text-primary-300 font-medium'
                          : 'text-gray-400 hover:bg-dark-800'
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">가격 범위</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-400">
                    최대: ₩{priceRange[1].toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Sort & Stats */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                <span className="text-white font-semibold">{filteredServices.length}</span>개의 서비스
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortBy('latest')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    sortBy === 'latest'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-400 hover:bg-dark-800'
                  }`}
                >
                  최신순
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    sortBy === 'popular'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-400 hover:bg-dark-800'
                  }`}
                >
                  인기순
                </button>
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    sortBy === 'rating'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-400 hover:bg-dark-800'
                  }`}
                >
                  평점순
                </button>
              </div>
            </div>

            {/* Service Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 mb-4">검색 결과가 없습니다</p>
                <Link href="/needs/new" className="btn-primary inline-flex items-center gap-2">
                  니즈를 등록하고 파트너를 찾아보세요
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map(service => (
                  <Link
                    key={service.id}
                    href={`/marketplace/products/${service.id}`}
                    className="card p-0 overflow-hidden hover:scale-[1.02] transition-transform group"
                  >
                    {/* Service Image */}
                    <div className="relative h-48 bg-gradient-to-br from-primary-900/20 to-accent-900/20">
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
                      <div className="absolute top-3 right-3 px-3 py-1 bg-dark-900/80 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                        {serviceTypes.find(t => t.id === service.type)?.name}
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
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-dark-800">
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

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center gap-3 text-gray-400">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            {service.rating || 0}
                          </span>
                          <span>리뷰 {service.review_count || 0}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary-400">
                            ₩{service.price.toLocaleString()}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
