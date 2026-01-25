import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { 
  Globe, Mail, Phone, Check, ArrowRight, Sparkles, Target, Zap, 
  Briefcase, Award, GraduationCap, Package, PenTool, ExternalLink,
  Calendar, MapPin, Linkedin, Twitter, Github, Instagram
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  // 2. 웹사이트 조회
  const { data: website } = await supabase
    .from('websites')
    .select('*')
    .eq('user_id', profile.user_id)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!website) notFound()

  // 3. 섹션 설정 가져오기
  const sectionsEnabled = website.sections_enabled || {
    hero: true,
    profile: true,
    products: true,
    blog: false,
    portfolio: false,
    contact: true,
  }

  const sectionsOrder = website.sections_order || ['hero', 'profile', 'products', 'contact']

  // 4. 추가 데이터 조회
  const [
    { data: experiences },
    { data: educations },
    { data: certifications },
    { data: products },
    { data: blogPosts },
    { data: portfolios },
  ] = await Promise.all([
    supabase
      .from('experiences')
      .select('*')
      .eq('user_id', profile.user_id)
      .order('display_order', { ascending: true })
      .order('start_date', { ascending: false }),
    supabase
      .from('educations')
      .select('*')
      .eq('user_id', profile.user_id)
      .order('display_order', { ascending: true })
      .order('start_date', { ascending: false }),
    supabase
      .from('certifications')
      .select('*')
      .eq('user_id', profile.user_id)
      .order('display_order', { ascending: true })
      .order('issued_date', { ascending: false }),
    supabase
      .from('products')
      .select('*')
      .eq('user_id', profile.user_id)
      .eq('is_published', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('blog_posts')
      .select('*')
      .eq('user_id', profile.user_id)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(6),
    supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', profile.user_id)
      .eq('is_published', true)
      .order('display_order', { ascending: true }),
  ])

  const content = typeof website.content === 'string' 
    ? JSON.parse(website.content) 
    : (website.content || {})

  return (
    <ModernTemplate
      website={website}
      profile={profile}
      sectionsEnabled={sectionsEnabled}
      sectionsOrder={sectionsOrder}
      experiences={experiences || []}
      educations={educations || []}
      certifications={certifications || []}
      products={products || []}
      blogPosts={blogPosts || []}
      portfolios={portfolios || []}
      content={content}
    />
  )
}

// ================================
// Modern Template Component
// ================================
function ModernTemplate({
  website,
  profile,
  sectionsEnabled,
  sectionsOrder,
  experiences,
  educations,
  certifications,
  products,
  blogPosts,
  portfolios,
  content,
}: any) {
  // 섹션 컴포넌트 매핑
  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <HeroSection website={website} profile={profile} />,
    profile: (
      <ProfileSection
        profile={profile}
        experiences={experiences}
        educations={educations}
        certifications={certifications}
      />
    ),
    products: <ProductsSection products={products} />,
    blog: <BlogSection blogPosts={blogPosts} username={profile.username} />,
    portfolio: <PortfolioSection portfolios={portfolios} />,
    contact: <ContactSection profile={profile} content={content.contact} />,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <Header website={website} profile={profile} />

      {/* 섹션들을 order에 따라 렌더링 */}
      {sectionsOrder
        .filter((section: string) => sectionsEnabled[section])
        .map((section: string) => (
          <div key={section}>{sectionComponents[section]}</div>
        ))}

      {/* Footer */}
      <Footer website={website} profile={profile} />
    </div>
  )
}

// ================================
// Header Component
// ================================
function Header({ website, profile }: any) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {website.logo_url && (
              <Image
                src={website.logo_url}
                alt={website.title}
                width={40}
                height={40}
                className="rounded-lg"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-white">{website.title}</h1>
              <p className="text-sm text-gray-400">by {profile.display_name}</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#profile" className="text-gray-300 hover:text-white transition-colors">
              프로필
            </a>
            <a href="#products" className="text-gray-300 hover:text-white transition-colors">
              상품
            </a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
              문의
            </a>
          </nav>
          <a
            href="#contact"
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-primary-500/20 transition-all"
          >
            문의하기
          </a>
        </div>
      </div>
    </header>
  )
}

