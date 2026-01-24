'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'

const SERVICE_TYPES = [
  { value: 'online-course', label: '온라인 강의' },
  { value: 'offline-course', label: '오프라인 강의' },
  { value: 'consulting', label: '컨설팅' },
  { value: 'bootcamp', label: '부트캠프' },
  { value: 'coaching', label: '코칭' },
  { value: 'event', label: '이벤트' },
  { value: 'professional-service', label: '전문 서비스' },
]

export default function NewServicePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    service_type: 'online-course',
    price: '',
    instructor_name: '',
  })
  const [loading, setLoading] = useState(false)

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: generateSlug(value),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const { data, error } = await supabase
        .from('services')
        .insert({
          partner_id: user.id,
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          service_type: formData.service_type,
          price: parseFloat(formData.price),
          instructor_name: formData.instructor_name,
          is_published: true,
        })
        .select()
        .single()

      if (error) throw error

      alert('서비스가 등록되었습니다!')
      router.push('/dashboard/services')
    } catch (err: any) {
      alert(err.message || '등록 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">새 서비스 등록</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">서비스 타입</label>
          <select
            value={formData.service_type}
            onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {SERVICE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">서비스명</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="예: Next.js 마스터 클래스"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">URL 슬러그</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">설명</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={6}
            placeholder="서비스에 대한 상세 설명을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">가격 (원)</label>
          <input
            type="number"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="100000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">강사명</label>
          <input
            type="text"
            required
            value={formData.instructor_name}
            onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="홍길동"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? '등록 중...' : '서비스 등록'}
          </button>
        </div>
      </form>
    </div>
  )
}
