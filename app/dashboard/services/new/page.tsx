'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'
import { ServiceCategory, ServiceSubcategory } from '@/types/database'
import CategorySelector from '@/components/services/CategorySelector'
import SubcategorySelector from '@/components/services/SubcategorySelector'
import TagInput from '@/components/services/TagInput'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewServicePage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1) // 1: 카테고리, 2: 세부정보
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category_1: '' as ServiceCategory | '',
    category_2: '' as ServiceSubcategory | '',
    tags: [] as string[],
    base_price: '',
    discount_price: '',
    thumbnail_url: '',
    instructor_name: '',
    instructor_bio: '',
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
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const { data, error } = await supabase
        .from('services')
        .insert({
          partner_id: user.id,
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          category_1: formData.category_1,
          category_2: formData.category_2 || null,
          tags: formData.tags.length > 0 ? JSON.stringify(formData.tags) : null,
          base_price: formData.base_price ? parseFloat(formData.base_price) : null,
          discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
          thumbnail_url: formData.thumbnail_url || null,
          instructor_name: formData.instructor_name,
          instructor_bio: formData.instructor_bio || null,
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

  const canProceed = step === 1 ? !!formData.category_1 : true

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">새 서비스 등록</h1>
          <p className="text-gray-400">
            {step === 1
              ? '카테고리를 선택하여 서비스를 등록하세요'
              : '서비스 상세 정보를 입력하세요'}
          </p>
        </div>

        {/* 진행 단계 */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-400' : 'text-gray-600'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-500'
              }`}
            >
              1
            </div>
            <span className="font-medium">카테고리 선택</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-800"></div>
          <div
            className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-400' : 'text-gray-600'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-500'
              }`}
            >
              2
            </div>
            <span className="font-medium">서비스 정보</span>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 space-y-8">
              {/* 대분류 선택 */}
              <CategorySelector
                selectedCategory={formData.category_1 || undefined}
                onSelect={(category) => setFormData({ ...formData, category_1: category, category_2: '' })}
              />

              {/* 세부 분류 선택 */}
              {formData.category_1 && (
                <SubcategorySelector
                  categoryId={formData.category_1}
                  selectedSubcategory={formData.category_2 || undefined}
                  onSelect={(subcategory) => setFormData({ ...formData, category_2: subcategory })}
                />
              )}

              {/* 태그 입력 */}
              {formData.category_1 && formData.category_2 && (
                <TagInput
                  categoryId={formData.category_1}
                  subcategoryId={formData.category_2}
                  selectedTags={formData.tags}
                  onTagsChange={(tags) => setFormData({ ...formData, tags })}
                />
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceed}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  다음 단계
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 space-y-6">
              {/* 서비스명 */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  서비스명 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="예: Next.js 마스터 클래스"
                />
              </div>

              {/* URL 슬러그 */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  URL 슬러그 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  공개 URL: /p/[your-name]/{formData.slug || 'service-slug'}
                </p>
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  서비스 설명 <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  rows={6}
                  placeholder="서비스에 대한 상세 설명을 입력하세요"
                />
              </div>

              {/* 가격 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">기본 가격 (원)</label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">할인 가격 (원)</label>
                  <input
                    type="number"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="80000"
                  />
                </div>
              </div>

              {/* 썸네일 */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">썸네일 이미지 URL</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="https://example.com/thumbnail.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  이미지 URL을 입력하세요 (추천: 1200x630px)
                </p>
                {formData.thumbnail_url && (
                  <div className="mt-3">
                    <img
                      src={formData.thumbnail_url}
                      alt="Thumbnail preview"
                      className="w-full max-w-md rounded-lg border-2 border-gray-700"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 강사명 */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  강사/제공자명 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.instructor_name}
                  onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="홍길동"
                />
              </div>

              {/* 강사 소개 */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">강사/제공자 소개</label>
                <textarea
                  value={formData.instructor_bio}
                  onChange={(e) => setFormData({ ...formData, instructor_bio: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  rows={4}
                  placeholder="강사님의 경력과 전문성을 소개해주세요"
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  이전
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-all font-semibold"
                >
                  <Save className="w-5 h-5" />
                  {loading ? '등록 중...' : '서비스 등록'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
