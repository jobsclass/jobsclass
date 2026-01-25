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
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

// 🎯 단순화된 메뉴 구조 (하위메뉴 없음)
const navigation = [
  { 
    name: '대시보드', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    description: '전체 현황 보기'
  },
  { 
    name: '웹사이트 설정', 
    href: '/dashboard/settings/website', 
    icon: SettingsIcon,
    description: '기본 정보·프로필·디자인'
  },
  { 
    name: '서비스', 
    href: '/dashboard/services', 
    icon: Package,
    description: '지식 서비스 관리'
  },
  { 
    name: '블로그', 
    href: '/dashboard/blog', 
    icon: PenTool,
    description: '블로그 글 관리'
  },
  { 
    name: '포트폴리오', 
    href: '/dashboard/portfolio', 
    icon: Briefcase,
    description: '작업물 관리'
  },
  { 
    name: '고객', 
    href: '/dashboard/customers', 
    icon: Users,
    description: '고객·문의 관리'
  },
  { 
    name: '주문', 
    href: '/dashboard/orders', 
    icon: CreditCard,
    description: '주문·매출 관리'
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profileUrl, setProfileUrl] = useState<string>('')

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

  return (
    <aside className="w-64 bg-gray-950/50 backdrop-blur-xl border-r border-gray-800 flex flex-col">
      {/* 로고 */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold group-hover:text-primary-400 transition-colors">Corefy</h1>
            <p className="text-xs text-gray-500">WebBuilder</p>
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

      {/* 내 웹사이트 미리보기 */}
      {profileUrl && (
        <div className="p-4 border-t border-gray-800">
          <Link 
            href={`/${profileUrl}`}
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-500/20 rounded-xl hover:border-primary-500/40 transition-all group"
          >
            <Eye className="w-4 h-4 text-primary-400" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">내 웹사이트 보기</p>
              <p className="text-sm font-medium text-primary-400 truncate">/{profileUrl}</p>
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
  )
}
