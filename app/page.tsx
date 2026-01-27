'use client'

import Link from 'next/link'
import { 
  ArrowRight, 
  Sparkles, 
  Users, 
  TrendingUp,
  CheckCircle,
  Zap,
  Shield,
  DollarSign,
  Search,
  PlusCircle,
  BookOpen,
  Video,
  UserPlus,
  Briefcase,
  Code,
  MessageSquare,
  ShoppingBag,
  Crown,
  Radio,
  Megaphone
} from 'lucide-react'

const SERVICE_TYPES = [
  { id: 'online_course', name: '온라인 강의', icon: Video, desc: '동영상 강의, 라이브 클래스' },
  { id: 'one_on_one_mentoring', name: '1:1 멘토링', icon: UserPlus, desc: '개인 맞춤 코칭' },
  { id: 'group_coaching', name: '그룹 코칭', icon: Users, desc: '소규모 그룹 세션' },
  { id: 'digital_product', name: '디지털 콘텐츠', icon: BookOpen, desc: 'PDF, 템플릿, 툴킷' },
  { id: 'project_service', name: '프로젝트 대행', icon: Briefcase, desc: '프로젝트 단위 작업' },
  { id: 'consulting', name: '컨설팅', icon: MessageSquare, desc: '전문가 자문' },
  { id: 'agency_service', name: '대행 서비스', icon: Zap, desc: '업무 대행' },
  { id: 'premium_membership', name: '프리미엄 멤버십', icon: Crown, desc: '구독형 서비스' },
  { id: 'live_workshop', name: '라이브 워크샵', icon: Radio, desc: '실시간 워크샵' },
  { id: 'promotion_service', name: '홍보/마케팅', icon: Megaphone, desc: '마케팅 대행' },
]

