import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart, Tag, Clock, Users, Star } from 'lucide-react'
import { getCategoryById, getSubcategoryById } from '@/lib/categories'
import Link from 'next/link'
import { Metadata } from 'next'
import AddToCartButton from '@/components/cart/AddToCartButton'

interface PageProps {
  params: Promise<{ partner: string; service: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { partner, service: serviceSlug } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('partner_profiles')
    .select('*, user_id')
    .eq('profile_url', partner)
    .single()

  if (!profile) {
    return {
      title: '서비스를 찾을 수 없습니다',
    }
  }

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('partner_id', profile.user_id)
    .eq('slug', serviceSlug)
    .eq('is_published', true)
    .single()

  if (!service) {
    return {
      title: '서비스를 찾을 수 없습니다',
    }
  }

  return {
    title: `${service.title} - ${profile.display_name} | Corefy`,
    description: service.description?.substring(0, 160) || `${service.title}을(를) 배워보세요`,
    openGraph: {
      title: service.title,
      description: service.description?.substring(0, 160) || `${service.title}을(를) 배워보세요`,
      images: service.thumbnail_url ? [service.thumbnail_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: service.title,
      description: service.description?.substring(0, 160) || `${service.title}을(를) 배워보세요`,
      images: service.thumbnail_url ? [service.thumbnail_url] : [],
    },
  }
}

export default async function PublicServicePage({ params }: PageProps) {
  const { partner, service: serviceSlug } = await params
  const supabase = await createClient()

  // 파트너 찾기
  const { data: profile } = await supabase
    .from('partner_profiles')
    .select('*, user_id')
    .eq('profile_url', partner)
    .single()

  if (!profile) return notFound()

  // 서비스 찾기
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('partner_id', profile.user_id)
    .eq('slug', serviceSlug)
    .eq('is_published', true)
    .single()

  if (!service) return notFound()

  const category = service.category_1 ? getCategoryById(service.category_1) : null
  const subcategory =
    service.category_1 && service.category_2
      ? getSubcategoryById(service.category_1, service.category_2)
      : null
  
  // 태그 파싱
  const tags = service.tags ? (typeof service.tags === 'string' ? JSON.parse(service.tags) : service.tags) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="bg-gray-950/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/p/${partner}`} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {profile.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{profile.display_name}</h1>
                <p className="text-xs text-gray-400">Creator</p>
              </div>
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 메인 컨텐츠 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Header */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
                {/* 카테고리 및 뱃지 */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-full text-sm font-semibold">
                      {category.name}
                    </span>
                  )}
                  {subcategory && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-sm font-semibold">
                      {subcategory.name}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {service.title}
                </h1>

                <div className="flex items-center gap-6 text-gray-400 mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{service.instructor_name}</span>
                  </div>
                  {service.instructor_bio && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span>전문가</span>
                    </div>
                  )}
                </div>

                {/* 태그 */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Description */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">서비스 소개</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Instructor Bio */}
              {service.instructor_bio && (
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">강사 소개</h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {service.instructor_bio}
                  </p>
                </div>
              )}
            </div>

            {/* 사이드바 - 구매 카드 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
                    {/* 가격 */}
                    <div className="mb-6">
                      {service.base_price ? (
                        <>
                          <div className="text-4xl font-bold text-white mb-2">
                            {formatCurrency(service.base_price)}
                          </div>
                          {service.discount_price && (
                            <div className="text-xl text-gray-500 line-through">
                              {formatCurrency(service.discount_price)}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-2xl font-semibold text-gray-400">가격 문의</div>
                      )}
                    </div>

                    {/* CTA 버튼 */}
                    <div className="space-y-3">
                      <AddToCartButton serviceId={service.id} serviceName={service.title} />
                      <Link
                        href={`/checkout?service=${service.id}`}
                        className="block w-full px-6 py-4 bg-gray-800 text-white text-center border border-gray-700 rounded-xl text-lg font-semibold hover:bg-gray-700 transition-colors"
                      >
                        바로 구매
                      </Link>
                    </div>

                    {/* 추가 정보 */}
                    <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">카테고리</span>
                        <span className="text-white font-medium">
                          {category?.name || '미분류'}
                        </span>
                      </div>
                      {subcategory && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">세부 분류</span>
                          <span className="text-white font-medium">{subcategory.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
