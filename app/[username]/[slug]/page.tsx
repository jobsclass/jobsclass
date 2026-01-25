import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { Globe, Mail, Phone, MapPin, ExternalLink, ArrowRight } from 'lucide-react'

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

  // 3. 템플릿 조회
  const { data: template } = await supabase
    .from('templates')
    .select('*')
    .eq('id', website.template_id)
    .single()

  // 4. 콘텐츠 파싱 (안전하게)
  const content = typeof website.content === 'string' 
    ? JSON.parse(website.content) 
    : (website.content || {})
  
  const settings = typeof website.settings === 'string'
    ? JSON.parse(website.settings)
    : (website.settings || {})

  // 템플릿별로 다른 렌더링
  if (template?.id === 'modern') {
    return <ModernTemplate website={website} content={content} settings={settings} profile={profile} />
  } else if (template?.id === 'minimal') {
    return <MinimalTemplate website={website} content={content} settings={settings} profile={profile} />
  } else if (template?.id === 'creative') {
    return <CreativeTemplate website={website} content={content} settings={settings} profile={profile} />
  }

  // 기본 템플릿
  return <DefaultTemplate website={website} content={content} settings={settings} profile={profile} />
}

// ================================
// Modern 템플릿
// ================================
function ModernTemplate({ website, content, settings, profile }: any) {
  const colors = settings.colors || {}
  const hero = content.hero || {}
  const about = content.about || {}
  const services = content.services || []
  const contact = content.contact || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {website.logo_url && (
                <Image
                  src={website.logo_url}
                  alt={website.title}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{website.title}</h1>
                <p className="text-sm text-gray-600">by {profile.display_name}</p>
              </div>
            </div>
            {website.custom_domain && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="w-4 h-4" />
                <span>{website.custom_domain}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {hero.title && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">{hero.title}</h2>
            {hero.subtitle && (
              <p className="text-xl text-gray-600 mb-8">{hero.subtitle}</p>
            )}
            {hero.cta && (
              <a
                href={hero.ctaLink || '#contact'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                {hero.cta}
                <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* About Section */}
      {about.title && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">{about.title}</h3>
            {about.description && (
              <p className="text-lg text-gray-700 leading-relaxed">{about.description}</p>
            )}
          </div>
        </section>
      )}

      {/* Services Section */}
      {services.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Services</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service: any, index: number) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{service.name}</h4>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {(contact.email || contact.phone || contact.address) && (
        <section id="contact" className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Contact</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {contact.email && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <a href={`mailto:${contact.email}`} className="text-gray-900 font-semibold hover:text-blue-600">
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <a href={`tel:${contact.phone}`} className="text-gray-900 font-semibold hover:text-blue-600">
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}
              {contact.address && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <p className="text-gray-900 font-semibold">{contact.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 mb-4">
            © {new Date().getFullYear()} {website.title}. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              Corefy
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}

// ================================
// Minimal 템플릿
// ================================
function MinimalTemplate({ website, content, settings, profile }: any) {
  const hero = content.hero || {}
  const about = content.about || {}
  const services = content.services || []
  const contact = content.contact || {}

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-light tracking-tight">{website.title}</h1>
          {profile.display_name && (
            <p className="text-sm text-gray-500 mt-2">by {profile.display_name}</p>
          )}
        </div>
      </header>

      {/* Hero */}
      {hero.title && (
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-light mb-6 leading-tight">{hero.title}</h2>
            {hero.subtitle && (
              <p className="text-lg text-gray-600 leading-relaxed">{hero.subtitle}</p>
            )}
          </div>
        </section>
      )}

      {/* About */}
      {about.description && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">{about.description}</p>
          </div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            {services.map((service: any, index: number) => (
              <div key={index} className="border-b border-gray-200 pb-8 last:border-0">
                <h3 className="text-2xl font-light mb-3">{service.name}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      {contact.email && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-light mb-8">Get in touch</h3>
            <a
              href={`mailto:${contact.email}`}
              className="inline-block px-8 py-3 border-2 border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-colors"
            >
              {contact.email}
            </a>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-5xl mx-auto text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {website.title}</p>
        </div>
      </footer>
    </div>
  )
}

// ================================
// Creative 템플릿
// ================================
function CreativeTemplate({ website, content, settings, profile }: any) {
  const hero = content.hero || {}
  const about = content.about || {}
  const services = content.services || []
  const contact = content.contact || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{website.title}</h1>
            {profile.display_name && (
              <p className="text-sm opacity-80">by {profile.display_name}</p>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      {hero.title && (
        <section className="py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-6xl font-black mb-6 leading-tight">{hero.title}</h2>
            {hero.subtitle && (
              <p className="text-2xl opacity-90 mb-12">{hero.subtitle}</p>
            )}
            {hero.cta && (
              <a
                href={hero.ctaLink || '#contact'}
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-purple-600 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
              >
                {hero.cta}
                <ExternalLink className="w-6 h-6" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* About */}
      {about.description && (
        <section className="py-20 px-4 backdrop-blur-md bg-white/10">
          <div className="max-w-4xl mx-auto">
            <p className="text-xl leading-relaxed opacity-90">{about.description}</p>
          </div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: any, index: number) => (
              <div
                key={index}
                className="backdrop-blur-md bg-white/10 p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-2xl font-bold mb-3">{service.name}</h3>
                <p className="opacity-80 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      {contact.email && (
        <section id="contact" className="py-20 px-4 backdrop-blur-md bg-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl font-bold mb-12">Let's Connect! 🚀</h3>
            <div className="space-y-4">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-full font-bold hover:scale-105 transition-transform"
              >
                <Mail className="w-5 h-5" />
                {contact.email}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="backdrop-blur-md bg-white/10 border-t border-white/20 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="opacity-80">© {new Date().getFullYear()} {website.title}</p>
        </div>
      </footer>
    </div>
  )
}

// ================================
// Default 템플릿
// ================================
function DefaultTemplate({ website, content, settings, profile }: any) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{website.title}</h1>
        <p className="text-gray-600">{website.description}</p>
        
        <div className="mt-12">
          <p className="text-sm text-gray-500">
            Powered by <Link href="/" className="text-blue-600 hover:underline">Corefy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
