'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Ticket, 
  Settings,
  LogOut,
  PlayCircle,
  Globe,
  Eye
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  { name: '서비스 관리', href: '/dashboard/services', icon: Package },
  { name: '주문 관리', href: '/dashboard/orders', icon: ShoppingCart },
  { name: '쿠폰 관리', href: '/dashboard/coupons', icon: Ticket },
  { name: '설정', href: '/dashboard/settings', icon: Settings },
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
          .from('partner_profiles')
          .select('profile_url')
          .eq('user_id', user.id)
          .single()
        
        if (profile) {
          setProfileUrl(profile.profile_url)
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
    <div className="flex flex-col h-full bg-gray-950/50 backdrop-blur-xl border-r border-gray-800 text-white w-64">
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
            <PlayCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Corefy</h1>
            <p className="text-xs text-gray-400">Partner Dashboard</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
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
          )
        })}

        {/* 내 웹사이트 섹션 */}
        {profileUrl && (
          <>
            <div className="pt-6 pb-2 px-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                내 웹사이트
              </h3>
            </div>
            <Link
              href={`/p/${profileUrl}`}
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
