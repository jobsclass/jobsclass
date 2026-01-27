'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCouponPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discount_value: '',
    min_purchase_amount: '',
    max_uses: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // 로그인된 사용자 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('로그인이 필요합니다')

      // 쿠폰 생성
      const { error: insertError } = await supabase
        .from('coupons')
        .insert({
          partner_id: user.id,
          code: formData.code.toUpperCase().trim(),
          discount_type: formData.discount_type,
          discount_value: parseFloat(formData.discount_value),
          min_purchase_amount: formData.min_purchase_amount 
            ? parseFloat(formData.min_purchase_amount) 
            : null,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          valid_from: formData.valid_from || null,
          valid_until: formData.valid_until || null,
          is_active: formData.is_active,
        })

      if (insertError) throw insertError

      alert('쿠폰이 생성되었습니다!')
      router.push('/dashboard/coupons')
    } catch (err: any) {
      console.error('Create error:', err)
      setError(err.message || '쿠폰 생성 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href="/dashboard/coupons"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          쿠폰 목록으로
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">새 쿠폰 생성</h1>
        <p className="text-gray-400">고객에게 제공할 할인 쿠폰을 만드세요</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* 쿠폰 생성 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">기본 정보</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                쿠폰 코드 *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input w-full uppercase"
                placeholder="WELCOME2024"
              />
              <p className="mt-1 text-xs text-gray-500">
                영문 대문자와 숫자를 사용하세요 (예: NEWYEAR2024)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                할인 유형 *
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                className="input w-full"
                required
              >
                <option value="PERCENTAGE">퍼센트 할인 (%)</option>
                <option value="FIXED">정액 할인 (원)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                할인 값 *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                className="input w-full"
                placeholder={formData.discount_type === 'PERCENTAGE' ? '10 (10% 할인)' : '10000 (10,000원 할인)'}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.discount_type === 'PERCENTAGE' 
                  ? '퍼센트 값을 입력하세요 (예: 10 = 10% 할인)' 
                  : '할인 금액을 원 단위로 입력하세요'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">사용 조건</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                최소 구매 금액
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.min_purchase_amount}
                onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                className="input w-full"
                placeholder="50000 (선택사항)"
              />
              <p className="mt-1 text-xs text-gray-500">
                쿠폰을 사용하기 위한 최소 구매 금액 (비워두면 제한 없음)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                최대 사용 횟수
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                className="input w-full"
                placeholder="100 (선택사항)"
              />
              <p className="mt-1 text-xs text-gray-500">
                이 쿠폰을 사용할 수 있는 최대 횟수 (비워두면 무제한)
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">유효 기간</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                시작일
              </label>
              <input
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                종료일
              </label>
              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="input w-full"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            비워두면 기간 제한 없이 사용 가능합니다
          </p>
        </div>

        <div className="card">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-gray-700 bg-dark-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900"
            />
            <div>
              <span className="text-white font-medium">쿠폰 활성화</span>
              <p className="text-sm text-gray-400">
                체크하면 고객이 이 쿠폰을 사용할 수 있습니다
              </p>
            </div>
          </label>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? '생성 중...' : '쿠폰 생성'}
          </button>
          <Link
            href="/dashboard/coupons"
            className="btn-secondary"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
