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
            <span className="text-xl sm:text-2xl font-bold text-white">JobsClass</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/marketplace"
              className="btn-ghost text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              마켓플레이스
            </Link>
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
            <span className="text-xs sm:text-sm text-primary-300 font-medium">AI 지식 마켓플레이스</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 px-2">
            <span className="text-white">AI로 3분 만에</span>
            <br />
            <span className="text-gradient">지식을 판매하세요</span>
          </h1>
          
          <p className="text-base sm:text-xl text-gray-400 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            <span className="text-white font-semibold">강의, 컨설팅, 템플릿을 판매</span>하고 <br className="hidden sm:block" />
            <span className="text-primary-400 font-semibold">AI가 자동으로 콘텐츠를 생성</span>합니다.
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
              href="/marketplace"
              className="btn-secondary w-full sm:w-auto text-base sm:text-lg"
            >
              마켓플레이스 보기
            </Link>
          </div>

          {/* Value Props - 핵심 가치 */}
          <div className="grid grid-cols-3 gap-3 sm:gap-8 max-w-3xl mx-auto px-2">
            <div className="card text-center p-3 sm:p-6">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400 mx-auto mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">3분</div>
              <div className="text-xs sm:text-sm text-gray-400">상품 등록</div>
            </div>
            <div className="card text-center p-3 sm:p-6">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mx-auto mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">5%</div>
              <div className="text-xs sm:text-sm text-gray-400">수수료</div>
            </div>
            <div className="card text-center p-3 sm:p-6">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">즉시</div>
              <div className="text-xs sm:text-sm text-gray-400">AI 콘텐츠 생성</div>
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
              AI가 모든 콘텐츠를 자동으로 생성합니다
            </p>
          </div>

          {/* Screenshot Placeholder - 실제 대시보드 */}
          <div className="space-y-8 sm:space-y-12">
            {/* 1. 상품 등록 */}
            <div className="card p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <span className="text-primary-400 font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">상품 기본 정보 입력</h3>
                  <p className="text-sm sm:text-base text-gray-400">제목, 가격, 카테고리만 입력하세요</p>
                </div>
              </div>
              <div className="bg-dark-900 rounded-xl p-6 sm:p-8 border border-dark-800">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                    <span className="text-white">강의 제목 입력</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                    <span className="text-white">가격 및 카테고리 선택</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-500">AI가 자동으로 나머지 생성</span>
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
                  <p className="text-sm sm:text-base text-gray-400">썸네일, 설명, 커리큘럼, 블로그 포스팅</p>
                </div>
              </div>
              <div className="bg-dark-900 rounded-xl p-4 sm:p-6 border border-dark-800">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
                    <div className="text-primary-400 font-semibold mb-2">🎨 AI 썸네일</div>
                    <div className="text-sm text-gray-400">자동 이미지 생성</div>
                  </div>
                  <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
                    <div className="text-accent-400 font-semibold mb-2">📝 상품 설명</div>
                    <div className="text-sm text-gray-400">매력적인 설명 작성</div>
                  </div>
                  <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
                    <div className="text-blue-400 font-semibold mb-2">📚 커리큘럼</div>
                    <div className="text-sm text-gray-400">강의 구성 자동화</div>
                  </div>
                  <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
                    <div className="text-green-400 font-semibold mb-2">💰 가격 추천</div>
                    <div className="text-sm text-gray-400">시장 기반 가격 제안</div>
                  </div>
                  <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
                    <div className="text-purple-400 font-semibold mb-2">📰 블로그 포스팅</div>
                    <div className="text-sm text-gray-400">홍보 콘텐츠 자동 작성</div>
                  </div>
                  <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
                    <div className="text-yellow-400 font-semibold mb-2">🎯 SEO 최적화</div>
                    <div className="text-sm text-gray-400">검색 노출 자동화</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 판매 시작 */}
            <div className="card p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">즉시 판매 시작</h3>
                  <p className="text-sm sm:text-base text-gray-400">결제, 리뷰, 분석까지 자동화</p>
                </div>
              </div>
              <div className="bg-dark-900 rounded-xl p-4 sm:p-6 border border-dark-800">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-dark-950 rounded-lg border border-dark-700">
                    <span className="text-white">💳 결제 자동화</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-950 rounded-lg border border-dark-700">
                    <span className="text-white">⭐ 리뷰 관리</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-950 rounded-lg border border-dark-700">
                    <span className="text-white">📊 판매 분석</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-950 rounded-lg border border-dark-700">
                    <span className="text-white">💰 정산 자동화</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Partners - 파트너를 위한 */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-dark-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <span className="text-blue-400 font-bold">👨‍🏫 파트너</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              지식을 <span className="text-gradient">수익</span>으로
            </h2>
            <p className="text-base sm:text-xl text-gray-400">
              AI가 판매를 자동화하는 동안, 당신은 콘텐츠에만 집중하세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-3">3분 만에 등록</h3>
              <p className="text-gray-400 mb-4">
                제목, 가격, 카테고리만 입력하세요. AI가 썸네일, 설명, 커리큘럼을 자동 생성합니다.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>AI 썸네일 자동 생성</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>매력적인 상품 설명 작성</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>최적 가격 추천</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-white mb-3">업계 최저 수수료</h3>
              <p className="text-gray-400 mb-4">
                5-15% 수수료로 더 많은 수익을 가져가세요. 정산도 자동화됩니다.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>타 플랫폼 대비 50% 절감</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>자동 정산 시스템</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>투명한 수익 리포트</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-3">실시간 분석</h3>
              <p className="text-gray-400 mb-4">
                판매, 조회수, 전환율을 실시간으로 추적하고 최적화하세요.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>판매 대시보드</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>구매자 인사이트</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>AI 최적화 제안</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-3">마케팅 자동화</h3>
              <p className="text-gray-400 mb-4">
                AI가 자동으로 블로그 포스팅, SEO 최적화, 소셜 미디어를 관리합니다.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>자동 블로그 작성</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>SEO 최적화</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>이메일 마케팅</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* For Clients - 클라이언트를 위한 */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-dark-950 to-dark-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
              <span className="text-purple-400 font-bold">👨‍🎓 클라이언트</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              당신에게 <span className="text-gradient">딱 맞는</span> 학습
            </h2>
            <p className="text-base sm:text-xl text-gray-400">
              AI가 당신의 수준과 목표에 맞춰 최적의 강의를 추천합니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-white mb-3">AI 학습 경로</h3>
              <p className="text-gray-400">
                당신의 현재 수준을 분석하고, 목표 달성을 위한 최적의 학습 순서를 제안합니다.
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-white mb-3">AI 상담</h3>
              <p className="text-gray-400">
                고민이 있나요? AI가 24/7 상담하고, 필요한 강의와 파트너를 추천합니다.
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-white mb-3">검증된 파트너</h3>
              <p className="text-gray-400">
                실제 수강생 리뷰와 AI 분석으로 검증된 파트너만 만나세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - 핵심 기능 */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              왜 <span className="text-gradient">JobsClass</span>인가요?
            </h2>
            <p className="text-base sm:text-xl text-gray-400">
              AI가 모든 것을 자동화합니다
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="AI 콘텐츠 생성"
              description="썸네일, 설명, 커리큘럼을 AI가 자동으로 생성합니다."
              gradient="from-primary-500 to-accent-500"
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="3분 만에 등록"
              description="제목과 가격만 입력하면 끝. AI가 나머지를 처리합니다."
              gradient="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={<Palette className="w-8 h-8" />}
              title="업계 최저 수수료"
              description="5-15% 수수료로 더 많은 수익을 가져가세요."
              gradient="from-cyan-500 to-blue-500"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="안전한 결제"
              description="Toss Payments 통합으로 안전하고 빠른 결제."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Code className="w-8 h-8" />}
              title="리뷰 시스템"
              description="구매자 리뷰로 신뢰도를 높이세요."
              gradient="from-pink-500 to-rose-500"
            />
            <FeatureCard
              icon={<Rocket className="w-8 h-8" />}
              title="AI 학습 추천"
              description="구매자에게 맞춤형 강의를 추천합니다."
              gradient="from-purple-500 to-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* Pricing - 가격 */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-dark-900 to-dark-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              투명한 <span className="text-gradient">가격 정책</span>
            </h2>
            <p className="text-base sm:text-xl text-gray-400">
              파트너 플랜은 판매 수수료만, 클라이언트는 무료입니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 파트너 플랜 */}
            <div className="card p-8 border-2 border-blue-500/20">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full mb-4">
                  <span className="text-blue-400 font-bold">👨‍🏫 파트너</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">판매 수수료제</h3>
                <p className="text-gray-400">초기 비용 없이 판매된 만큼만 지불</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-white mb-2">
                  5-15<span className="text-2xl">%</span>
                </div>
                <p className="text-gray-400">판매액의 수수료</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>무제한 상품 등록</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>AI 콘텐츠 자동 생성</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>판매 분석 대시보드</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>자동 정산 (월 2회)</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>24/7 고객 지원</span>
                </li>
              </ul>

              <Link
                href="/auth/user/signup"
                className="btn-primary w-full text-center block"
              >
                파트너로 시작하기
              </Link>
            </div>

            {/* 클라이언트 플랜 */}
            <div className="card p-8 border-2 border-purple-500/20">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full mb-4">
                  <span className="text-purple-400 font-bold">👨‍🎓 클라이언트</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">완전 무료</h3>
                <p className="text-gray-400">강의만 구매하면 됩니다</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-white mb-2">
                  0<span className="text-2xl">원</span>
                </div>
                <p className="text-gray-400">가입비/월 이용료 없음</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>무제한 강의 탐색</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>AI 학습 경로 추천</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>AI 상담 (무제한)</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>안전한 결제 시스템</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>리뷰 작성 & 확인</span>
                </li>
              </ul>

              <Link
                href="/auth/user/signup"
                className="btn-secondary w-full text-center block"
              >
                클라이언트로 시작하기
              </Link>
            </div>
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
              신용카드 없이 무료로 시작. 3분이면 당신의 지식 상품이 완성됩니다.
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
