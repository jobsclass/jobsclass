'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Settings as SettingsIcon,
  Package,
  PenTool,
  Briefcase,
  Users,
  CreditCard,
  LogOut,
  Eye,
  Sparkles,
  Menu,
  X,
  Star,
  MessageCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

// 🎯 파트너 대시보드 메뉴 (상품 관리 중심)
const navigation = [
  { 
    name: '대시보드', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    description: '판매 현황 보기'
  },
  { 
    name: '상품 관리', 
    href: '/dashboard/products', 
    icon: Package,
    description: '내 상품 목록'
  },
  { 
    name: '상품 등록', 
    href: '/dashboard/products/new', 
    icon: Sparkles,
    description: 'AI로 3분 만에 등록'
  },
  { 
    name: '메시지', 
    href: '/messages', 
    icon: MessageCircle,
    description: '클라이언트 문의'
  },
  { 
    name: '주문/결제', 
    href: '/dashboard/orders', 
    icon: CreditCard,
    description: '주문 및 매출 관리'
  },
  { 
    name: '리뷰 관리', 
    href: '/dashboard/reviews', 
    icon: Star,
    description: '구매자 리뷰'
  },
  { 
    name: '프로필 설정', 
    href: '/dashboard/profile', 
    icon: SettingsIcon,
    description: '파트너 프로필'
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profileUrl, setProfileUrl] = useState<string>('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // 모바일 메뉴 닫기 (링크 클릭 시)
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* 모바일 헤더 (md 미만에서만 표시) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">JobsClass</h1>
            </div>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 오버레이 */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 사이드바 - 데스크탑: 항상 표시, 모바일: 슬라이드 */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-gray-950/50 backdrop-blur-xl border-r border-gray-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:mt-0 mt-[57px]
      `}>
        {/* 로고 - 데스크탑에서만 표시 */}
        <div className="hidden md:block p-6 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <div>
              <h1 className="text-white font-bold group-hover:text-primary-400 transition-colors">JobsClass</h1>
              <p className="text-xs text-gray-500">AI 지식 마켓플레이스</p>
            </div>
          </Link>
        </div>

        {/* 메인 네비게이션 */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                  ${isActive 
                    ? 'bg-primary-500/10 text-primary-400' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isActive ? 'text-primary-400' : 'text-gray-300'}`}>
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{item.description}</p>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* 내 파트너 페이지 미리보기 */}
        {profileUrl && (
          <div className="p-4 border-t border-gray-800">
            <Link 
              href={`/partners/${profileUrl}`}
              target="_blank"
              onClick={handleLinkClick}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-500/20 rounded-xl hover:border-primary-500/40 transition-all group"
            >
              <Eye className="w-4 h-4 text-primary-400" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">내 파트너 페이지 보기</p>
                <p className="text-sm font-medium text-primary-400 truncate">/partners/{profileUrl}</p>
              </div>
            </Link>
          </div>
        )}

        {/* 로그아웃 */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-400" />
            <span className="text-sm font-medium">로그아웃</span>
          </button>
        </div>
      </aside>
    </>
  )
}
