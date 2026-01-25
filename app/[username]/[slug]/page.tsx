import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Globe, Mail, Phone, Check, ArrowRight, Sparkles, Target, Zap } from 'lucide-react'

// 페이지 Props 타입
type PageProps = {
  params: Promise<{
    username: string
    slug: string
  }>
}

// SEO 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params
  const supabase = await createClient()

  // 1. 유저 프로필 조회
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    return {
      title: '웹사이트를 찾을 수 없습니다 | Corefy',
    }
  }

  // 2. 웹사이트 조회
  const { data: website } = await supabase
    .from('websites')
    .select('*')
    .eq('user_id', profile.user_id)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!website) {
    return {
      title: '웹사이트를 찾을 수 없습니다 | Corefy',
    }
  }

  return {
    title: `${website.title} - ${profile.display_name} | Corefy`,
    description: website.description || `${profile.display_name}의 웹사이트`,
    openGraph: {
      title: website.title,
      description: website.description || '',
      images: website.logo_url ? [website.logo_url] : [],
    },
  }
}

export default async function WebsitePage({ params }: PageProps) {
  const { username, slug } = await params
  const supabase = await createClient()

  // 1. 유저 프로필 조회
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // 2. 웹사이트 조회
  const { data: website, error: websiteError } = await supabase
    .from('websites')
    .select('*')
    .eq('user_id', profile.user_id)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (websiteError || !website) {
    notFound()
  }

  // 3. 콘텐츠 파싱 (안전하게)
  const content = typeof website.content === 'string' 
    ? JSON.parse(website.content) 
    : (website.content || {})
  
  const settings = typeof website.settings === 'string'
    ? JSON.parse(website.settings)
    : (website.settings || {})

  // 문제-해결 중심 템플릿
  return <ProblemSolutionTemplate website={website} content={content} settings={settings} profile={profile} />
}

// ================================
// 문제-해결 중심 템플릿
// ================================
function ProblemSolutionTemplate({ website, content, settings, profile }: any) {
  const colors = settings.colors || { primary: '#3B82F6', secondary: '#8B5CF6', accent: '#F59E0B' }
  
  const problem = content.problem || {}
  const solution = content.solution || {}
  const process = content.process || {}
  const results = content.results || {}
  const pricing = content.pricing || {}
  const contact = content.contact || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-white">{website.title}</h1>
                <p className="text-sm text-gray-400">by {profile.display_name}</p>
              </div>
            </div>
            <a
              href="#contact"
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-primary-500/20 transition-all"
            >
              {contact.cta || '지금 시작하기'}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {website.problem_category && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              {website.problem_category}
            </div>
          )}
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {website.title}
          </h2>
          <p className="text-xl text-gray-300 mb-4 leading-relaxed">
            {website.description}
          </p>
          {website.target_customer && (
            <p className="text-lg text-gray-400 mb-8">
              <span className="text-primary-400 font-semibold">이런 분들을 위한 솔루션:</span> {website.target_customer}
            </p>
          )}
          {website.solution_types && website.solution_types.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {website.solution_types.map((type: string) => (
                <span
                  key={type}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-gray-300 text-sm"
                >
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Problem Section */}
      {problem.description && (
        <section className="py-20 px-4 bg-gray-900/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <Target className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-3xl font-bold text-white">이런 고민 하고 계시죠?</h3>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              {problem.description}
            </p>
            {problem.painPoints && problem.painPoints.length > 0 && (
              <div className="grid md:grid-cols-3 gap-4">
                {problem.painPoints.filter((p: string) => p).map((point: string, index: number) => (
                  <div
                    key={index}
                    className="p-6 bg-gray-800/50 border border-gray-700 rounded-2xl"
                  >
                    <p className="text-gray-300">{point}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Solution Section */}
      {solution.description && (
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Zap className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-bold text-white">해결 방법</h3>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed mb-12">
              {solution.description}
            </p>
            
            {solution.features && solution.features.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6">
                {solution.features
                  .filter((f: any) => f.title)
                  .map((feature: any, index: number) => (
                    <div
                      key={index}
                      className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-2xl hover:border-primary-500/50 transition-all"
                    >
                      <div className="text-4xl mb-4">{feature.icon}</div>
                      <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                      {feature.description && (
                        <p className="text-gray-400">{feature.description}</p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Process Section */}
      {process.steps && process.steps.some((s: any) => s.title) && (
        <section className="py-20 px-4 bg-gray-900/50">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-12 text-center">
              {process.title || '진행 과정'}
            </h3>
            <div className="space-y-6">
              {process.steps
                .filter((s: any) => s.title)
                .map((step: any, index: number) => (
                  <div
                    key={index}
                    className="flex gap-6 p-6 bg-gray-800/50 border border-gray-700 rounded-2xl"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                      {step.description && (
                        <p className="text-gray-400">{step.description}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      {results.items && results.items.some((i: string) => i) && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-12 text-center">
              {results.title || '기대 효과'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {results.items
                .filter((i: string) => i)
                .map((item: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
                  >
                    <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <p className="text-gray-300">{item}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      {pricing.price && (
        <section className="py-20 px-4 bg-gray-900/50">
          <div className="max-w-md mx-auto">
            <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-primary-500 rounded-3xl text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                {pricing.title || '가격'}
              </h3>
              <div className="text-5xl font-bold text-primary-400 mb-6">
                {pricing.price}
              </div>
              {pricing.features && pricing.features.length > 0 && (
                <div className="space-y-3 mb-8">
                  {pricing.features
                    .filter((f: string) => f)
                    .map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 text-gray-300">
                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                </div>
              )}
              <a
                href="#contact"
                className="block w-full px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/20 transition-all"
              >
                {contact.cta || '지금 시작하기'}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-8">문의하기</h3>
          <div className="space-y-4">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center justify-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-gray-300 hover:border-primary-500/50 transition-all"
              >
                <Mail className="w-5 h-5 text-primary-400" />
                <span>{contact.email}</span>
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center justify-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-gray-300 hover:border-primary-500/50 transition-all"
              >
                <Phone className="w-5 h-5 text-primary-400" />
                <span>{contact.phone}</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">
            Powered by{' '}
            <a
              href="https://corefy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Corefy
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
