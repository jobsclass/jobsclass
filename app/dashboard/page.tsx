import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Globe, ExternalLink, Sparkles, Rocket, CheckCircle2, ArrowUpRight, Layout, PartyPopper } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ onboarding?: string }>
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/user/login')
  }

  // ⚡ 성능 개선: 병렬로 데이터 가져오기
  const [profileResult, websitesResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('websites')
      .select('id, title, slug')
      .eq('user_id', user.id)
  ])

  const profile = profileResult.data
  const websites = websitesResult.data

  if (!profile) {
    redirect('/auth/user/signup')
  }

  // 🚀 프로필 타입에 따라 대시보드 분기
  if (profile.profile_type === 'partner') {
    redirect('/partner/dashboard')
  }
  if (profile.profile_type === 'client') {
    redirect('/client/dashboard')
  }

  // 온보딩 완료 여부 확인 (필수!)
  const onboardingComplete = profile.onboarding_complete === true

  // 온보딩 가이드 표시 조건: 온보딩 완료했지만 웹사이트가 없을 때만
  const showOnboardingGuide = onboardingComplete && (!websites || websites.length === 0)
  const params = await searchParams
  const onboardingSuccess = params.onboarding === 'complete'

  return (
    <div>
      {/* 온보딩 미완료 경고 */}
      {!onboardingComplete && (
        <div className="mb-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">
                ⚠️ 온보딩을 완료해주세요!
              </h3>
              <p className="text-gray-400 mb-3">
                5개 질문에 답하면 AI가 자동으로 웹사이트를 생성합니다. 온보딩을 완료해야 웹사이트 배포가 가능합니다.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform"
              >
                <Rocket className="w-5 h-5" />
                지금 시작하기 (10분 소요)
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 온보딩 완료 축하 메시지 */}
      {onboardingSuccess && onboardingComplete && (
        <div className="mb-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                🎉 축하합니다! AI 웹사이트 생성 완료!
              </h3>
              <p className="text-gray-400">
                AI가 프로필, 서비스, 블로그, 포트폴리오를 자동으로 생성했습니다. 이제 각 항목을 수정할 수 있어요!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          안녕하세요, {profile.display_name}님! 👋
        </h1>
        <p className="text-gray-400 text-lg">
          오늘도 멋진 웹사이트를 만들어보세요!
        </p>
      </div>

      {/* 온보딩 가이드 제거 - 더 이상 필요 없음 */}

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="내 웹사이트"
          value={`${websites?.length || 0}개`}
          icon={<Layout className="w-6 h-6" />}
          gradient="from-blue-500 to-cyan-600"
        />
        <StatCard
          title="구독 플랜"
          value={profile.subscription_plan || 'FREE'}
          icon={<Sparkles className="w-6 h-6" />}
          gradient="from-purple-500 to-pink-600"
        />
        <StatCard
          title="계정 상태"
          value={profile.subscription_status === 'active' ? '활성' : '비활성'}
          icon={<CheckCircle2 className="w-6 h-6" />}
          gradient="from-emerald-500 to-teal-600"
        />
      </div>

      {/* 빠른 액션 */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-6">빠른 액션</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            title="새 웹사이트 만들기"
            description="AI로 1분 만에 웹사이트를 생성하세요"
            href="/dashboard/websites/new"
            icon={<Plus className="w-6 h-6" />}
            gradient="from-primary-500 to-purple-600"
          />
          <ActionCard
            title="내 웹사이트 보기"
            description="만든 웹사이트를 확인하세요"
            href="/dashboard/websites"
            icon={<Globe className="w-6 h-6" />}
            gradient="from-blue-500 to-cyan-600"
          />
          <ActionCard
            title="프로필 설정"
            description="내 정보를 수정하세요"
            href="/dashboard/settings"
            icon={<Sparkles className="w-6 h-6" />}
            gradient="from-emerald-500 to-teal-600"
          />
        </div>
      </div>

      {/* 최근 웹사이트 */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">최근 웹사이트</h2>
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
          {!websites || websites.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-2xl mb-6">
                <Layout className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg mb-4">아직 웹사이트가 없습니다</p>
              <Link
                href="/dashboard/websites/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/20 transition-all font-semibold"
              >
                첫 웹사이트 만들기
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="p-6 grid gap-4">
              {websites.slice(0, 5).map((website: any) => (
                <Link
                  key={website.id}
                  href={`/dashboard/websites/${website.id}/edit`}
                  className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                        {website.title}
                      </h3>
                      <p className="text-sm text-gray-400 font-mono">
                        /{profile.username}/{website.slug}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  gradient,
}: {
  title: string
  value: string
  icon: React.ReactNode
  gradient: string
}) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
      <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
          <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionCard({
  title,
  description,
  href,
  icon,
  gradient,
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  gradient: string
}) {
  return (
    <Link
      href={href}
      className="group relative"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
      <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all">
        <div className="flex items-start gap-4">
          <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{description}</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
        </div>
      </div>
    </Link>
  )
}

function OnboardingGuide({ username }: { username: string }) {
  return (
    <div className="mb-10">
      <div className="relative">
        {/* Gradient Border Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
        
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-primary-500/20">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              🎉 환영합니다! 첫 웹사이트를 만들어보세요
            </h2>
            <p className="text-gray-400 text-lg">
              AI로 1분 만에 완성! 지금 바로 시작하세요
            </p>
          </div>

          {/* 3단계 가이드 */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <OnboardingStep
              step="1"
              icon={<Plus className="w-6 h-6" />}
              title="템플릿 선택"
              description="Modern, Minimal, Creative 중 마음에 드는 템플릿을 선택하세요."
              actionText="웹사이트 만들기"
              actionHref="/dashboard/websites/new"
              gradient="from-blue-500 to-cyan-500"
            />
            <OnboardingStep
              step="2"
              icon={<Sparkles className="w-6 h-6" />}
              title="AI로 작성"
              description="제목, 설명만 입력하면 AI가 나머지를 채워줍니다."
              actionText="AI 기능 보기"
              actionHref="/dashboard/websites/new"
              gradient="from-purple-500 to-pink-500"
            />
            <OnboardingStep
              step="3"
              icon={<Globe className="w-6 h-6" />}
              title="즉시 배포"
              description="클릭 한 번으로 배포 완료! 링크를 공유하세요."
              actionText="대시보드 둘러보기"
              actionHref="/dashboard"
              gradient="from-emerald-500 to-teal-500"
            />
          </div>

          {/* 성공 사례 */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">💡 성공 팁</h3>
                <p className="text-gray-300 mb-3">
                  <strong className="text-primary-400">김OO 님</strong>은 AI 템플릿으로 <strong className="text-white">1분 만에 포트폴리오 사이트</strong>를 완성했어요!
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 rounded-full text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    제작 시간 1분
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 rounded-full text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    반응형 디자인
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 rounded-full text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    SEO 최적화
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OnboardingStep({
  step,
  icon,
  title,
  description,
  actionText,
  actionHref,
  gradient,
}: {
  step: string
  icon: React.ReactNode
  title: string
  description: string
  actionText: string
  actionHref: string
  gradient: string
}) {
  return (
    <div className="relative group">
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 h-full flex flex-col hover:border-gray-600 transition-all">
        {/* Step Number */}
        <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
          {step}
        </div>

        {/* Icon */}
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 flex-1">{description}</p>

        {/* Action Button */}
        <Link
          href={actionHref}
          className={`inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${gradient} text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all text-sm`}
        >
          {actionText}
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
