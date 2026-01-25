'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, CheckCircle } from 'lucide-react'

interface CartItem {
  id: string
  service_id: string
  quantity: number
  service: {
    id: string
    title: string
    base_price: number
    partner_id: string
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [buyerId, setBuyerId] = useState<string | null>(null)

  useEffect(() => {
    const loadCart = async () => {
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

        setBuyerId(buyer.id)

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
              partner_id
            )
          `)
          .eq('buyer_id', buyer.id)

        if (cartError) throw cartError

        const formattedItems = items?.map((item: any) => ({
          id: item.id,
          service_id: item.service_id,
          quantity: item.quantity,
          service: item.services,
        })) || []

        if (formattedItems.length === 0) {
          alert('장바구니가 비어있습니다')
          router.push('/cart')
          return
        }

        setCartItems(formattedItems)
      } catch (err: any) {
        console.error('Load error:', err)
        alert('주문 정보를 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  const handleCheckout = async () => {
    if (!buyerId) return

    setProcessing(true)

    try {
      // 각 서비스에 대해 주문 생성
      for (const item of cartItems) {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`
        const amount = item.service.base_price || 0

        // 주문 생성
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            partner_id: item.service.partner_id,
            buyer_id: buyerId,
            service_id: item.service_id,
            amount: amount,
            discount_amount: 0,
            final_amount: amount,
            status: 'completed',
            payment_method: 'card',
          })
          .select()
          .single()

        if (orderError) throw orderError

        // 수강 등록 생성
        const { error: enrollmentError } = await supabase
          .from('enrollments')
          .insert({
            order_id: order.id,
            service_id: item.service_id,
            buyer_id: buyerId,
            started_watching: false,
            completed: false,
          })

        if (enrollmentError) throw enrollmentError

        // 장바구니에서 제거
        const { error: deleteError } = await supabase
          .from('carts')
          .delete()
          .eq('id', item.id)

        if (deleteError) throw deleteError
      }

      alert('결제가 완료되었습니다! 구매하신 서비스를 이용해보세요.')
      router.push('/my/enrollments')
    } catch (err: any) {
      console.error('Checkout error:', err)
      alert('결제 처리 중 오류가 발생했습니다: ' + err.message)
    } finally {
      setProcessing(false)
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
          <p className="text-gray-400">주문 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="bg-gray-950/50 backdrop-blur-xl border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold text-white">Corefy</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">결제하기</h1>

          {/* 주문 상품 */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">주문 상품</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="text-white">{item.service.title}</span>
                  <span className="text-primary-400 font-semibold">
                    {formatCurrency(item.service.base_price || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">결제 정보</h2>
            
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

            <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <CreditCard className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-primary-400 font-semibold mb-1">간편 결제 (테스트 모드)</p>
                  <p className="text-sm text-gray-400">
                    실제 결제는 진행되지 않습니다. 테스트용 주문이 생성됩니다.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>처리 중...</>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {formatCurrency(totalAmount)} 결제하기
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
