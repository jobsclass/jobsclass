import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Eye, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function ServicesPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('partner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">서비스 관리</h1>
          <p className="text-gray-600 mt-2">등록된 서비스를 관리하세요</p>
        </div>
        <Link
          href="/dashboard/services/new"
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
        >
          <Plus className="w-5 h-5" />
          새 서비스 등록
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        {!services || services.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              아직 등록된 서비스가 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              첫 서비스를 등록하고 판매를 시작하세요!
            </p>
            <Link
              href="/dashboard/services/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
            >
              <Plus className="w-5 h-5" />
              서비스 등록하기
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    서비스명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    타입
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{service.title}</div>
                      <div className="text-sm text-gray-500">{service.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {getServiceTypeLabel(service.service_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(service.price)}
                      </div>
                      {service.discount_price && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatCurrency(service.discount_price)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          service.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {service.is_published ? '공개' : '비공개'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(service.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/services/${service.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
