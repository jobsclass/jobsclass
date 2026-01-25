import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Eye, Sparkles } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getCategoryById, getSubcategoryById } from '@/lib/categories'

export default async function ServicesPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // 파트너 프로필 가져오기
  const { data: profile } = await supabase
    .from('partner_profiles')
    .select('profile_url')
    .eq('user_id', user.id)
    .single()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('partner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">서비스 관리</h1>
          <p className="text-gray-400 text-lg">등록된 서비스를 관리하세요</p>
        </div>
        <Link
          href="/dashboard/services/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/20 transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          새 서비스 등록
        </Link>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
        {!services || services.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl mb-6 shadow-lg shadow-primary-500/20">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              아직 등록된 서비스가 없습니다
            </h3>
            <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
              첫 서비스를 등록하고 판매를 시작하세요! 30분이면 충분합니다.
            </p>
            <Link
              href="/dashboard/services/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/20 transition-all font-semibold text-lg"
            >
              <Plus className="w-6 h-6" />
              서비스 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} profileUrl={profile?.profile_url} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ServiceCard({ service, profileUrl }: { service: any; profileUrl?: string }) {
  const category = service.category_1 ? getCategoryById(service.category_1) : null
  const subcategory =
    service.category_1 && service.category_2
      ? getSubcategoryById(service.category_1, service.category_2)
      : null

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
      <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all">
        {/* 썸네일 또는 플레이스홀더 */}
        <div className="h-40 bg-gradient-to-br from-primary-600/20 to-purple-600/20 flex items-center justify-center relative overflow-hidden">
          {service.thumbnail_url ? (
            <img
              src={service.thumbnail_url}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl">📚</div>
          )}
          <div className="absolute top-3 right-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                service.is_published
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
              }`}
            >
              {service.is_published ? '공개' : '비공개'}
            </span>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="p-5">
          {/* 카테고리 */}
          {category && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-full">
                {category.name}
              </span>
              {subcategory && (
                <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-full">
                  {subcategory.name}
                </span>
              )}
            </div>
          )}

          {/* 제목 */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
            {service.title}
          </h3>

          {/* 설명 */}
          <p className="text-sm text-gray-400 line-clamp-2 mb-4">{service.description}</p>

          {/* 가격 */}
          <div className="flex items-center justify-between mb-4">
            <div>
              {service.base_price ? (
                <>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(service.base_price)}
                  </div>
                  {service.discount_price && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatCurrency(service.discount_price)}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-lg font-semibold text-gray-500">가격 미정</div>
              )}
            </div>
            <div className="text-xs text-gray-500">{formatDate(service.created_at)}</div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <Link
              href={`/dashboard/services/${service.id}/edit`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              수정
            </Link>
            <Link
              href={`/p/${profileUrl}/${service.slug}`}
              target="_blank"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600/10 text-primary-400 border border-primary-500/20 rounded-lg hover:bg-primary-600/20 transition-colors text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              미리보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
