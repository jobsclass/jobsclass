import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function CouponsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/partner/login')
  }

  // Fetch coupons
  const { data: coupons } = await supabase
    .from('coupons')
    .eq('partner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">쿠폰 관리</h1>
          <p className="text-gray-400">할인 쿠폰을 생성하고 관리하세요</p>
        </div>
        <Link
          href="/dashboard/coupons/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          쿠폰 생성
        </Link>
      </div>

      {!coupons || coupons.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 mb-4">아직 생성된 쿠폰이 없습니다</p>
          <Link href="/dashboard/coupons/new" className="btn-primary inline-block">
            첫 쿠폰 만들기
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon: any) => (
            <div key={coupon.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-bold text-white font-mono">
                      {coupon.code}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      coupon.is_active
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}>
                      {coupon.is_active ? '활성' : '비활성'}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <span>
                      할인: {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value}원`}
                    </span>
                    <span>사용: {coupon.used_count}/{coupon.max_uses || '무제한'}</span>
                    <span>기간: {formatDate(coupon.valid_from)} ~ {formatDate(coupon.valid_until)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary text-sm">수정</button>
                  <button className="btn-secondary text-sm text-red-400 hover:bg-red-500/10">삭제</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
