'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditServicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    base_price: '',
    discount_price: '',
    instructor_name: '',
    instructor_bio: '',
    is_published: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchService = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        setError('서비스를 찾을 수 없습니다')
        setLoading(false)
        return
      }

      setFormData({
        title: data.title,
        description: data.description,
        base_price: data.base_price || '',
        discount_price: data.discount_price || '',
        instructor_name: data.instructor_name,
        instructor_bio: data.instructor_bio || '',
        is_published: data.is_published,
      })
      setLoading(false)
    }

    fetchService()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('services')
        .update({
          title: formData.title,
          description: formData.description,
          base_price: formData.base_price ? parseFloat(formData.base_price) : null,
          discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
          instructor_name: formData.instructor_name,
          instructor_bio: formData.instructor_bio,
          is_published: formData.is_published,
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      alert('서비스가 수정되었습니다!')
      router.push('/dashboard/services')
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
          href="/dashboard/services"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          서비스 목록으로
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">서비스 편집</h1>
        <p className="text-gray-400">서비스 정보를 수정하세요</p>
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
                서비스 제목 *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input w-full"
                placeholder="서비스 제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                서비스 설명 *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input w-full h-32"
                placeholder="서비스에 대해 자세히 설명해주세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                강사 이름 *
              </label>
              <input
                type="text"
                required
                value={formData.instructor_name}
                onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                className="input w-full"
                placeholder="강사 이름"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                강사 소개
              </label>
              <textarea
                value={formData.instructor_bio}
                onChange={(e) => setFormData({ ...formData, instructor_bio: e.target.value })}
                className="input w-full h-24"
                placeholder="강사에 대한 소개를 입력하세요"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">가격 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                기본 가격 (원)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                className="input w-full"
                placeholder="100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                할인 가격 (원)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.discount_price}
                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                className="input w-full"
                placeholder="80000"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">공개 설정</h2>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-5 h-5 rounded border-gray-700 bg-dark-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900"
            />
            <div>
              <span className="text-white font-medium">서비스 공개</span>
              <p className="text-sm text-gray-400">
                체크하면 고객이 이 서비스를 볼 수 있습니다
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
            href="/dashboard/services"
            className="btn-secondary"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
