'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { BookOpen, CheckCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Enrollment {
  id: string
  started_watching: boolean
  completed: boolean
  created_at: string
  service: {
    id: string
    title: string
    thumbnail_url: string | null
    slug: string
    partner_id: string
  }
  partner: {
    profile_url: string
  }
}

export default function MyEnrollmentsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/auth/buyer/login')
          return
        }

        const { data: buyer, error: buyerError } = await supabase
          .from('buyers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (buyerError || !buyer) {
          alert('구매자 정보를 찾을 수 없습니다')
          router.push('/auth/buyer/login')
          return
        }

        const { data: items, error: enrollmentError } = await supabase
          .from('enrollments')
          .select(`
            id,
            started_watching,
            completed,
            created_at,
            services (
              id,
              title,
              thumbnail_url,
              slug,
              partner_id
            )
          `)
          .eq('buyer_id', buyer.id)
          .order('created_at', { ascending: false })

        if (enrollmentError) throw enrollmentError

        if (items && items.length > 0) {
          const partnerIds = items.map((item: any) => item.services.partner_id)
          const { data: partners, error: partnerError } = await supabase
            .from('partner_profiles')
            .select('user_id, profile_url')
            .in('user_id', partnerIds)

          if (partnerError) throw partnerError

          const partnersMap = partners?.reduce((acc: any, p: any) => {
            acc[p.user_id] = p
            return acc
          }, {})

          const formattedItems = items.map((item: any) => ({
            id: item.id,
            started_watching: item.started_watching,
            completed: item.completed,
            created_at: item.created_at,
            service: item.services,
            partner: partnersMap[item.services.partner_id],
          }))

          setEnrollments(formattedItems)
        }
      } catch (err: any) {
        console.error('Load error:', err)
        alert('수강 목록을 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    loadEnrollments()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">수강 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="bg-gray-950/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold text-white">Corefy</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/cart"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                장바구니
              </Link>
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">내 수강 목록</h1>

          {enrollments.length === 0 ? (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">아직 수강 중인 강의가 없습니다</h2>
              <p className="text-gray-400 mb-6">관심있는 서비스를 구매해보세요</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all"
              >
                서비스 둘러보기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all"
                >
                  {/* 썸네일 */}
                  <div className="h-48 bg-gradient-to-br from-primary-600/20 to-purple-600/20 relative overflow-hidden">
                    {enrollment.service.thumbnail_url ? (
                      <img
                        src={enrollment.service.thumbnail_url}
                        alt={enrollment.service.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        📚
                      </div>
                    )}
                    {enrollment.completed && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        완료
                      </div>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                      {enrollment.service.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(enrollment.created_at)} 구매</span>
                    </div>
                    <Link
                      href={`/p/${enrollment.partner.profile_url}/${enrollment.service.slug}`}
                      className="block w-full text-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all"
                    >
                      {enrollment.started_watching ? '이어보기' : '학습 시작'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
