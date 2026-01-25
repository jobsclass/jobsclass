'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Globe,
  User,
  Package,
  PenTool,
  Briefcase,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  PlayCircle,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

// 메뉴 구조
const navigation = [
  { 
    name: '대시보드', 
    href: '/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    name: '웹사이트 관리', 
    href: '/dashboard/website', 
    icon: Globe,
    children: [
      { name: '웹사이트 설정', href: '/dashboard/website' },
      { name: '섹션 관리', href: '/dashboard/website/sections' },
      { name: '디자인 설정', href: '/dashboard/website/design' },
    ]
  },
  { 
    name: '프로필 관리', 
    href: '/dashboard/profile', 
    icon: User,
    children: [
      { name: '기본 정보', href: '/dashboard/profile' },
      { name: '경력 사항', href: '/dashboard/profile/experiences' },
      { name: '학력 사항', href: '/dashboard/profile/educations' },
      { name: '자격증/수상', href: '/dashboard/profile/certifications' },
      { name: 'SNS 링크', href: '/dashboard/profile/social' },
    ]
  },
  { 
    name: '상품 관리', 
    href: '/dashboard/products', 
    icon: Package,
    children: [
      { name: '상품 목록', href: '/dashboard/products' },
      { name: '새 상품 등록', href: '/dashboard/products/new' },
      { name: '카테고리 관리', href: '/dashboard/products/categories' },
    ]
  },
  { 
    name: '블로그 관리', 
    href: '/dashboard/blog', 
    icon: PenTool,
    children: [
      { name: '글 목록', href: '/dashboard/blog' },
      { name: '새 글 쓰기', href: '/dashboard/blog/new' },
      { name: '카테고리 관리', href: '/dashboard/blog/categories' },
    ]
  },
  { 
    name: '포트폴리오 관리', 
    href: '/dashboard/portfolio', 
    icon: Briefcase,
    children: [
      { name: '포트폴리오 목록', href: '/dashboard/portfolio' },
      { name: '새 항목 추가', href: '/dashboard/portfolio/new' },
      { name: '카테고리 관리', href: '/dashboard/portfolio/categories' },
    ]
  },
  { 
    name: '고객 관리', 
    href: '/dashboard/customers', 
    icon: Users,
    children: [
      { name: '고객 목록', href: '/dashboard/customers' },
      { name: '문의 관리', href: '/dashboard/customers/inquiries' },
    ]
  },
  { 
    name: '결제 관리', 
    href: '/dashboard/orders', 
    icon: CreditCard,
    children: [
      { name: '주문 목록', href: '/dashboard/orders' },
      { name: '매출 통계', href: '/dashboard/orders/stats' },
      { name: '환불 요청', href: '/dashboard/orders/refunds' },
    ]
  },
  { 
    name: '통계/분석', 
    href: '/dashboard/analytics', 
    icon: BarChart3 
  },
  { 
    name: '설정', 
    href: '/dashboard/settings', 
    icon: Settings 
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profileUrl, setProfileUrl] = useState<string>('')
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('user_id', user.id)
          .single()
        
        if (profile) {
          setProfileUrl(profile.username)
        }
      }
    }
    fetchProfile()
  }, [])

  // 현재 경로에 해당하는 메뉴 자동 확장
  useEffect(() => {
    const expanded: string[] = []
    navigation.forEach((item) => {
      if (item.children && pathname.startsWith(item.href)) {
        expanded.push(item.href)
      }
    })
    setExpandedMenus(expanded)
  }, [pathname])

  const toggleMenu = (href: string) => {
    setExpandedMenus((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex flex-col h-full bg-gray-950/50 backdrop-blur-xl border-r border-gray-800 text-white w-64">
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
            <PlayCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Corefy</h1>
            <p className="text-xs text-gray-400">WebBuilder</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isChildActive = item.children?.some((child) => 
            pathname === child.href || pathname.startsWith(child.href + '/')
          )
          const isExpanded = expandedMenus.includes(item.href)
          const hasChildren = item.children && item.children.length > 0
          
          return (
            <div key={item.href}>
              {/* 메인 메뉴 */}
              {hasChildren ? (
                <button
                  onClick={() => toggleMenu(item.href)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full ${
                    isActive || isChildActive
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/20'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium flex-1 text-left">{item.name}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/20'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )}

              {/* 서브 메뉴 */}
              {hasChildren && isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children!.map((child) => {
                    const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/')
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                          isChildActive
                            ? 'bg-primary-500/20 text-primary-300 font-medium'
                            : 'text-gray-500 hover:bg-gray-800/30 hover:text-gray-300'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {child.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* 내 웹사이트 미리보기 */}
        {profileUrl && (
          <>
            <div className="pt-6 pb-2 px-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                내 웹사이트
              </h3>
            </div>
            <Link
              href={`/${profileUrl}`}
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-primary-500/10 hover:text-primary-400 transition-all duration-200 group"
            >
              <Globe className="w-5 h-5" />
              <span className="font-medium">미리보기</span>
              <Eye className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">로그아웃</span>
        </button>
      </div>
    </div>
  )
}
