'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Sparkles, Clock, CheckCircle, Menu, X, Palette, Code, Rocket } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navbar - 모바일 최적화 */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-dark-800/50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">J</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white">잡스빌드</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/auth/user/login"
              className="btn-ghost text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              로그인
            </Link>
            <Link
              href="/auth/user/signup"
              className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              무료시작
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - 핵심 가치 중심 */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-950 to-accent-900/20"></div>
        <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary-500/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6 sm:mb-8">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400" />
            <span className="text-xs sm:text-sm text-primary-300 font-medium">질문 5개로 웹사이트 완성</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 px-2">
            <span className="text-white">AI가 10분 만에</span>
            <br />
            <span className="text-gradient">당신의 웹사이트를 완성합니다</span>
          </h1>
          
          <p className="text-base sm:text-xl text-gray-400 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            <span className="text-white font-semibold">5개 질문에 답하면</span> AI가 프로필, 서비스, 블로그, 포트폴리오까지<br className="hidden sm:block" />
            <span className="text-primary-400 font-semibold">자동으로 생성하고 즉시 배포</span>합니다.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4">
            <Link
              href="/auth/user/signup"
              className="btn-primary w-full sm:w-auto text-base sm:text-lg flex items-center justify-center gap-2 group"
            >
              무료로 시작하기
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#demo"
              className="btn-secondary w-full sm:w-auto text-base sm:text-lg"
            >
              실제 화면 보기
            </Link>
          </div>

          {/* Value Props - 핵심 가치 */}
          <div className="grid grid-cols-3 gap-3 sm:gap-8 max-w-3xl mx-auto px-2">
            <div className="card text-center p-3 sm:p-6">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400 mx-auto mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">10분</div>
              <div className="text-xs sm:text-sm text-gray-400">웹사이트 완성</div>
            </div>
            <div className="card text-center p-3 sm:p-6">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mx-auto mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">0원</div>
              <div className="text-xs sm:text-sm text-gray-400">시작 비용</div>
            </div>
            <div className="card text-center p-3 sm:p-6">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">즉시</div>
              <div className="text-xs sm:text-sm text-gray-400">배포 완료</div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section - 실제 관리자 화면 */}
      <section id="demo" className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-dark-950 to-dark-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              이렇게 <span className="text-gradient">쉽습니다</span>
            </h2>
            <p className="text-base sm:text-xl text-gray-400">
              실제 관리자 화면에서 모든 것을 관리하세요
            </p>
          </div>

          {/* Screenshot Placeholder - 실제 대시보드 */}
          <div className="space-y-8 sm:space-y-12">
            {/* 1. 온보딩 화면 */}
            <div className="card p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <span className="text-primary-400 font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">5개 질문에 답변</h3>
                  <p className="text-sm sm:text-base text-gray-400">AI가 당신의 정보를 분석합니다</p>
                </div>
              </div>
              <div className="bg-dark-900 rounded-xl p-6 sm:p-8 border border-dark-800">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                    <span className="text-white">무슨 일을 하시나요?</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                    <span className="text-white">주로 누구를 도와주시나요?</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                    <span className="text-white">어떤 서비스를 제공하시나요?</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-500">경력이 어떻게 되시나요?</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-500">특별한 성과가 있나요?</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. AI 자동 생성 */}
            <div className="card p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center">
                  <span className="text-accent-400 font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">AI가 자동으로 생성</h3>
                  <p className="text-sm sm:text-base text-gray-400">프로필, 서비스, 블로그, 포트폴리오, 커리어</p>
                </div>
              </div>
              <div className="bg-dark-900 rounded-xl p-4 sm:p-6 border border-dark-800">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
                    <div className="text-primary-400 font-semibold mb-2">✨ 프로필</div>
                    <div className="text-sm text-gray-400">자기소개, 직함, 전문분야</div>
                  </div>
                  <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
                    <div className="text-accent-400 font-semibold mb-2">💼 서비스 3개</div>
                    <div className="text-sm text-gray-400">제목, 설명, 가격, 특징</div>
                  </div>
                  <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
                    <div className="text-blue-400 font-semibold mb-2">📝 블로그 5개</div>
                    <div className="text-sm text-gray-400">주제, 본문, 요약</div>
                  </div>
                  <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
                    <div className="text-green-400 font-semibold mb-2">🎨 포트폴리오 3개</div>
                    <div className="text-sm text-gray-400">프로젝트, 설명, 기술</div>
                  </div>
                  <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
                    <div className="text-purple-400 font-semibold mb-2">💪 커리어</div>
                    <div className="text-sm text-gray-400">경력, 직책, 업무</div>
                  </div>
                  <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
                    <div className="text-yellow-400 font-semibold mb-2">🖼️ 이미지</div>
                    <div className="text-sm text-gray-400">AI 이미지 생성</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 관리자 대시보드 */}
            <div className="card p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">실시간 수정 & 관리</h3>
                  <p className="text-sm sm:text-base text-gray-400">모바일에서도 쉽게 편집 가능</p>
                </div>
              </div>
              <div className="bg-dark-900 rounded-xl p-4 sm:p-6 border border-dark-800">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-dark-950 rounded-lg border border-dark-700">
                    <span className="text-white">✏️ 프로필 수정</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-950 rounded-lg border border-dark-700">
                    <span className="text-white">📦 서비스 관리</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-950 rounded-lg border border-dark-700">
                    <span className="text-white">📰 블로그 작성</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-950 rounded-lg border border-dark-700">
                    <span className="text-white">🎯 포트폴리오 추가</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - 핵심 기능 */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              왜 <span className="text-gradient">잡스빌드</span>인가요?
            </h2>
            <p className="text-base sm:text-xl text-gray-400">
              전문가가 아니어도 10분이면 충분합니다
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="AI 멀티모달 생성"
              description="텍스트와 이미지를 동시에 생성. 일관성 있는 콘텐츠를 한 번에."
              gradient="from-primary-500 to-accent-500"
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="10분 완성"
              description="5개 질문에 답하면 끝. AI가 나머지를 모두 처리합니다."
              gradient="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={<Palette className="w-8 h-8" />}
              title="실시간 편집"
              description="생성 후에도 언제든 수정 가능. 모바일에서도 작업 가능."
              gradient="from-cyan-500 to-blue-500"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="즉시 배포"
              description="yourname.잡스빌드.com 으로 바로 공개. 별도 호스팅 불필요."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Code className="w-8 h-8" />}
              title="코딩 불필요"
              description="복잡한 코드 없이 폼만 작성. 기술 지식 제로로 시작."
              gradient="from-pink-500 to-rose-500"
            />
            <FeatureCard
              icon={<Rocket className="w-8 h-8" />}
              title="SEO 최적화"
              description="검색 엔진 최적화 자동 적용. 더 많은 사람들에게 노출."
              gradient="from-purple-500 to-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="card bg-gradient-to-br from-primary-900/30 to-accent-900/30 border-primary-500/20 p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-base sm:text-xl text-gray-300 mb-8">
              신용카드 없이 무료로 시작. 10분이면 당신의 웹사이트가 완성됩니다.
            </p>
            <Link
              href="/auth/user/signup"
              className="btn-primary text-lg inline-flex items-center gap-2 group"
            >
              무료로 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - 모바일 최적화 */}
      <footer className="border-t border-dark-800 py-8 sm:py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">J</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">잡스빌드</span>
            </div>
            
            <p className="text-gray-500 text-xs sm:text-sm text-center">
              © 2026 잡스빌드. AI로 10분 만에 웹사이트 완성.
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
    <div className="card group hover:border-primary-500/30 transition-all">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
