'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Sparkles, Clock, CheckCircle, TrendingUp, Users, Shield, Gift } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-dark-800/50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">J</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white">JobsClass</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/for-partners" className="btn-ghost text-xs sm:text-sm px-3 sm:px-4 py-2">
              파트너 되기
            </Link>
            <Link href="/marketplace" className="btn-ghost text-xs sm:text-sm px-3 sm:px-4 py-2">
              마켓플레이스
            </Link>
            <Link href="/auth/user/login" className="btn-ghost text-xs sm:text-sm px-3 sm:px-4 py-2">
              로그인
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-950 to-accent-900/20"></div>
        <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary-500/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6 sm:mb-8">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400" />
            <span className="text-xs sm:text-sm text-primary-300 font-medium">AI 지식 마켓플레이스</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 px-2">
            <span className="text-white">전문성과 영향력을</span>
            <br />
            <span className="text-gradient">수익으로 만드세요</span>
          </h1>
          
          <p className="text-base sm:text-xl text-gray-400 mb-12 sm:mb-16 max-w-3xl mx-auto leading-relaxed px-4">
            온라인 강의, 멘토링, 컨설팅을 <span className="text-primary-400 font-semibold">AI로 3분 만에 등록</span>하고<br className="hidden sm:block" />
            바로 판매를 시작하세요
          </p>

          {/* 초기 가입 혜택 배너 */}
          <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
            <div className="card bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Gift className="w-8 h-8 text-yellow-400" />
                <h3 className="text-2xl font-bold text-white">🎉 얼리버드 혜택</h3>
              </div>
              <p className="text-gray-300 mb-4">
                첫 100명의 파트너에게 특별한 혜택을 드립니다
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-dark-900/50 rounded-lg p-4">
                  <div className="text-yellow-400 font-bold mb-1">3개월</div>
                  <div className="text-gray-400">수수료 0%</div>
                </div>
                <div className="bg-dark-900/50 rounded-lg p-4">
                  <div className="text-yellow-400 font-bold mb-1">무제한</div>
                  <div className="text-gray-400">AI 콘텐츠 생성</div>
                </div>
                <div className="bg-dark-900/50 rounded-lg p-4">
                  <div className="text-yellow-400 font-bold mb-1">우선</div>
                  <div className="text-gray-400">홈페이지 노출</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 px-4">
            <Link
              href="/for-partners"
              className="btn-primary w-full sm:w-auto text-lg px-8 py-4 flex items-center justify-center gap-2 group"
            >
              파트너로 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/for-clients"
              className="btn-secondary w-full sm:w-auto text-lg px-8 py-4"
            >
              서비스 둘러보기
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-8 max-w-3xl mx-auto px-2">
            <div className="card text-center p-4 sm:p-6">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">3분</div>
              <div className="text-xs sm:text-sm text-gray-400">상품 등록</div>
            </div>
            <div className="card text-center p-4 sm:p-6">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">0-5%</div>
              <div className="text-xs sm:text-sm text-gray-400">수수료</div>
            </div>
            <div className="card text-center p-4 sm:p-6">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">즉시</div>
              <div className="text-xs sm:text-sm text-gray-400">판매 시작</div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Be a Partner */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-dark-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              누가 <span className="text-gradient">파트너</span>가 될 수 있나요?
            </h2>
            <p className="text-xl text-gray-400">
              전문성과 영향력을 가진 모든 분들을 환영합니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-8 text-center hover:border-primary-500/30 transition-all">
              <div className="text-5xl mb-4">👨‍🏫</div>
              <h3 className="text-2xl font-bold text-white mb-3">전문가</h3>
              <p className="text-gray-400 mb-4">
                특정 분야의 깊은 지식과 경험을 보유한 전문가
              </p>
              <ul className="text-sm text-gray-500 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                  <span>개발자, 디자이너, 마케터</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                  <span>컨설턴트, 코치, 강사</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                  <span>자격증 보유자, 실무 전문가</span>
                </li>
              </ul>
            </div>

            <div className="card p-8 text-center hover:border-primary-500/30 transition-all">
              <div className="text-5xl mb-4">🎬</div>
              <h3 className="text-2xl font-bold text-white mb-3">크리에이터</h3>
              <p className="text-gray-400 mb-4">
                콘텐츠로 영향력을 만들어가는 크리에이터
              </p>
              <ul className="text-sm text-gray-500 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                  <span>유튜버, 인스타그래머</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                  <span>블로거, 작가, 강연자</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                  <span>팔로워 1000+ 또는 조회수 증명 가능</span>
                </li>
              </ul>
            </div>

            <div className="card p-8 text-center hover:border-primary-500/30 transition-all">
              <div className="text-5xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold text-white mb-3">비즈니스</h3>
              <p className="text-gray-400 mb-4">
                검증된 서비스를 제공하는 비즈니스
              </p>
              <ul className="text-sm text-gray-500 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                  <span>교육 기관, 학원, 학회</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                  <span>컨설팅 회사, 에이전시</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                  <span>사업자등록증 보유</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/for-partners"
              className="btn-primary inline-flex items-center gap-2 text-lg"
            >
              자세히 알아보기
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why JobsClass */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              왜 <span className="text-gradient">JobsClass</span>인가요?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">AI 자동화</h3>
              </div>
              <p className="text-gray-400">
                썸네일, 설명, 커리큘럼을 AI가 자동 생성. 3분이면 상품 등록 완료.
              </p>
            </div>

            <div className="card p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">업계 최저 수수료</h3>
              </div>
              <p className="text-gray-400">
                초기 파트너는 3개월 무료, 이후에도 5% 수수료로 더 많은 수익 보장.
              </p>
            </div>

            <div className="card p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">타겟 고객 매칭</h3>
              </div>
              <p className="text-gray-400">
                AI가 클라이언트에게 맞춤형 서비스를 추천해 전환율 향상.
              </p>
            </div>

            <div className="card p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">안전한 거래</h3>
              </div>
              <p className="text-gray-400">
                Toss Payments 통합으로 안전한 결제, 자동 정산 시스템.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="card bg-gradient-to-br from-primary-900/30 to-accent-900/30 border-primary-500/20 p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              얼리버드 혜택은 선착순 100명에게만 제공됩니다
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/user/signup"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
              >
                파트너로 시작하기
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/marketplace"
                className="btn-secondary text-lg px-8 py-4"
              >
                서비스 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8 sm:py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">J</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">JobsClass</span>
            </div>
            
            <p className="text-gray-500 text-xs sm:text-sm text-center">
              © 2026 JobsClass. AI 지식 마켓플레이스.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
