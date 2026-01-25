'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart } from 'lucide-react'

interface AddToCartButtonProps {
  serviceId: string
  serviceName: string
}

export default function AddToCartButton({ serviceId, serviceName }: AddToCartButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleAddToCart = async () => {
    setLoading(true)

    try {
      // 로그인 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        alert('로그인이 필요합니다')
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
        alert('구매자 정보를 찾을 수 없습니다. 다시 로그인해주세요.')
        router.push('/auth/buyer/login')
        return
      }

      // 장바구니에 추가 (이미 있으면 무시)
      const { error: insertError } = await supabase
        .from('carts')
        .insert({
          buyer_id: buyer.id,
          service_id: serviceId,
          quantity: 1,
        })

      if (insertError) {
        // 이미 장바구니에 있는 경우
        if (insertError.code === '23505') {
          alert('이미 장바구니에 담긴 서비스입니다')
          router.push('/cart')
          return
        }
        throw insertError
      }

      alert(`"${serviceName}"이(가) 장바구니에 담겼습니다!`)
      router.push('/cart')
    } catch (err: any) {
      console.error('Add to cart error:', err)
      alert('장바구니 담기에 실패했습니다: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ShoppingCart className="w-5 h-5" />
      {loading ? '담는 중...' : '장바구니 담기'}
    </button>
  )
}
