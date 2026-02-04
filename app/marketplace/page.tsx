'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { 
  JOBSCLASS_CATEGORIES, 
  JOBSCLASS_SERVICE_TYPES,
  type JobsClassServiceType 
} from '@/lib/constants/jobsclass';

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  category: string;
  subcategory: string | null;
  service_type: string;
  price: number;
  original_price: number | null;
  currency: string;
  rating_average: number;
  rating_count: number;
  purchase_count: number;
  partner_id: string;
  created_at: string;
  partner_profiles?: {
    display_name: string;
    avatar_url: string | null;
    rating_average: number;
  };
}

export default function MarketplacePage() {
  const supabase = createClient();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'price-low' | 'price-high'>('latest');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterAndSortServices();
  }, [services, searchQuery, selectedCategory, selectedType, sortBy]);

  async function loadServices() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          partner_profiles!services_partner_id_fkey(
            display_name,
            avatar_url,
            rating_average
          )
        `)
        .eq('is_published', true)
        .eq('is_active', true);

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortServices() {
    let filtered = [...services];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.partner_profiles?.display_name?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((s) => s.service_type === selectedType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.purchase_count || 0) - (a.purchase_count || 0);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'latest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredServices(filtered);
  }

  function toggleFavorite(serviceId: string) {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(serviceId)) {
        newFavorites.delete(serviceId);
      } else {
        newFavorites.add(serviceId);
      }
      return newFavorites;
    });
  }

  function getServiceTypeInfo(typeId: string): JobsClassServiceType | undefined {
    return JOBSCLASS_SERVICE_TYPES.find((t) => t.id === typeId);
  }

  function getCategoryInfo(categoryId: string) {
    return JOBSCLASS_CATEGORIES.find((c) => c.id === categoryId);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                지식서비스 마켓플레이스
              </h1>
              <p className="text-gray-300">
                전문가의 노하우를 배우고, 함께 성장하세요
              </p>
            </div>
            <Link
              href="/cart"
              className="relative inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              장바구니
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="어떤 서비스를 찾고 계신가요?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <FunnelIcon className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">필터</h2>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">카테고리</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      selectedCategory === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    전체
                  </button>
                  {JOBSCLASS_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                        selectedCategory === category.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{category.emoji}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Type Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">서비스 유형</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      selectedType === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    전체
                  </button>
                  {JOBSCLASS_SERVICE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                        selectedType === type.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{type.icon}</span>
                      <span>{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">정렬</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="latest">최신순</option>
                  <option value="popular">인기순</option>
                  <option value="price-low">가격 낮은순</option>
                  <option value="price-high">가격 높은순</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Services Grid */}
          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-300">
                <span className="font-semibold text-white">{filteredServices.length}</span>개의
                서비스
              </p>
            </div>

            {filteredServices.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
                <p className="text-gray-300 text-lg mb-2">검색 결과가 없습니다</p>
                <p className="text-gray-400 text-sm">다른 검색어나 필터를 시도해보세요</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isFavorite={favorites.has(service.id)}
                    onToggleFavorite={() => toggleFavorite(service.id)}
                    getServiceTypeInfo={getServiceTypeInfo}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

interface ServiceCardProps {
  service: Service;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  getServiceTypeInfo: (typeId: string) => JobsClassServiceType | undefined;
}

function ServiceCard({ service, isFavorite, onToggleFavorite, getServiceTypeInfo }: ServiceCardProps) {
  const typeInfo = getServiceTypeInfo(service.service_type);
  const hasDiscount = service.original_price && service.original_price > service.price;
  const discountRate = hasDiscount
    ? Math.round(((service.original_price! - service.price) / service.original_price!) * 100)
    : 0;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-purple-500/50 transition group">
      <Link href={`/services/${service.slug}`}>
        <div className="relative aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          {service.thumbnail_url ? (
            <img
              src={service.thumbnail_url}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {typeInfo?.icon}
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {discountRate}% OFF
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        {/* Service Type Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
            <span>{typeInfo?.icon}</span>
            <span>{typeInfo?.name}</span>
          </span>
          <button
            onClick={onToggleFavorite}
            className="text-gray-400 hover:text-red-500 transition"
          >
            {isFavorite ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Title */}
        <Link href={`/services/${service.slug}`}>
          <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-purple-300 transition">
            {service.title}
          </h3>
        </Link>

        {/* Partner Info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
            {service.partner_profiles?.display_name?.charAt(0).toUpperCase() || 'P'}
          </div>
          <span className="text-sm text-gray-300">
            {service.partner_profiles?.display_name || '파트너'}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-white">
              {service.rating_average?.toFixed(1) || '0.0'}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            ({service.rating_count || 0})
          </span>
          <span className="text-xs text-gray-400">
            · {service.purchase_count || 0}명 구매
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through">
                ₩{service.original_price!.toLocaleString()}
              </p>
            )}
            <p className="text-xl font-bold text-white">
              ₩{service.price.toLocaleString()}
            </p>
          </div>
          <Link
            href={`/services/${service.slug}`}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
          >
            자세히 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
