'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    if (postId) loadPost()
  }, [postId])

  const loadPost = async () => {
    try {
      const response = await fetch(`/api/blog/edit?id=${postId}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      
      if (data.post) {
        setFormData({
          title: data.post.title || '',
          slug: data.post.slug || '',
          excerpt: data.post.excerpt || '',
          content: data.post.content || '',
          category: data.post.category || '',
          tags: data.post.tags?.join(', ') || '',
          featuredImage: null,
          seoTitle: data.post.seo_title || '',
          seoDescription: data.post.seo_description || '',
        })
        if (data.post.featured_image_url) {
          setFeaturedImagePreview(data.post.featured_image_url)
        }
      }
    } catch (error) {
      console.error('Error loading post:', error)
      alert('글을 불러오는데 실패했습니다')
      router.push('/dashboard/blog')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    if (field === 'title') {
      newData.slug = value.toLowerCase().replace(/[^a-z0-9가-힣\s-]/g, '').replace(/\s+/g, '-')
      newData.seoTitle = value
    }
    setFormData(newData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/blog/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: postId,
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          category: formData.category,
          tags: formData.tags,
          seoTitle: formData.seoTitle,
          seoDescription: formData.seoDescription,
          isPublished: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '저장 실패')
      }

      alert('블로그 글이 성공적으로 수정되었습니다!')
      router.push('/dashboard/blog')
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || '글 수정에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="text-gray-400">로딩 중...</div></div>
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="mb-8">
        <Link href="/dashboard/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          블로그 목록으로
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">글 수정</h1>
        <p className="text-gray-400">블로그 글을 수정하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">제목</label>
            <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="글 제목을 입력하세요" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL 슬러그</label>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">/blog/</span>
              <input type="text" value={formData.slug} onChange={(e) => handleInputChange('slug', e.target.value)} className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">요약</label>
            <textarea rows={2} value={formData.excerpt} onChange={(e) => handleInputChange('excerpt', e.target.value)} placeholder="간단한 요약 (150자 이내)" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">본문</label>
            <textarea rows={15} value={formData.content} onChange={(e) => handleInputChange('content', e.target.value)} placeholder="본문 내용을 작성하세요" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none font-mono" required />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">카테고리</label>
              <select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500">
                <option value="">카테고리 선택</option>
                <option value="marketing">마케팅</option>
                <option value="tech">기술</option>
                <option value="business">비즈니스</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">태그</label>
              <input type="text" value={formData.tags} onChange={(e) => handleInputChange('tags', e.target.value)} placeholder="태그를 쉼표로 구분" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500" />
            </div>
          </div>

          <FileUpload label="대표 이미지" description="클릭하여 이미지 업로드 (권장 크기: 1200x630px)" accept="image/*" maxSize={5} value={featuredImagePreview} onChange={(file, preview) => { handleInputChange('featuredImage', file); if (preview) setFeaturedImagePreview(preview) }} preview={true} />
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors">취소</button>
          <button type="submit" disabled={saving} className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50">
            {saving ? '수정 중...' : '수정 완료'}
          </button>
        </div>
      </form>
    </div>
  )
}
