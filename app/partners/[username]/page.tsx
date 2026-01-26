'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  ShoppingBag, 
  Star,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Mail
} from 'lucide-react'

interface Creator {
  id: string
  user_id: string
  business_name: string
  business_number?: string
  bank_name?: string
  account_number?: string
  created_at: string
}

interface Product {
  id: string
  partner_id: string
  title: string
  description: string
  price: number
  category: string
  type: string
  status: string
  image_url?: string
  created_at: string
}

export default function CreatorPublicProfilePage() {
  const params = useParams()
  const username = params?.username as string
  
  const [creator, setCreator] = useState<Creator | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (username) {
      loadCreatorProfile()
    }
  }, [username])

  async function loadCreatorProfile() {
    try {
      setLoading(true)
      setError('')

      // 파트너 정보 조회 (username으로 검색)
      const creatorResponse = await fetch(`/api/partners?username=${username}`)
      if (!creatorResponse.ok) {
        throw new Error('파트너를 찾을 수 없습니다')
      }
      const partnerData = await creatorResponse.json()
      setCreator(partnerData)

      // 공개 상품 조회
      const productsResponse = await fetch(`/api/products?partner_id=${partnerData.id}&status=published`)
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
      }
    } catch (err: any) {
      setError(err.message || '프로필을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'programming': '프로그래밍/개발',
      'it-cloud': 'IT/클라우드',
      'design': '디자인/UX',
      'data-ai': '데이터/AI',
      'marketing': '마케팅/광고',
      'business': '비즈니스/전략',
      'finance': '재무/회계',
      'job-english': '직무영어/글로벌',
      'certification': '자격증/시험',
      'career': '커리어/이직'
    }
    return categories[category] || category
  }

  const getTypeName = (type: string) => {
    const types: Record<string, string> = {
      'course': '온라인 강의',
      'mentoring': '1:1 멘토링',
      'digital': '디지털 콘텐츠'
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900">프로필을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <User className="h-16 w-16 text-gray-900 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">파트너를 찾을 수 없습니다</h2>
            <p className="text-gray-900 mb-6">{error || 'URL을 확인해주세요'}</p>
            <Link 
              href="/marketplace"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              마켓플레이스로 이동
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-bold text-blue-600">
                {creator.business_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-4xl font-black mb-4">{creator.business_name}</h1>
            <p className="text-xl opacity-90">일자리 경쟁력을 높이는 전문 파트너</p>
            
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold">{products.length}</div>
                <div className="text-sm opacity-80">등록 상품</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  <Star className="h-8 w-8 inline fill-yellow-300 text-yellow-300" />
                </div>
                <div className="text-sm opacity-80">전문가</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">상품 · 서비스</h2>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <ShoppingBag className="h-4 w-4 mr-2" />
                {products.length}개 상품
              </Badge>
            </div>

            {products.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <ShoppingBag className="h-16 w-16 text-gray-900 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">준비 중입니다</h3>
                  <p className="text-gray-900">곧 멋진 상품들이 등록될 예정입니다</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link 
                    key={product.id}
                    href={`/marketplace/products/${product.id}`}
                    className="block group"
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all transform group-hover:-translate-y-2">
                      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-6xl font-bold text-white">
                            {product.title.charAt(0)}
                          </span>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">
                            {getCategoryName(product.category)}
                          </Badge>
                          <Badge variant="outline">
                            {getTypeName(product.type)}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition">
                          {product.title}
                        </h3>
                        <p className="text-gray-900 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-2xl font-bold text-blue-600">
                            ₩{product.price.toLocaleString()}
                          </div>
                          <div className="text-blue-600 font-semibold group-hover:translate-x-1 transition">
                            구매하기 →
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-900">
            <p className="mb-2">
              Powered by{' '}
              <Link href="/" className="text-blue-600 hover:underline font-semibold">
                JobsClass
              </Link>
            </p>
            <p className="text-sm text-gray-900">
              일자리 경쟁력 강화를 위한 전문가 매칭 플랫폼
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
