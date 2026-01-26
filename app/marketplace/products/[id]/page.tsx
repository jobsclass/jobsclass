'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ReviewList } from '@/components/reviews/ReviewList'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ArrowLeft, ShoppingCart, User, MessageCircle } from 'lucide-react'
import { getPlaceholderImage } from '@/lib/storage/image-upload'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  type: string
  image_url?: string
  video_url?: string
  partner_id: string
  created_at: string
}

interface Creator {
  id: string
  business_name?: string
  description?: string
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const supabase = createClient()
  const [productId, setProductId] = useState<string>('')
  const [product, setProduct] = useState<Product | null>(null)
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    loadCurrentUser()
    params.then((p) => {
      setProductId(p.id)
      fetchProduct(p.id)
    })
  }, [])

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }

  const handleContact = async () => {
    if (!currentUserId) {
      router.push('/auth/user/login')
      return
    }

    try {
      // 대화가 이미 존재하는지 확인
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('partner_id', product!.partner_id)
        .eq('client_id', currentUserId)
        .eq('service_id', productId)
        .single()

      if (existing) {
        router.push('/messages')
        return
      }

      // 새로운 대화 생성
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          partner_id: product!.partner_id,
          client_id: currentUserId,
          service_id: productId
        })
        .select()
        .single()

      if (error) throw error

      router.push('/messages')
    } catch (error) {
      console.error('대화 생성 오류:', error)
      alert('문의 시작에 실패했습니다.')
    }
  }

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      const data = await response.json()

      if (data.product) {
        setProduct(data.product)
        // TODO: Fetch creator info
        // fetchCreator(data.product.partner_id)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch product:', error)
      setLoading(false)
    }
  }

  const handlePurchase = () => {
    router.push(`/checkout/${productId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-900">로딩 중...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 mb-4">상품을 찾을 수 없습니다</p>
          <Link href="/marketplace">
            <Button>마켓플레이스로 돌아가기</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/marketplace"
          className="inline-flex items-center text-gray-900 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          마켓플레이스로 돌아가기
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Image and Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Image */}
            <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={getPlaceholderImage(product.category)}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Product Video */}
            {product.video_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">강의 미리보기</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                    {product.video_url.includes('vimeo.com') ? (
                      <iframe
                        src={product.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    ) : product.video_url.includes('youtube.com') || product.video_url.includes('youtu.be') ? (
                      <iframe
                        src={product.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video controls className="w-full h-full">
                        <source src={product.video_url} type="video/mp4" />
                        브라우저가 비디오 재생을 지원하지 않습니다.
                      </video>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                    {product.category}
                  </span>
                  <span className="px-3 py-1 text-sm bg-gray-100 text-gray-900 rounded">
                    {product.type === 'course'
                      ? '온라인 강의'
                      : product.type === 'mentoring'
                      ? '1:1 멘토링'
                      : '디지털 콘텐츠'}
                  </span>
                </div>
                <CardTitle className="text-3xl">{product.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {product.description || '상품 설명이 없습니다.'}
                  </p>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">상품 정보</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-900">카테고리</dt>
                      <dd className="font-medium">{product.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-900">유형</dt>
                      <dd className="font-medium">
                        {product.type === 'course'
                          ? '온라인 강의'
                          : product.type === 'mentoring'
                          ? '1:1 멘토링'
                          : '디지털 콘텐츠'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-900">등록일</dt>
                      <dd className="font-medium">
                        {new Date(product.created_at).toLocaleDateString('ko-KR')}
                      </dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">상품 리뷰</h2>
                {currentUserId && !showReviewForm && (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    variant="outline"
                  >
                    리뷰 작성하기
                  </Button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && currentUserId && (
                <div className="mb-8">
                  <ReviewForm
                    productId={productId}
                    userId={currentUserId}
                    onSuccess={() => {
                      setShowReviewForm(false)
                      // 리뷰 목록 새로고침은 ReviewList 컴포넌트에서 자동으로 처리됨
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              )}

              {/* Review List */}
              <ReviewList
                productId={productId}
                currentUserId={currentUserId || undefined}
              />
            </div>
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardContent className="p-6">
                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-900 mb-1">가격</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {product.price.toLocaleString()}원
                    </p>
                  </div>

                  {/* Purchase Button */}
                  <Button className="w-full mb-3" size="lg" onClick={handlePurchase}>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    구매하기
                  </Button>

                  {/* Contact Button */}
                  <Button 
                    className="w-full mb-4" 
                    size="lg" 
                    variant="outline"
                    onClick={handleContact}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    파트너에게 문의하기
                  </Button>

                  {/* Creator Info */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      파트너
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {creator?.business_name || '파트너'}
                        </p>
                        <p className="text-sm text-gray-900">
                          {creator?.description || ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      제공 내용
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-900">
                      <li className="flex items-center">
                        <span className="mr-2">✓</span>
                        평생 이용 가능
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span>
                        24시간 고객 지원
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span>
                        환불 보장
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
