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
  PlayCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      <div className="p-6">
        <Link href="/dashboard" className="text-2xl font-bold">
          JobsClass
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  )
}
