'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Users, Gift } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <span className="text-xl font-bold text-white">JobsClass</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="hidden md:block px-4 py-2 text-gray-300 hover:text-white transition-colors">
              마켓플레이스
            </Link>
            <Link href="/auth/user/login" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
              로그인
            </Link>
            <Link href="/auth/user/signup" className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all">
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-300 font-medium">전문가와 클라이언트를 연결하는 플랫폼</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
            당신의 전문성을<br />
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              비즈니스로 만드세요
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-12 leading-relaxed">
            파트너는 서비스를 판매하고, 클라이언트는 필요한 전문가를 찾습니다
          </p>

          {/* 얼리버드 */}
          <div className="max-w-2xl mx-auto mb-12 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gift className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">🎉 얼리버드 혜택</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-yellow-400 font-bold mb-1">100 크레딧</div>
                <div className="text-gray-400">무료 제공</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-yellow-400 font-bold mb-1">매출 쉐어 10%</div>
                <div className="text-gray-400">낮은 수수료</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-yellow-400 font-bold mb-1">양방향 매칭</div>
                <div className="text-gray-400">니즈 & 제안</div>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/user/signup?type=partner"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all flex items-center justify-center gap-2 group"
            >
              파트너로 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-colors"
            >
              서비스 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">
            다양한 지식 서비스 카테고리
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <Link href="/marketplace?category=development" className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary-500/50 transition-all group">
              <div className="text-3xl mb-3">💻</div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">개발</h3>
              <p className="text-xs text-gray-400">웹/앱 개발, 시스템</p>
            </Link>

            <Link href="/marketplace?category=design" className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary-500/50 transition-all group">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">디자인</h3>
              <p className="text-xs text-gray-400">UI/UX, 그래픽</p>
            </Link>

            <Link href="/marketplace?category=marketing" className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary-500/50 transition-all group">
              <div className="text-3xl mb-3">📢</div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">마케팅</h3>
              <p className="text-xs text-gray-400">SNS, 콘텐츠</p>
            </Link>

            <Link href="/marketplace?category=business" className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary-500/50 transition-all group">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">비즈니스</h3>
              <p className="text-xs text-gray-400">컨설팅, 전략</p>
            </Link>

            <Link href="/marketplace?category=education" className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary-500/50 transition-all group">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">교육</h3>
              <p className="text-xs text-gray-400">강의, 멘토링</p>
            </Link>

            <Link href="/marketplace?category=content" className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary-500/50 transition-all group">
              <div className="text-3xl mb-3">✍️</div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">콘텐츠</h3>
              <p className="text-xs text-gray-400">글쓰기, 번역</p>
            </Link>

            <Link href="/marketplace?category=video" className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary-500/50 transition-all group">
              <div className="text-3xl mb-3">🎬</div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">영상</h3>
              <p className="text-xs text-gray-400">편집, 촬영</p>
            </Link>

            <Link href="/marketplace?category=etc" className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary-500/50 transition-all group">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">기타</h3>
              <p className="text-xs text-gray-400">다양한 서비스</p>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-8 h-8 text-primary-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">10%</div>
              <div className="text-sm text-gray-400">낮은 수수료</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">100+</div>
              <div className="text-sm text-gray-400">얼리 파트너</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-3">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">AI</div>
              <div className="text-sm text-gray-400">자동 매칭</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">
            어떻게 작동하나요?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* 파트너 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="inline-block px-4 py-2 bg-primary-500/20 rounded-lg mb-4">
                <span className="text-primary-400 font-semibold">파트너</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">서비스를 판매하세요</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 font-bold">1.</span>
                  <span>사업자 정보 등록 (사업자등록번호 필수)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 font-bold">2.</span>
                  <span>서비스 등록 또는 니즈에 제안</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 font-bold">3.</span>
                  <span>클라이언트와 거래 시작</span>
                </li>
              </ul>
              <Link
                href="/auth/user/signup?type=partner"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg text-white font-semibold transition-colors"
              >
                파트너 등록하기 →
              </Link>
            </div>

            {/* 클라이언트 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="inline-block px-4 py-2 bg-green-500/20 rounded-lg mb-4">
                <span className="text-green-400 font-semibold">클라이언트</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">전문가를 찾으세요</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">1.</span>
                  <span>무료 회원가입 (간단한 이메일 인증)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">2.</span>
                  <span>서비스 구매 또는 니즈 등록</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">3.</span>
                  <span>파트너의 제안서 확인 및 선택</span>
                </li>
              </ul>
              <Link
                href="/auth/user/signup?type=client"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors"
              >
                시작하기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="container mx-auto text-center">
          <p className="text-gray-400 text-sm">
            © 2026 JobsClass. 전문가와 클라이언트를 연결하는 플랫폼.
          </p>
        </div>
      </footer>
    </div>
  )
}
