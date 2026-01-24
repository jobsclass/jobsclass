import Link from 'next/link'
import { ArrowRight, Zap, DollarSign, Users, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            JobsClass
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/auth/partner/login"
              className="text-gray-600 hover:text-gray-900"
            >
              로그인
            </Link>
            <Link
              href="/auth/partner/signup"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              무료로 시작하기
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            당신의 지식을 판매하세요
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            온라인 강의, 컨설팅, 멘토링을 30분 만에 판매 시작.
            <br />
            드래그앤드롭 없이 폼만 작성하면 자동으로 웹사이트 완성!
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth/partner/signup"
              className="px-8 py-4 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700 flex items-center gap-2"
            >
              무료로 시작하기
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            왜 JobsClass인가요?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="빠른 시작"
              description="폼만 작성하면 30분 만에 판매 시작. 복잡한 설정 없음."
            />
            <FeatureCard
              icon={<DollarSign className="w-8 h-8" />}
              title="투명한 수수료"
              description="FREE 10%, STARTER 7%, PRO 5%. 숨겨진 비용 없음."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="고객 관리"
              description="장바구니, 결제, 수강 관리까지 올인원."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="성장 지원"
              description="쿠폰, 할인, 분석까지. 성장을 위한 모든 도구."
            />
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            요금제
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PlanCard
              name="FREE"
              price="₩0"
              commission="10%"
              features={[
                '무제한 서비스 등록',
                '기본 웹사이트',
                '결제 연동',
                '이메일 지원',
              ]}
            />
            <PlanCard
              name="STARTER"
              price="₩29,000"
              commission="7%"
              features={[
                'FREE의 모든 기능',
                '쿠폰 관리',
                '통계 분석',
                '우선 지원',
              ]}
              highlighted
            />
            <PlanCard
              name="PRO"
              price="₩49,000"
              commission="5%"
              features={[
                'STARTER의 모든 기능',
                '고급 분석',
                '전담 지원',
                'API 접근',
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            신용카드 필요 없음. 5분 만에 가입 완료.
          </p>
          <Link
            href="/auth/partner/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700"
          >
            무료로 시작하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 JobsClass. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function PlanCard({
  name,
  price,
  commission,
  features,
  highlighted = false,
}: {
  name: string
  price: string
  commission: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <div
      className={`p-8 rounded-lg border-2 ${
        highlighted
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-gray-600">/월</span>
      </div>
      <div className="mb-6 text-sm text-gray-600">
        거래 수수료: <span className="font-semibold">{commission}</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/auth/partner/signup"
        className={`block text-center py-3 rounded-lg font-semibold ${
          highlighted
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        시작하기
      </Link>
    </div>
  )
}