// ================================
// Hero Section
// ================================
function HeroSection({ website, profile }: any) {
  return (
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
        <p className="text-xl text-gray-300 mb-4 leading-relaxed max-w-3xl mx-auto">
          {website.description}
        </p>
        {website.target_customer && (
          <p className="text-lg text-gray-400 mb-8">
            <span className="text-primary-400 font-semibold">이런 분들을 위한:</span>{' '}
            {website.target_customer}
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
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          <a
            href="#products"
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/20 transition-all"
          >
            상품 보기
          </a>
          <a
            href="#profile"
            className="px-8 py-4 bg-gray-800 border border-gray-700 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors"
          >
            더 알아보기
          </a>
        </div>
      </div>
    </section>
  )
}

// ================================
// Profile Section
// ================================
function ProfileSection({ profile, experiences, educations, certifications }: any) {
  const socialLinks = profile.social_links || {}
  const expertise = profile.expertise || []

  return (
    <section id="profile" className="py-20 px-4 bg-gray-900/30">
      <div className="max-w-6xl mx-auto">
        {/* 프로필 헤더 */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                width={160}
                height={160}
                className="rounded-2xl"
              />
            ) : (
              <div className="w-40 h-40 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-5xl font-bold text-white">
                  {profile.display_name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-4xl font-bold text-white mb-2">{profile.display_name}</h3>
            {profile.job_title && (
              <p className="text-xl text-primary-400 mb-4">{profile.job_title}</p>
            )}
            {profile.tagline && (
              <p className="text-lg text-gray-300 mb-6">{profile.tagline}</p>
            )}
            {profile.bio && <p className="text-gray-400 mb-6 leading-relaxed">{profile.bio}</p>}

            {/* 전문 분야 */}
            {expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {expertise.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-lg text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* 소셜 링크 */}
            <div className="flex flex-wrap gap-3">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 경력 사항 */}
        {experiences.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-6 h-6 text-primary-400" />
              <h4 className="text-2xl font-bold text-white">경력</h4>
            </div>
            <div className="space-y-4">
              {experiences.map((exp: any) => (
                <div
                  key={exp.id}
                  className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-lg font-bold text-white">{exp.position}</h5>
                    <span className="text-sm text-gray-500">
                      {exp.start_date} - {exp.is_current ? '현재' : exp.end_date}
                    </span>
                  </div>
                  <p className="text-primary-400 mb-2">{exp.company}</p>
                  {exp.description && <p className="text-gray-400 text-sm">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 학력 */}
        {educations.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-6 h-6 text-primary-400" />
              <h4 className="text-2xl font-bold text-white">학력</h4>
            </div>
            <div className="space-y-4">
              {educations.map((edu: any) => (
                <div
                  key={edu.id}
                  className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-lg font-bold text-white">{edu.school}</h5>
                    <span className="text-sm text-gray-500">
                      {edu.start_date} - {edu.end_date || '현재'}
                    </span>
                  </div>
                  <p className="text-primary-400">
                    {edu.degree} {edu.field && `· ${edu.field}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 자격증 */}
        {certifications.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-primary-400" />
              <h4 className="text-2xl font-bold text-white">자격증 및 수상</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {certifications.map((cert: any) => (
                <div
                  key={cert.id}
                  className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
                >
                  <h5 className="text-white font-bold mb-1">{cert.title}</h5>
                  <p className="text-sm text-gray-400">{cert.issuer}</p>
                  {cert.issued_date && (
                    <p className="text-xs text-gray-500 mt-1">{cert.issued_date}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ================================
// Products Section
// ================================
function ProductsSection({ products }: any) {
  if (products.length === 0) return null

  return (
    <section id="products" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-white mb-4">상품</h3>
          <p className="text-gray-400">고객의 문제를 해결하는 솔루션</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="group bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all"
            >
              {product.thumbnail_url && (
                <div className="aspect-video bg-gray-800 relative overflow-hidden">
                  <Image
                    src={product.thumbnail_url}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                {product.problem_category && (
                  <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-300 rounded-lg text-xs font-semibold mb-3">
                    {product.problem_category}
                  </span>
                )}
                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {product.title}
                </h4>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                {product.solution_types && product.solution_types.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.solution_types.slice(0, 2).map((type: string) => (
                      <span
                        key={type}
                        className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    {product.price && (
                      <p className="text-2xl font-bold text-white">
                        {product.price.toLocaleString()}원
                      </p>
                    )}
                  </div>
                  <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors">
                    자세히 보기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ================================
// Blog Section
// ================================
function BlogSection({ blogPosts, username }: any) {
  if (blogPosts.length === 0) return null

  return (
    <section id="blog" className="py-20 px-4 bg-gray-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-white mb-4">블로그</h3>
          <p className="text-gray-400">최신 글과 인사이트</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post: any) => (
            <article
              key={post.id}
              className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all group"
            >
              {post.featured_image_url && (
                <div className="aspect-video bg-gray-800 relative overflow-hidden">
                  <Image
                    src={post.featured_image_url}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <time className="text-sm text-gray-500">
                    {new Date(post.published_at).toLocaleDateString('ko-KR')}
                  </time>
                </div>
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                  {post.title}
                </h4>
                {post.excerpt && (
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                )}
                <Link
                  href={`/${username}/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                >
                  자세히 보기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ================================
// Portfolio Section
// ================================
function PortfolioSection({ portfolios }: any) {
  if (portfolios.length === 0) return null

  return (
    <section id="portfolio" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-white mb-4">포트폴리오</h3>
          <p className="text-gray-400">진행한 프로젝트 사례</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {portfolios.map((portfolio: any) => (
            <div
              key={portfolio.id}
              className="group bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all"
            >
              {portfolio.thumbnail_url && (
                <div className="aspect-video bg-gray-800 relative overflow-hidden">
                  <Image
                    src={portfolio.thumbnail_url}
                    alt={portfolio.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {portfolio.title}
                </h4>
                {portfolio.client && (
                  <p className="text-primary-400 mb-2">클라이언트: {portfolio.client}</p>
                )}
                <p className="text-gray-400 mb-4">{portfolio.description}</p>
                {portfolio.technologies && portfolio.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {portfolio.technologies.map((tech: string) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {portfolio.project_url && (
                  <a
                    href={portfolio.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                  >
                    프로젝트 보기
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ================================
// Contact Section
// ================================
function ContactSection({ profile, content }: any) {
  const contactData = content || {}

  return (
    <section id="contact" className="py-20 px-4 bg-gray-900/30">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-4xl font-bold text-white mb-4">문의하기</h3>
        <p className="text-gray-400 mb-12">궁금하신 점이 있으시면 언제든 연락주세요</p>

        <div className="space-y-4">
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center justify-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-gray-300 hover:border-primary-500/50 transition-all group"
            >
              <Mail className="w-5 h-5 text-primary-400" />
              <span className="group-hover:text-white transition-colors">{profile.email}</span>
            </a>
          )}
          {profile.phone && (
            <a
              href={`tel:${profile.phone}`}
              className="flex items-center justify-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-gray-300 hover:border-primary-500/50 transition-all group"
            >
              <Phone className="w-5 h-5 text-primary-400" />
              <span className="group-hover:text-white transition-colors">{profile.phone}</span>
            </a>
          )}
          {profile.location && (
            <div className="flex items-center justify-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-gray-300">
              <MapPin className="w-5 h-5 text-primary-400" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ================================
// Footer
// ================================
function Footer({ website, profile }: any) {
  return (
    <footer className="py-12 px-4 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-white font-bold mb-1">{website.title}</p>
            <p className="text-gray-500 text-sm">© 2025 {profile.display_name}. All rights reserved.</p>
          </div>
          <p className="text-gray-500 text-sm">
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
      </div>
    </footer>
  )
}
