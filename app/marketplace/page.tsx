'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { 
  Search, 
  SlidersHorizontal, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Star,
  Users,
  Filter,
  X
} from 'lucide-react'

type Product = {
  id: string
  title: string
  description: string
  price: number
  category: string
  image_url?: string
  user_profiles: {
    display_name: string
    username: string
  }
  created_at: string
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('latest')
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'course', label: '온라인 강의' },
    { value: 'coaching', label: '1:1 코칭' },
    { value: 'consulting', label: '컨설팅' },
    { value: 'template', label: '템플릿' },
    { value: 'ebook', label: '전자책' },
    { value: 'membership', label: '멤버십' },
  ]

  const priceRanges = [
    { value: 'all', label: '전체 가격' },
    { value: '0-50000', label: '5만원 이하' },
    { value: '50000-100000', label: '5만원 - 10만원' },
    { value: '100000-200000', label: '10만원 - 20만원' },
    { value: '200000-', label: '20만원 이상' },
  ]

  const sortOptions = [
    { value: 'latest', label: '최신순', icon: Clock },
    { value: 'popular', label: '인기순', icon: TrendingUp },
    { value: 'price-low', label: '가격 낮은순', icon: DollarSign },
    { value: 'price-high', label: '가격 높은순', icon: DollarSign },
  ]

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, priceRange, sortBy])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Build query params
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-')
        if (min) params.append('min_price', min)
        if (max) params.append('max_price', max)
      }
      params.append('sort_by', sortBy)
      params.append('status', 'published') // Only show published products

      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Fetch error:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.user_profiles.display_name.toLowerCase().includes(query)
    )
  })

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      course: '📚',
      coaching: '🎯',
      consulting: '💼',
      template: '📄',
      ebook: '📖',
      membership: '👥',
    }
    return emojis[category] || '📦'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            마켓플레이스
          </h1>
          <p className="text-xl text-gray-700">
            전문가들의 지식과 경험을 만나보세요
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="상품, 파트너 이름으로 검색..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none text-lg"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              필터
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="max-w-4xl mx-auto mb-8 bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                필터 옵션
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  카테고리
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  가격 범위
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  정렬
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSelectedCategory('all')
                setPriceRange('all')
                setSortBy('latest')
                setSearchQuery('')
              }}
              className="mt-4 text-sm text-blue-600 font-medium hover:underline"
            >
              필터 초기화
            </button>
          </div>
        )}

        {/* Active Filters Display */}
        {(selectedCategory !== 'all' || priceRange !== 'all' || searchQuery) && (
          <div className="max-w-4xl mx-auto mb-6 flex flex-wrap gap-2">
            {selectedCategory !== 'all' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                {categories.find(c => c.value === selectedCategory)?.label}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {priceRange !== 'all' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                {priceRanges.find(r => r.value === priceRange)?.label}
                <button
                  onClick={() => setPriceRange('all')}
                  className="hover:text-green-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1">
                검색: {searchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-purple-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="max-w-4xl mx-auto mb-6">
          <p className="text-gray-700 font-medium">
            총 <span className="text-blue-600 font-bold">{filteredProducts.length}</span>개의 상품
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">상품을 불러오는 중...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              상품이 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              다른 검색어나 필터로 다시 시도해보세요
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setPriceRange('all')
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/marketplace/products/${product.id}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden group"
              >
                {/* Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="text-white text-6xl">
                      {getCategoryEmoji(product.category)}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900">
                    {categories.find(c => c.value === product.category)?.label || product.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Partner Info */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {product.user_profiles.display_name[0]}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {product.user_profiles.display_name}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-black text-blue-600">
                      ₩{product.price.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span>5.0</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {!loading && filteredProducts.length > 0 && (
          <div className="mt-16 max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
            <Users className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-black mb-4">
              당신도 파트너가 되어보세요
            </h2>
            <p className="text-xl mb-6 opacity-95">
              지금 가입하고 3분 안에 첫 상품을 등록하세요
            </p>
            <Link
              href="/signup"
              className="inline-block px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition"
            >
              파트너 시작하기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
