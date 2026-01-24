import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart } from 'lucide-react'

interface PageProps {
  params: Promise<{ partner: string; service: string }>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary-600">
            {profile.display_name}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Service Header */}
            <div className="p-8 border-b">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                  {getServiceTypeLabel(service.service_type)}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{service.title}</h1>
              <p className="text-xl text-gray-600 mb-6">
                강사: {service.instructor_name}
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  {formatCurrency(service.price)}
                </span>
                {service.discount_price && (
                  <span className="text-2xl text-gray-400 line-through">
                    {formatCurrency(service.discount_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Service Body */}
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4">서비스 소개</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {/* CTA Button */}
              <div className="mt-8 flex gap-4">
                <button className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700">
                  <ShoppingCart className="w-6 h-6" />
                  장바구니 담기
                </button>
                <button className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700">
                  바로 구매
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function getServiceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'online-course': '온라인 강의',
    'offline-course': '오프라인 강의',
    'consulting': '컨설팅',
    'bootcamp': '부트캠프',
    'coaching': '코칭',
    'event': '이벤트',
    'professional-service': '전문 서비스',
  }
  return labels[type] || type
}
