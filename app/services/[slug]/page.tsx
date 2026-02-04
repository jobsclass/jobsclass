'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { JOBSCLASS_SERVICE_TYPES, calculatePartnerAmount } from '@/lib/constants/jobsclass';

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
  duration_hours: number | null;
  duration_days: number | null;
  features: string[] | null;
  requirements: string[] | null;
  deliverables: string[] | null;
  curriculum: any;
  rating_average: number;
  rating_count: number;
  purchase_count: number;
  view_count: number;
  partner_id: string;
  created_at: string;
  partner_profiles?: {
    display_name: string;
    avatar_url: string | null;
    tagline: string | null;
    rating_average: number;
    rating_count: number;
    total_sales: number;
  };
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  created_at: string;
  buyer_profiles?: {
    display_name: string;
    avatar_url: string | null;
  };
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');

  useEffect(() => {
    if (params.slug) {
      loadService(params.slug as string);
    }
  }, [params.slug]);

  async function loadService(slug: string) {
    try {
      setLoading(true);

      // Load service
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select(`
          *,
          partner_profiles!services_partner_id_fkey(
            display_name,
            avatar_url,
            tagline,
            rating_average,
            rating_count,
            total_sales
          )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (serviceError) throw serviceError;

      setService(serviceData);

      // Increment view count
      await supabase
        .from('services')
        .update({ view_count: (serviceData.view_count || 0) + 1 })
        .eq('id', serviceData.id);

      // Load reviews
      const { data: reviewsData } = await supabase
        .from('service_reviews')
        .select(`
          *,
          buyer_profiles:clients!service_reviews_buyer_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .eq('service_id', serviceData.id)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(10);

      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Failed to load service:', error);
      router.push('/marketplace');
    } finally {
      setLoading(false);
    }
  }

  async function addToCart() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login?redirect=/services/' + service?.slug);
        return;
      }

      // Check if already in cart
      const { data: existing } = await supabase
        .from('carts')
        .select('id')
        .eq('client_id', user.id)
        .eq('service_id', service!.id)
        .single();

      if (existing) {
        alert('이미 장바구니에 있는 서비스입니다.');
        return;
      }

      // Add to cart
      const { error } = await supabase.from('carts').insert({
        client_id: user.id,
        service_id: service!.id,
        quantity: 1,
      });

      if (error) throw error;

      alert('장바구니에 추가되었습니다!');
      router.push('/cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('장바구니 추가에 실패했습니다.');
    }
  }

  async function buyNow() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login?redirect=/services/' + service?.slug);
        return;
      }

      // Create order directly
      router.push(`/orders/new?service_id=${service!.id}`);
    } catch (error) {
      console.error('Failed to buy now:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const typeInfo = JOBSCLASS_SERVICE_TYPES.find((t) => t.id === service.service_type);
  const hasDiscount = service.original_price && service.original_price > service.price;
  const discountRate = hasDiscount
    ? Math.round(((service.original_price! - service.price) / service.original_price!) * 100)
    : 0;
  const partnerAmount = calculatePartnerAmount(service.price);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/marketplace" className="hover:text-white transition">
            마켓플레이스
          </Link>
          <span>/</span>
          <span className="text-white">{service.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6">
              {service.thumbnail_url ? (
                <img
                  src={service.thumbnail_url}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  {typeInfo?.icon}
                </div>
              )}
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                  {discountRate}% 할인
                </div>
              )}
            </div>

            {/* Title & Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                      <span>{typeInfo?.icon}</span>
                      <span>{typeInfo?.name}</span>
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-3">{service.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                      <span className="font-semibold">{service.rating_average?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-400">({service.rating_count || 0})</span>
                    </div>
                    <span>·</span>
                    <span>{service.purchase_count || 0}명 구매</span>
                    <span>·</span>
                    <span>{service.view_count || 0} 조회</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-gray-300" />
                    )}
                  </button>
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                    <ShareIcon className="h-6 w-6 text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Partner Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/20">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg font-bold">
                  {service.partner_profiles?.display_name?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">
                    {service.partner_profiles?.display_name || '파트너'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {service.partner_profiles?.tagline || '전문 파트너'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-400 mb-1">
                    <StarSolidIcon className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {service.partner_profiles?.rating_average?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {service.partner_profiles?.total_sales || 0}건 판매
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 mb-6">
              <div className="flex border-b border-white/20">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                    activeTab === 'overview'
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  개요
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                    activeTab === 'curriculum'
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  커리큘럼
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                    activeTab === 'reviews'
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  리뷰 ({reviews.length})
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">서비스 설명</h3>
                      <p className="text-gray-300 whitespace-pre-wrap">{service.description}</p>
                    </div>

                    {service.features && service.features.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">포함 사항</h3>
                        <ul className="space-y-2">
                          {service.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-300">
                              <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {service.requirements && service.requirements.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">사전 요구사항</h3>
                        <ul className="space-y-2">
                          {service.requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-300">
                              <CheckCircleIcon className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                              <span>{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {service.deliverables && service.deliverables.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">제공물</h3>
                        <ul className="space-y-2">
                          {service.deliverables.map((deliverable, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-300">
                              <CheckCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div>
                    {service.curriculum ? (
                      <div className="text-gray-300">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(service.curriculum, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-8">
                        커리큘럼 정보가 없습니다.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">
                        아직 리뷰가 없습니다.
                      </p>
                    ) : (
                      reviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                                {review.buyer_profiles?.display_name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="text-white font-semibold">
                                  {review.buyer_profiles?.display_name || '구매자'}
                                </p>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <StarSolidIcon
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating ? 'text-yellow-400' : 'text-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.title && (
                            <h4 className="text-white font-semibold mb-1">{review.title}</h4>
                          )}
                          <p className="text-gray-300 text-sm">{review.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 sticky top-4">
              {/* Price */}
              <div className="mb-6">
                {hasDiscount && (
                  <p className="text-gray-400 line-through text-lg mb-1">
                    ₩{service.original_price!.toLocaleString()}
                  </p>
                )}
                <p className="text-3xl font-bold text-white mb-2">
                  ₩{service.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">
                  파트너 수령액: ₩{partnerAmount.toLocaleString()} (90%)
                </p>
              </div>

              {/* Duration */}
              {(service.duration_hours || service.duration_days) && (
                <div className="flex items-center gap-2 text-gray-300 mb-6">
                  <ClockIcon className="h-5 w-5 text-purple-400" />
                  <span>
                    {service.duration_hours && `${service.duration_hours}시간`}
                    {service.duration_hours && service.duration_days && ' · '}
                    {service.duration_days && `${service.duration_days}일`}
                  </span>
                </div>
              )}

              {/* Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={buyNow}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                >
                  바로 구매하기
                </button>
                <button
                  onClick={addToCart}
                  className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition flex items-center justify-center gap-2"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  장바구니 담기
                </button>
              </div>

              {/* Additional Info */}
              <div className="pt-6 border-t border-white/20 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <UserGroupIcon className="h-5 w-5 text-purple-400" />
                  <span>{service.purchase_count || 0}명이 구매했어요</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  <span>100% 환불 보장</span>
                </div>
              </div>

              {/* Commission Info */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-xs text-gray-400 text-center">
                  💡 플랫폼 수수료 10% 포함
                  <br />
                  파트너가 90%를 수령합니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
