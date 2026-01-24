import Link from 'next/link'
import { ArrowRight, Zap, Sparkles, LayoutGrid, TrendingUp, Shield, Rocket } from 'lucide-react'

export default function HomePage() {
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

      {/* Hero Section - Spotify-inspired */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-950 to-accent-900/20"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-300 font-medium">AI 기반 웹사이트 자동 생성</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-slide-up">
            <span className="text-gradient">폼만 작성하면</span>
            <br />
            <span className="text-white">웹사이트 완성</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            드래그앤드롭 없이 <span className="text-white font-semibold">내용만 입력</span>하면<br />
            자동으로 <span className="text-primary-400 font-semibold">프로페셔널한 홈페이지</span>가 만들어집니다.<br />
            온라인 강의, 컨설팅, 멘토링을 <span className="text-white font-semibold">30분 만에 판매 시작</span>하세요.
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
              href="#features"
              className="btn-secondary text-lg"
            >
              더 알아보기
            </Link>
          </div>

          {/* Stats */}
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
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              왜 <span className="text-gradient">Corefy</span>인가요?
            </h2>
            <p className="text-xl text-gray-400">
              비즈니스 본질에 집중하세요. 나머지는 저희가 해결합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="초고속 셋업"
              description="폼만 작성하면 30분 만에 판매 시작. 복잡한 디자인 설정 제로."
              gradient="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="AI 자동 생성"
              description="AI가 자동으로 웹사이트, 마케팅 문구, 가격까지 추천해드립니다."
              gradient="from-primary-500 to-accent-500"
            />
            <FeatureCard
              icon={<LayoutGrid className="w-8 h-8" />}
              title="7가지 서비스 타입"
              description="온라인강의, 컨설팅, 멘토링, 부트캠프 등 모든 비즈니스 지원."
              gradient="from-cyan-500 to-blue-500"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="투명한 수수료"
              description="FREE 10%, STARTER 7%, PRO 5%. 숨겨진 비용 일체 없음."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Rocket className="w-8 h-8" />}
              title="완전 자동화"
              description="결제, 수강 관리, 쿠폰, 환불까지. 모든 프로세스 자동화."
              gradient="from-pink-500 to-rose-500"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="성장 도구"
              description="실시간 분석, 매출 대시보드, 고객 관리까지 올인원."
              gradient="from-purple-500 to-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              3단계로 시작하세요
            </h2>
            <p className="text-xl text-gray-400">
              복잡한 과정 없이 누구나 쉽게 시작할 수 있습니다
            </p>
          </div>

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
        </div>
      </section>

      {/* Pricing */}
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
              description="시작하는 크리에이터를 위한"
              features={[
                '무제한 서비스 등록',
                '기본 웹사이트 템플릿',
                '결제 연동 (Toss)',
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

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="card-hover bg-gradient-primary p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-white/80 mb-8">
              신용카드 필요 없음. 5분 만에 가입 완료. 언제든 취소 가능.
            </p>
            <Link
              href="/auth/partner/signup"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-primary-600 rounded-full text-lg font-bold hover:scale-105 transition-all duration-200 hover:shadow-glow-lg"
            >
              무료로 시작하기
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
              © 2026 Corefy. 비즈니스 본질에 집중하세요.
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
