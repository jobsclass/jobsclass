'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [couponId, setCouponId] = useState<string>('')
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const initPage = async () => {
      const resolvedParams = await params
      setCouponId(resolvedParams.id)
    }
    initPage()
  }, [params])

  useEffect(() => {
    if (!couponId) return
    
    const fetchCoupon = async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', couponId)
        .single()

      if (error || !data) {
        setError('쿠폰을 찾을 수 없습니다')
        setLoading(false)
        return
      }

      setFormData({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value || '',
        min_purchase_amount: data.min_purchase_amount || '',
        max_uses: data.max_uses || '',
        valid_from: data.valid_from || '',
        valid_until: data.valid_until || '',
        is_active: data.is_active,
      })
      setLoading(false)
    }

    fetchCoupon()
  }, [couponId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('coupons')
        .update({
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
        .eq('id', couponId)

      if (updateError) throw updateError

      alert('쿠폰이 수정되었습니다!')
      router.push('/dashboard/coupons')
    } catch (err: any) {
      console.error('Update error:', err)
      setError(err.message || '수정 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">불러오는 중...</p>
        </div>
      </div>
    )
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
        <h1 className="text-3xl font-bold text-white mb-2">쿠폰 편집</h1>
        <p className="text-gray-400">쿠폰 정보를 수정하세요</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* 편집 폼 */}
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
              />
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
                placeholder="50000"
              />
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
                placeholder="100"
              />
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
            {saving ? '저장 중...' : '변경사항 저장'}
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
