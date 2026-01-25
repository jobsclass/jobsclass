'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface CartItem {
  id: string
  service_id: string
  quantity: number
  service: {
    id: string
    title: string
    base_price: number
    thumbnail_url: string | null
    slug: string
    partner_id: string
  }
  partner: {
    profile_url: string
  }
}

export default function CartPage() {
  const router = useRouter()
  const supabase = createClient()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [buyerId, setBuyerId] = useState<string | null>(null)

  useEffect(() => {
    const loadCart = async () => {
      try {
        // 로그인 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/auth/buyer/login')
          return
        }

        // buyer_id 조회
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

        setBuyerId(buyer.id)

        // 장바구니 아이템 조회 (서비스 정보 포함)
        const { data: items, error: cartError } = await supabase
          .from('carts')
          .select(`
            id,
            service_id,
            quantity,
            services (
              id,
              title,
              base_price,
              thumbnail_url,
              slug,
              partner_id
            )
          `)
          .eq('buyer_id', buyer.id)

        if (cartError) throw cartError

        // 파트너 정보 조회
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
            service_id: item.service_id,
            quantity: item.quantity,
            service: item.services,
            partner: partnersMap[item.services.partner_id],
          }))

          setCartItems(formattedItems)
        }
      } catch (err: any) {
        console.error('Load cart error:', err)
        alert('장바구니를 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  const handleRemove = async (cartItemId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', cartItemId)

      if (error) throw error

      setCartItems(cartItems.filter(item => item.id !== cartItemId))
      alert('삭제되었습니다')
    } catch (err: any) {
      console.error('Remove error:', err)
      alert('삭제에 실패했습니다')
    }
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + (item.service.base_price || 0) * item.quantity
  }, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">장바구니를 불러오는 중...</p>
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
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">장바구니</h1>

          {cartItems.length === 0 ? (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">장바구니가 비어있습니다</h2>
              <p className="text-gray-400 mb-6">관심있는 서비스를 담아보세요</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all"
              >
                서비스 둘러보기
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {/* 장바구니 아이템 */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 flex items-center gap-6"
                  >
                    {/* 썸네일 */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-primary-600/20 to-purple-600/20 rounded-xl overflow-hidden">
                      {item.service.thumbnail_url ? (
                        <img
                          src={item.service.thumbnail_url}
                          alt={item.service.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          📚
                        </div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1">
                      <Link
                        href={`/p/${item.partner.profile_url}/${item.service.slug}`}
                        className="text-xl font-bold text-white hover:text-primary-400 transition-colors"
                      >
                        {item.service.title}
                      </Link>
                      <p className="text-2xl font-bold text-primary-400 mt-2">
                        {formatCurrency(item.service.base_price || 0)}
                      </p>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* 주문 요약 */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">주문 요약</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">상품 금액</span>
                    <span className="text-white font-semibold">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">할인</span>
                    <span className="text-white font-semibold">-₩0</span>
                  </div>
                  <div className="h-px bg-gray-800"></div>
                  <div className="flex items-center justify-between text-xl">
                    <span className="text-white font-bold">총 결제 금액</span>
                    <span className="text-primary-400 font-bold">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full text-center px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-lg font-semibold transition-all"
                >
                  결제하기 ({cartItems.length}개)
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
