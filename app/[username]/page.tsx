import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { 
  Mail, Phone, MapPin, Briefcase, Package, PenTool, 
  ExternalLink, Calendar, Linkedin, Twitter, Github, Instagram,
  Globe, ArrowRight
} from 'lucide-react'

type PageProps = {
  params: Promise<{
    username: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    return {
      title: '사용자를 찾을 수 없습니다 | JobsBuild',
    }
  }

  return {
    title: `${profile.display_name} | JobsBuild`,
    description: profile.tagline || profile.bio || `${profile.display_name}의 프로필`,
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  // 프로필 조회
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // 서비스 목록 조회
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('partner_id', profile.user_id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // 블로그 글 조회
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('user_id', profile.user_id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6)

  // 포트폴리오 조회
  const { data: portfolioItems } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('user_id', profile.user_id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6)

  // 커리어 조회
  const { data: experiences } = await supabase
    .from('user_experiences')
    .select('*')
    .eq('user_id', profile.user_id)
    .order('start_date', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            {profile.avatar_url && (
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-4 border-primary-500">
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-5xl font-bold text-white mb-4">{profile.display_name}</h1>
            {profile.job_title && (
              <p className="text-xl text-primary-400 mb-4">{profile.job_title}</p>
            )}
            {profile.tagline && (
              <p className="text-2xl text-gray-300 mb-6">{profile.tagline}</p>
            )}
            {profile.bio && (
              <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                <Mail className="w-4 h-4" />
                {profile.email}
              </a>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                <Phone className="w-4 h-4" />
                {profile.phone}
              </a>
            )}
            {profile.location && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </div>
            )}
          </div>

          {/* Expertise Tags */}
          {profile.expertise && profile.expertise.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {profile.expertise.map((skill: string) => (
                <span key={skill} className="px-4 py-2 bg-primary-500/20 text-primary-300 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      {services && services.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">서비스</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 hover:border-primary-500 transition-colors">
                  {service.thumbnail_url && (
                    <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
                      <img src={service.thumbnail_url} alt={service.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{service.title}</h3>
                  </div>
                  {service.service_category && (
                    <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-lg mb-3">
                      {service.service_category}
                    </span>
                  )}
                  <p className="text-gray-400 mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{service.price?.toLocaleString()}원</span>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors">
                      자세히 보기
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Section */}
      {portfolioItems && portfolioItems.length > 0 && (
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">포트폴리오</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item) => (
                <div key={item.id} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden hover:border-primary-500 transition-colors">
                  {item.thumbnail_url && (
                    <div className="aspect-video bg-gray-800">
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Section */}
      {blogPosts && blogPosts.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">블로그</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 hover:border-primary-500 transition-colors">
                  <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>
                  )}
                  {post.category && (
                    <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-lg">
                      {post.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience Section */}
      {experiences && experiences.length > 0 && (
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">커리어</h2>
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white">{exp.position}</h3>
                      <p className="text-primary-400">{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {exp.start_date} - {exp.is_current ? '현재' : exp.end_date}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-gray-400 mt-3">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500">
            Powered by <span className="text-primary-400 font-semibold">JobsBuild</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