const CATEGORIES = [
  { id: 'development', name: '개발 & 기술', icon: Code, color: 'from-blue-500 to-cyan-500', desc: '웹/앱 개발, AI/ML' },
  { id: 'design', name: '디자인 & 크리에이티브', icon: '🎨', color: 'from-purple-500 to-pink-500', desc: 'UI/UX, 그래픽 디자인' },
  { id: 'marketing', name: '마케팅 & 세일즈', icon: '📢', color: 'from-orange-500 to-red-500', desc: 'SNS 마케팅, 광고' },
  { id: 'business', name: '비즈니스 & 전략', icon: '💼', color: 'from-green-500 to-emerald-500', desc: '경영 컨설팅, 전략' },
  { id: 'content', name: '콘텐츠 & 크리에이터', icon: '✍️', color: 'from-yellow-500 to-orange-500', desc: '영상, 글쓰기' },
  { id: 'education', name: '교육 & 멘토링', icon: '📚', color: 'from-indigo-500 to-blue-500', desc: '강의, 코칭' },
  { id: 'lifestyle', name: '라이프스타일 & 웰니스', icon: '🧘', color: 'from-pink-500 to-rose-500', desc: '건강, 심리상담' },
  { id: 'writing', name: '크리에이티브 라이팅', icon: '📝', color: 'from-teal-500 to-cyan-500', desc: '작가, 시나리오' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Enhanced Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <span className="text-xl font-bold text-white">JobsClass</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#services" className="text-gray-300 hover:text-white transition-colors">
              서비스 타입
            </Link>
            <Link href="#categories" className="text-gray-300 hover:text-white transition-colors">
              카테고리
            </Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              가격 정책
            </Link>
            <Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">
              마켓플레이스
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/auth/user/login" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
              로그인
            </Link>
            <Link href="/auth/user/signup" className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all">
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-300 font-medium">전문가와 클라이언트를 연결하는 플랫폼</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-white leading-tight">
            당신의 전문성을<br />
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              비즈니스로 만드세요
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            <strong className="text-white">파트너</strong>는 10가지 방식으로 서비스를 판매하고,<br/>
            <strong className="text-white">클라이언트</strong>는 8개 분야의 전문가를 찾습니다
          </p>

          {/* Dual CTA */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
            {/* For Partners */}
            <div className="bg-gradient-to-br from-primary-500/20 to-purple-500/20 border-2 border-primary-500/30 rounded-2xl p-8 text-left">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mb-4">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">파트너로 시작</h3>
              <p className="text-gray-300 mb-6">
                전문성을 판매하고 수익을 창출하세요<br/>
                <span className="text-primary-400 font-semibold">수수료 단 10%</span>
              </p>
              <Link
                href="/auth/user/signup?type=partner"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg transition-all group"
              >
                서비스 등록하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* For Clients */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-2xl p-8 text-left">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">클라이언트로 시작</h3>
              <p className="text-gray-300 mb-6">
                필요한 전문가를 찾고 프로젝트를 성공시키세요<br/>
                <span className="text-green-400 font-semibold">무료 가입 & 검색</span>
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-semibold hover:shadow-lg transition-all group"
              >
                서비스 찾아보기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Types Section */}
      <section id="services" className="py-20 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              10가지 서비스 타입
            </h2>
            <p className="text-xl text-gray-400">
              다양한 방식으로 당신의 전문성을 판매하세요
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {SERVICE_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <div
                  key={type.id}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-primary-500/50 transition-all group"
                >
                  <Icon className="w-10 h-10 text-primary-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-bold mb-2 text-lg">{type.name}</h3>
                  <p className="text-gray-400 text-sm">{type.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 px-4 bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              8개 전문 카테고리
            </h2>
            <p className="text-xl text-gray-400">
              당신의 분야에서 최고의 전문가를 만나세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="relative group overflow-hidden rounded-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                  <div className="text-4xl mb-4">{typeof cat.icon === 'string' ? cat.icon : <cat.icon className="w-10 h-10" />}</div>
                  <h3 className="text-white font-bold text-xl mb-2">{cat.name}</h3>
                  <p className="text-gray-400 text-sm">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              투명한 가격 정책
            </h2>
            <p className="text-xl text-gray-400">
              업계 최저 수수료로 더 많은 수익을 가져가세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
              <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">10%</h3>
              <p className="text-gray-300 mb-1">플랫폼 수수료</p>
              <p className="text-sm text-gray-500">업계 최저 수준</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
              <CheckCircle className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">90%</h3>
              <p className="text-gray-300 mb-1">파트너 수익</p>
              <p className="text-sm text-gray-500">당신이 가져가는 금액</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
              <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">0원</h3>
              <p className="text-gray-300 mb-1">클라이언트 수수료</p>
              <p className="text-sm text-gray-500">무료 이용</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              얼리버드 혜택
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-gray-300">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">신규 가입 크레딧</p>
                  <p className="text-sm">10,000원 상당 크레딧 무료 제공</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">양방향 매칭</p>
                  <p className="text-sm">서비스 등록 & 요청 모두 가능</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary-400" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">10%</div>
              <div className="text-gray-400">낮은 수수료</div>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-gray-400">엄선된 파트너</div>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">AI</div>
              <div className="text-gray-400">자동 매칭</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            가입부터 첫 거래까지, 3분이면 충분합니다
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/user/signup?type=partner"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-primary-500/50 transition-all"
            >
              파트너로 시작하기
            </Link>
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-lg hover:bg-white/20 transition-all"
            >
              서비스 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/marketplace" className="hover:text-white transition-colors">마켓플레이스</Link></li>
                <li><Link href="/auth/user/signup?type=partner" className="hover:text-white transition-colors">파트너 가입</Link></li>
                <li><Link href="/auth/user/signup?type=client" className="hover:text-white transition-colors">클라이언트 가입</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">고객센터</a></li>
                <li><a href="#" className="hover:text-white transition-colors">이용가이드</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">회사</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">소개</a></li>
                <li><a href="#" className="hover:text-white transition-colors">채용</a></li>
                <li><a href="#" className="hover:text-white transition-colors">파트너십</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">법적고지</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">이용약관</a></li>
                <li><a href="#" className="hover:text-white transition-colors">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-white transition-colors">사업자정보</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm">
            © 2025 JobsClass. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
