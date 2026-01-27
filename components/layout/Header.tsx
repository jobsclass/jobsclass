'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Package, ShoppingCart, CreditCard, User, LogOut, Menu, X } from 'lucide-react'

type UserProfile = {
  user_id: string
  user_type: 'partner' | 'client'
  display_name: string
  avatar_url?: string
}

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('user_id, user_type, display_name, avatar_url')
            .eq('user_id', user.id)
            .single()
          
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <span className="text-xl font-bold text-gray-900">JobsClass</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className="text-gray-700 hover:text-blue-600 font-medium transition">
              마켓플레이스
            </Link>
            
            {profile?.user_type === 'partner' && (
              <>
                <Link href="/dashboard/services" className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 font-medium transition">
                  <Package className="w-4 h-4" />
                  <span>내 서비스</span>
                </Link>
                <Link href="/partner/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition">
                  대시보드
                </Link>
              </>
            )}
            
            {profile?.user_type === 'client' && (
              <>
                <Link href="/client/dashboard" className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 font-medium transition">
                  <ShoppingCart className="w-4 h-4" />
                  <span>내 구매</span>
                </Link>
                <Link href="/credits" className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 font-medium transition">
                  <CreditCard className="w-4 h-4" />
                  <span>크레딧</span>
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : user && profile ? (
              <>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.display_name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                      {profile.display_name[0]}
                    </div>
                  )}
                  <span>{profile.display_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/user/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/user/signup"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-blue-500/30"
                >
                  시작하기
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-2">
              <Link 
                href="/marketplace" 
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                마켓플레이스
              </Link>
              
              {profile?.user_type === 'partner' && (
                <>
                  <Link 
                    href="/dashboard/services" 
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="w-4 h-4" />
                    <span>내 서비스</span>
                  </Link>
                  <Link 
                    href="/partner/dashboard" 
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    대시보드
                  </Link>
                </>
              )}
              
              {profile?.user_type === 'client' && (
                <>
                  <Link 
                    href="/client/dashboard" 
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>내 구매</span>
                  </Link>
                  <Link 
                    href="/credits" 
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>크레딧</span>
                  </Link>
                </>
              )}

              {user && profile && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>프로필</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>로그아웃</span>
                  </button>
                </>
              )}

              {!user && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    href="/auth/user/login"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/user/signup"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    시작하기
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
