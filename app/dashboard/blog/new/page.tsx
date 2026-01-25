'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'

export default function NewBlogPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featuredImage: null as File | null,
    seoTitle: '',
    seoDescription: '',
  })

  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('')

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    
    if (field === 'title') {
      newData.slug = value.toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
      newData.seoTitle = value
    }
    
    setFormData(newData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Blog submitted:', formData)
    router.push('/dashboard/blog')
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="mb-8">
        <Link href="/dashboard/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          블로그 목록으로
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">새 글 쓰기</h1>
        <p className="text-gray-400">블로그 글을 작성하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="글 제목을 입력하세요"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL 슬러그</label>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">/blog/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">요약</label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="간단한 요약 (150자 이내)"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">본문</label>
            <textarea
              rows={15}
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="본문 내용을 작성하세요"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">카테고리</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
              >
                <option value="">카테고리 선택</option>
                <option value="marketing">마케팅</option>
                <option value="tech">기술</option>
                <option value="business">비즈니스</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">태그</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="태그를 쉼표로 구분"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <FileUpload
            label="대표 이미지"
            description="클릭하여 이미지 업로드 (권장 크기: 1200x630px)"
            accept="image/*"
            maxSize={5}
            value={featuredImagePreview}
            onChange={(file, preview) => {
              handleInputChange('featuredImage', file)
              if (preview) setFeaturedImagePreview(preview)
            }}
            preview={true}
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all"
          >
            발행하기
          </button>
        </div>
      </form>
    </div>
  )
}
