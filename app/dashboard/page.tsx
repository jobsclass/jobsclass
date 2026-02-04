import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 프로필 조회
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/signup')
  }

  // 🚀 역할에 따라 대시보드 분기
  const userRole = profile.role || profile.user_type || 'buyer'
  
  if (userRole === 'partner') {
    redirect('/partner/dashboard')
  }
  
  if (userRole === 'buyer' || userRole === 'client') {
    redirect('/client/dashboard')
  }

  if (userRole === 'admin') {
    redirect('/admin')
  }

  // 기본: 파트너 대시보드로
  redirect('/partner/dashboard')
}
