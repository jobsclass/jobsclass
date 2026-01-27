'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { loadTossPayments } from '@tosspayments/payment-sdk'
import { Coins, Loader2, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const CREDIT_PACKAGES = [
  {
    credits: 10000,
    price: 10000,
    bonus: 0,
    popular: false,
  },
  {
    credits: 55000,
    price: 50000,
    bonus: 5000,
    popular: true,
  },
  {
    credits: 120000,
    price: 100000,
    bonus: 20000,
    popular: false,
  },
  {
    credits: 260000,
    price: 200000,
    bonus: 60000,
    popular: false,
  },
  {
    credits: 550000,
    price: 500000,
    bonus: 50000,
    popular: false,
  },
]

export default function CreditChargePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [currentCredits, setCurrentCredits] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/user/login')
      return
    }

    setUser(user)

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (profile) {
      setCurrentCredits(profile.credits || 0)
    }
  }

  const handleCharge = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    if (!user) {
      alert('로그인이 필요합니다')
      router.push('/auth/user/login')
      return
    }

    setLoading(true)
    try {
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
      )

      const orderNumber = `CREDIT-${Date.now()}`

      await tossPayments.requestPayment('카드', {
        amount: pkg.price,
        orderId: orderNumber,
        orderName: `크레딧 ${pkg.credits}개 충전${pkg.bonus > 0 ? ` (+${pkg.bonus} 보너스)` : ''}`,
        customerName: user.email,
        customerEmail: user.email,
        successUrl: `${window.location.origin}/credits/charge/success`,
        failUrl: `${window.location.origin}/credits/charge/fail`,
      })
    } catch (error: any) {
      console.error('크레딧 충전 오류:', error)
      alert(error.message || '충전을 시작할 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          대시보드로 돌아가기
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">크레딧 충전</h1>
          <p className="text-gray-400">
            크레딧으로 니즈에 제안을 보내고 더 많은 기회를 만드세요
          </p>
        </div>

        {/* 현재 크레딧 */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">현재 보유 크레딧</div>
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-yellow-400" />
                <span className="text-3xl font-bold text-white">{currentCredits}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">크레딧 사용처</div>
              <div className="text-sm text-gray-300">• 니즈에 제안 보내기 (10 크레딧)</div>
              <div className="text-sm text-gray-300">• AI 기능 사용 (추후)</div>
            </div>
          </div>
        </div>

        {/* 충전 패키지 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.credits}
              className={`card p-8 relative ${
                pkg.popular ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    인기
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins className="w-8 h-8 text-yellow-400" />
                  <div className="text-4xl font-bold text-white">{pkg.credits}</div>
                </div>
                <div className="text-gray-400">크레딧</div>

                {pkg.bonus > 0 && (
                  <div className="mt-2 inline-block px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                    <span className="text-green-400 text-sm font-semibold">
                      +{pkg.bonus} 보너스 🎁
                    </span>
                  </div>
                )}
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-1">
                  ₩{pkg.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  1크레딧당 ₩{Math.round(pkg.price / (pkg.credits + pkg.bonus))}
                </div>
              </div>

              <button
                onClick={() => handleCharge(pkg)}
                disabled={loading}
                className={`w-full px-6 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white hover:shadow-lg hover:shadow-primary-500/50'
                    : 'bg-dark-800 text-white hover:bg-dark-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    충전하기
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* 안내 사항 */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-white mb-4">💡 크레딧 안내</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-1">•</span>
              <span>크레딧은 니즈에 제안을 보낼 때 사용됩니다 (제안 1건당 10 크레딧)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-1">•</span>
              <span>5만원 이상 충전 시 10% 보너스, 10만원 이상 충전 시 20% 보너스가 지급됩니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-1">•</span>
              <span>크레딧은 환불되지 않습니다 (결제 취소는 즉시 가능)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-1">•</span>
              <span>크레딧 사용 내역은 대시보드에서 확인할 수 있습니다</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
