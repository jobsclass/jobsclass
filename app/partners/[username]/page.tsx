'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { 
  MapPin, 
  Mail, 
  Globe, 
  Star, 
  Users, 
  Award,
  Calendar,
  Package,
  MessageCircle,
  ExternalLink
} from 'lucide-react'

type Partner = {
  id: string
  display_name: string
  username: string
  avatar_url?: string
  bio?: string
  tagline?: string
  expertise?: string[]
  social_links?: any
  location?: string
  website_url?: string
  rating_average: number
  rating_count: number
  total_sales: number
}

type Service = {
  id: string
  title: string
  description: string
  price: number
  category: string
  thumbnail_url?: string
  rating_average: number
  purchase_count: number
}

type Review = {
  id: string
  rating: number
  title?: string
  content: string
  created_at: string
  buyer: {
    display_name: string
  }
}

export default function PartnerPage({ params }: { params: Promise<{ username: string }> }) {
  const [username, setUsername] = useState<string>('')
  const [partner, setPartner] = useState<Partner | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('profile')

  useEffect(() => {
    params.then(p => {
      setUsername(p.username)
      fetchPartnerData(p.username)
    })
  }, [])

  const fetchPartnerData = async (username: string) => {
    try {
      // Fetch partner profile
      const profileRes = await fetch(`/api/partners/${username}`)
      if (!profileRes.ok) throw new Error('Partner not found')
      const profileData = await profileRes.json()
      setPartner(profileData.partner)

      // Fetch partner services
      const servicesRes = await fetch(`/api/products?partnerId=${profileData.partner.id}&status=published`)
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData.products || [])
      }

      // Fetch reviews (TODO: create reviews API)
      // For now, mock data
      setReviews([])
    } catch (error) {
      console.error('Error fetching partner data:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-96">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">파트너를 찾을 수 없습니다</h1>
          <Link href="/marketplace" className="text-blue-600 hover:underline">
            마켓플레이스로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Header />
      
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 py-4 overflow-x-auto">
            {[
              { id: 'profile', label: '프로필' },
              { id: 'services', label: '서비스' },
              { id: 'reviews', label: '리뷰' },
              { id: 'contact', label: '연락처' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="profile" className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                {partner.avatar_url ? (
                  <img src={partner.avatar_url} alt={partner.display_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  partner.display_name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-black text-gray-900 mb-2">
                  {partner.display_name}
                </h1>
                {partner.tagline && (
                  <p className="text-xl text-gray-600 mb-4">{partner.tagline}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-bold text-gray-900">
                      {partner.rating_average.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({partner.rating_count}개 리뷰)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      {partner.total_sales}명 고객
                    </span>
                  </div>
                </div>

                {/* Expertise */}
                {partner.expertise && partner.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {partner.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bio */}
                {partner.bio && (
                  <p className="text-gray-700 leading-relaxed mb-6">{partner.bio}</p>
                )}

                {/* Location & Website */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {partner.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{partner.location}</span>
                    </div>
                  )}
                  {partner.website_url && (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      <span>웹사이트 방문</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">제공 서비스</h2>
          
          {services.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              아직 등록된 서비스가 없습니다.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/marketplace/products/${service.id}`}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  {service.thumbnail_url && (
                    <div className="aspect-video bg-gray-200">
                      <img
                        src={service.thumbnail_url}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        {service.price.toLocaleString()}원
                      </span>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{service.rating_average.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{service.purchase_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">클라이언트 리뷰</h2>
          
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">아직 리뷰가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-lg font-bold text-gray-900">
                      {review.rating}.0
                    </span>
                  </div>
                  
                  {review.title && (
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{review.title}</h3>
                  )}
                  
                  <p className="text-gray-700 mb-4">{review.content}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium">{review.buyer.display_name}</span>
                    <span>•</span>
                    <span>{new Date(review.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
            <p className="text-xl mb-8 opacity-90">
              {partner.display_name}님과 함께 성장하세요
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#services"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('services')
                }}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                서비스 둘러보기
              </Link>
              {partner.website_url && (
                <a
                  href={partner.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
                >
                  웹사이트 방문
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
