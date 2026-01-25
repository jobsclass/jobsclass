import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

export default async function PartnerPublicPage({
  params,
}: {
  params: Promise<{ partner: string }>
}) {
  const { partner } = await params
  const supabase = await createClient()

  // 파트너 프로필 가져오기
  const { data: profile } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('profile_url', partner)
    .single()

  if (!profile) {
    notFound()
  }

  // 파트너의 공개된 서비스 가져오기
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('partner_id', profile.user_id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-900/20 via-dark-900 to-accent-900/20 border-b border-dark-800">
        <div className="max-w-5xl mx-auto px-4 py-16">
          {/* 프로필 정보 */}
          <div className="text-center mb-12">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-primary-500/20"
              />
            ) : (
              <div className="w-32 h-32 rounded-full mx-auto mb-6 bg-gradient-primary flex items-center justify-center">
                <span className="text-5xl font-bold text-white">
                  {profile.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            <h1 className="text-5xl font-bold text-white mb-4">
              {profile.display_name}
            </h1>
            
            {profile.bio && (
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="mt-6 flex items-center justify-center gap-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 text-sm font-medium">
                {profile.subscription_plan} 플랜
              </span>
              {profile.early_bird && (
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20 text-sm font-medium">
                  얼리버드 🎉
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">
            제공하는 서비스
          </h2>
          <p className="text-gray-400">
            {profile.display_name}님이 제공하는 서비스를 확인하세요
          </p>
        </div>

        {!services || services.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-400 text-lg">
              아직 등록된 서비스가 없습니다
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service: any) => (
              <Link
                key={service.id}
                href={`/p/${partner}/${service.slug}`}
                className="card group hover:border-primary-500/30 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* 썸네일 */}
                {service.thumbnail_url ? (
                  <div className="aspect-video mb-4 rounded-xl overflow-hidden bg-dark-800">
                    <img
                      src={service.thumbnail_url}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-video mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-primary-900/20 to-accent-900/20 flex items-center justify-center">
                    <span className="text-6xl">📦</span>
                  </div>
                )}

                {/* 서비스 정보 */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  {/* 가격 */}
                  <div className="flex items-center justify-between">
                    <div>
                      {service.discount_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 line-through text-sm">
                            {formatCurrency(service.base_price)}
                          </span>
                          <span className="text-2xl font-bold text-primary-400">
                            {formatCurrency(service.discount_price)}
                          </span>
                        </div>
                      ) : service.base_price ? (
                        <span className="text-2xl font-bold text-white">
                          {formatCurrency(service.base_price)}
                        </span>
                      ) : (
                        <span className="text-lg text-gray-400">가격 문의</span>
                      )}
                    </div>
                    
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-dark-800 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 text-sm">
            Powered by{' '}
            <Link href="/" className="text-primary-400 hover:text-primary-300 font-semibold">
              Corefy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
