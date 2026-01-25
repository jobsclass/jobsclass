'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Zap, Sparkles, LayoutGrid, TrendingUp, Shield, Rocket, Users, ShoppingBag, BookOpen, Star } from 'lucide-react'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'seller' | 'buyer'>('seller')

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navbar - Spotify Style */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-dark-800/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold text-white">Corefy</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="btn-ghost text-sm"
            >
              서비스 탐색
            </Link>
            <Link
              href="/auth/partner/login"
              className="btn-ghost text-sm"
            >
              로그인
            </Link>
            <Link
              href="/auth/partner/signup"
              className="btn-primary text-sm"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Tab Switcher */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-950 to-accent-900/20"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto text-center relative z-10">
          {/* Tab Switcher */}
          <div className="inline-flex items-center gap-2 p-2 bg-dark-900 border border-dark-800 rounded-full mb-8">
            <button
              onClick={() => setActiveTab('seller')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'seller'
                  ? 'bg-gradient-primary text-white shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🚀 판매자
            </button>
            <button
              onClick={() => setActiveTab('buyer')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'buyer'
                  ? 'bg-gradient-primary text-white shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💎 구매자
            </button>
          </div>

          {/* Seller Content */}
          {activeTab === 'seller' && (
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-8">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-primary-300 font-medium">AI 기반 웹사이트 자동 생성</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-6">
                <span className="text-gradient">당신의 지식</span>을
                <br />
                <span className="text-white">수익으로 바꾸세요</span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                온라인 강의, 멘토링, 컨설팅, 코칭까지<br />
                <span className="text-white font-semibold">30분 만에 전문가 웹사이트</span> 완성하고<br />
                <span className="text-primary-400 font-semibold">첫 수익 창출 시작</span>
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-16">
                <Link
                  href="/auth/partner/signup"
                  className="btn-primary text-lg flex items-center gap-2 group"
                >
                  무료로 시작하기
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#seller-features"
                  className="btn-secondary text-lg"
                >
                  더 알아보기
                </Link>
              </div>

              {/* Seller Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="card text-center">
                  <div className="text-4xl font-bold text-gradient mb-2">30분</div>
                  <div className="text-sm text-gray-400">평균 셋업 시간</div>
                </div>
                <div className="card text-center">
                  <div className="text-4xl font-bold text-gradient mb-2">5%</div>
                  <div className="text-sm text-gray-400">최저 수수료 (PRO)</div>
                </div>
                <div className="card text-center">
                  <div className="text-4xl font-bold text-gradient mb-2">100%</div>
                  <div className="text-sm text-gray-400">폼 기반 자동화</div>
                </div>
              </div>
            </div>
          )}

          {/* Buyer Content */}
          {activeTab === 'buyer' && (
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 border border-accent-500/20 rounded-full mb-8">
                <Star className="w-4 h-4 text-accent-400" />
                <span className="text-sm text-accent-300 font-medium">검증된 전문가와 함께</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-6">
                <span className="text-gradient">최고의 전문가</span>에게
                <br />
                <span className="text-white">배우세요</span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                IT, 디자인, 마케팅, 재테크까지<br />
                <span className="text-white font-semibold">1:1 맞춤형 학습</span>으로<br />
                <span className="text-accent-400 font-semibold">당신의 커리어를 성장</span>시키세요
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-16">
                <Link
                  href="/explore"
                  className="btn-primary text-lg flex items-center gap-2 group"
                >
                  서비스 둘러보기
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#buyer-features"
                  className="btn-secondary text-lg"
                >
                  더 알아보기
                </Link>
              </div>

              {/* Buyer Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="card text-center">
                  <div className="text-4xl font-bold text-gradient mb-2">1,000+</div>
                  <div className="text-sm text-gray-400">전문가 서비스</div>
                </div>
                <div className="card text-center">
                  <div className="text-4xl font-bold text-gradient mb-2">4.8★</div>
                  <div className="text-sm text-gray-400">평균 만족도</div>
                </div>
                <div className="card text-center">
                  <div className="text-4xl font-bold text-gradient mb-2">24시간</div>
                  <div className="text-sm text-gray-400">평균 응답 시간</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Conditional */}
      {activeTab === 'seller' && (
        <section id="seller-features" className="py-20 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                왜 <span className="text-gradient">Corefy</span>인가요?
              </h2>
              <p className="text-xl text-gray-400">
                1인 프리랜서, 1인 창업가, 1인 에이전시를 위한 맞춤 솔루션
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="다양한 수익 모델"
                description="온라인 강의, 멘토링, 외주, 협업까지. 당신의 모든 비즈니스를 한 곳에서."
                gradient="from-yellow-500 to-orange-500"
              />
              <FeatureCard
                icon={<Sparkles className="w-8 h-8" />}
                title="AI 자동 생성"
                description="서비스 설명, 커리큘럼, 가격까지 AI가 추천. 고민하지 말고 바로 시작하세요."
                gradient="from-primary-500 to-accent-500"
              />
              <FeatureCard
                icon={<LayoutGrid className="w-8 h-8" />}
                title="폼 기반 간편 등록"
                description="드래그앤드롭 없이 내용만 입력. 30분 만에 프로페셔널한 홈페이지 완성."
                gradient="from-cyan-500 to-blue-500"
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8" />}
                title="투명한 수수료"
                description="FREE 10%, STARTER 7%, PRO 5%. 숨겨진 비용 제로."
                gradient="from-green-500 to-emerald-500"
              />
              <FeatureCard
                icon={<Rocket className="w-8 h-8" />}
                title="독립 쇼핑몰"
                description="플랫폼 종속 없이 나만의 브랜드로. 고객 데이터도 내 것."
                gradient="from-pink-500 to-rose-500"
              />
              <FeatureCard
                icon={<TrendingUp className="w-8 h-8" />}
                title="성장 도구"
                description="실시간 분석, 쿠폰, 멤버십까지. 비즈니스 성장을 위한 모든 도구."
                gradient="from-purple-500 to-indigo-500"
              />
            </div>
          </div>
        </section>
      )}

      {activeTab === 'buyer' && (
        <section id="buyer-features" className="py-20 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                왜 <span className="text-gradient">Corefy</span>에서 배워야 할까요?
              </h2>
              <p className="text-xl text-gray-400">
                검증된 전문가와 함께 성장하세요
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Users className="w-8 h-8" />}
                title="검증된 전문가"
                description="실무 경험이 풍부한 전문가들이 직접 가르칩니다. 포트폴리오와 리뷰로 검증됨."
                gradient="from-blue-500 to-cyan-500"
              />
              <FeatureCard
                icon={<BookOpen className="w-8 h-8" />}
                title="1:1 맞춤 학습"
                description="나에게 딱 맞는 커리큘럼. 온라인 강의부터 1:1 멘토링까지 선택 가능."
                gradient="from-purple-500 to-pink-500"
              />
              <FeatureCard
                icon={<Star className="w-8 h-8" />}
                title="합리적인 가격"
                description="중간 수수료 없이 전문가와 직거래. 쿠폰과 할인 이벤트로 더 저렴하게."
                gradient="from-orange-500 to-red-500"
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8" />}
                title="안전한 결제"
                description="Toss Payments 연동으로 안전한 결제. 만족하지 못하면 환불 가능."
                gradient="from-green-500 to-emerald-500"
              />
              <FeatureCard
                icon={<Rocket className="w-8 h-8" />}
                title="빠른 시작"
                description="회원가입 후 바로 학습 시작. 언제 어디서나 내 강의실에 접속."
                gradient="from-indigo-500 to-blue-500"
              />
              <FeatureCard
                icon={<TrendingUp className="w-8 h-8" />}
                title="커리어 성장"
                description="수료증 발급과 포트폴리오 관리. 배운 내용을 커리어로 연결."
                gradient="from-pink-500 to-rose-500"
              />
            </div>
          </div>
        </section>
      )}

      {/* How It Works - Conditional */}
      <section className="py-20 px-6 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {activeTab === 'seller' ? '3단계로 시작하세요' : '3단계로 배우세요'}
            </h2>
            <p className="text-xl text-gray-400">
              {activeTab === 'seller' 
                ? '복잡한 과정 없이 누구나 쉽게 시작할 수 있습니다'
                : '원하는 전문가를 찾아 바로 학습을 시작하세요'}
            </p>
          </div>

          {activeTab === 'seller' && (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <StepCard
                step="1"
                title="회원가입"
                description="5분 만에 가입 완료. 신용카드 필요 없음."
              />
              <StepCard
                step="2"
                title="서비스 등록"
                description="폼만 작성하면 자동으로 웹사이트 생성."
              />
              <StepCard
                step="3"
                title="판매 시작"
                description="링크 공유하고 바로 수익 창출 시작."
              />
            </div>
          )}

          {activeTab === 'buyer' && (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <StepCard
                step="1"
                title="서비스 탐색"
                description="1,000개 이상의 전문 서비스 중 선택."
              />
              <StepCard
                step="2"
                title="구매 & 결제"
                description="안전한 결제로 바로 학습 시작."
              />
              <StepCard
                step="3"
                title="학습 & 성장"
                description="1:1 멘토링으로 커리어 성장."
              />
            </div>
          )}
        </div>
      </section>

      {/* Pricing - Seller Only */}
      {activeTab === 'seller' && (
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                간단한 요금제
              </h2>
              <p className="text-xl text-gray-400">
                언제든 업그레이드 가능. 위험 부담 제로.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <PricingCard
                name="FREE"
                price="₩0"
                period="/월"
                commission="10%"
                description="시작하는 1인 비즈니스"
                features={[
                  '무제한 서비스 등록',
                  '8가지 카테고리 지원',
                  '기본 결제 연동',
                  '이메일 지원',
                  '기본 통계',
                ]}
              />
              <PricingCard
                name="STARTER"
                price="₩29,000"
                period="/월"
                commission="7%"
                description="본격적으로 성장하려는"
                features={[
                  'FREE의 모든 기능',
                  '쿠폰 관리',
                  '고급 통계 분석',
                  '우선 지원',
                  'AI 가격 추천',
                ]}
                highlighted
              />
              <PricingCard
                name="PRO"
                price="₩49,000"
                period="/월"
                commission="5%"
                description="최고의 성과를 원하는"
                features={[
                  'STARTER의 모든 기능',
                  'AI 웹사이트 생성',
                  'AI 마케팅 문구',
                  '전담 지원',
                  'API 접근',
                ]}
              />
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="card-hover bg-gradient-primary p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {activeTab === 'seller' ? '지금 바로 시작하세요' : '지금 바로 배우세요'}
            </h2>
            <p className="text-xl text-white/80 mb-8">
              {activeTab === 'seller' 
                ? '신용카드 필요 없음. 5분 만에 가입 완료. 언제든 취소 가능.'
                : '1,000개 이상의 전문 서비스. 합리적인 가격. 지금 시작하세요.'}
            </p>
            <Link
              href={activeTab === 'seller' ? '/auth/partner/signup' : '/explore'}
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-primary-600 rounded-full text-lg font-bold hover:scale-105 transition-all duration-200 hover:shadow-glow-lg"
            >
              {activeTab === 'seller' ? '무료로 시작하기' : '서비스 둘러보기'}
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="text-xl font-bold text-white">Corefy</span>
            </div>
            
            <p className="text-gray-500 text-sm">
              © 2026 Corefy. 지식을 나누고 성장하세요.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="card-hover group">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="relative">
      <div className="card text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-white">
          {step}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
      {step !== '3' && (
        <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-500 to-transparent"></div>
      )}
    </div>
  )
}

function PricingCard({
  name,
  price,
  period,
  commission,
  description,
  features,
  highlighted = false,
}: {
  name: string
  price: string
  period: string
  commission: string
  description: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <div
      className={`relative rounded-3xl p-8 transition-all duration-300 ${
        highlighted
          ? 'bg-gradient-to-b from-primary-900/50 to-dark-900 border-2 border-primary-500 shadow-glow scale-105'
          : 'bg-dark-900 border border-dark-800 hover:border-dark-700'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary rounded-full text-sm font-bold text-white">
          인기
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-1">{name}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      
      <div className="mb-6">
        <span className="text-5xl font-bold text-white">{price}</span>
        <span className="text-gray-400 text-lg">{period}</span>
      </div>
      
      <div className="mb-6 px-4 py-2 bg-dark-800 rounded-lg inline-block">
        <span className="text-sm text-gray-400">거래 수수료: </span>
        <span className="text-lg font-bold text-primary-400">{commission}</span>
      </div>
      
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Link
        href="/auth/partner/signup"
        className={`block text-center py-4 rounded-full font-bold transition-all duration-200 ${
          highlighted
            ? 'bg-primary-500 text-white hover:bg-primary-600 hover:scale-105 hover:shadow-glow'
            : 'bg-dark-800 text-white hover:bg-dark-700 border border-dark-700'
        }`}
      >
        시작하기
      </Link>
    </div>
  )
}
