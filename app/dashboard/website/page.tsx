'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'

export default function WebsiteSettingsPage() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    logo: null as File | null,
    favicon: null as File | null,
    ogImage: null as File | null,
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    customDomain: '',
    isPublished: false,
    publishDate: ''
  })

  const [logoPreview, setLogoPreview] = useState<string>('')
  const [faviconPreview, setFaviconPreview] = useState<string>('')
  const [ogImagePreview, setOgImagePreview] = useState<string>('')

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    console.log('Saving website settings:', formData)
    // TODO: API 연동
    alert('변경사항이 저장되었습니다!')
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">웹사이트 설정</h1>
        <p className="text-gray-400">웹사이트 기본 정보, SEO, 도메인을 관리하세요</p>
      </div>

      {/* 기본 정보 섹션 */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
        <h2 className="text-xl font-bold text-white mb-6">기본 정보</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              웹사이트 제목
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="예: 홍길동의 포트폴리오"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL 슬러그
            </label>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">corefy.co/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="your-username"
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              웹사이트 설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              placeholder="웹사이트에 대한 간단한 설명을 입력하세요"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FileUpload
              label="로고 업로드"
              description="클릭하여 로고 업로드"
              accept="image/*"
              maxSize={2}
              value={logoPreview}
              onChange={(file, preview) => {
                handleInputChange('logo', file)
                if (preview) setLogoPreview(preview)
              }}
              preview={true}
            />

            <FileUpload
              label="파비콘 업로드"
              description="클릭하여 파비콘 업로드"
              accept="image/*"
              maxSize={1}
              value={faviconPreview}
              onChange={(file, preview) => {
                handleInputChange('favicon', file)
                if (preview) setFaviconPreview(preview)
              }}
              preview={true}
            />
          </div>
        </div>
      </div>

      {/* SEO 설정 섹션 */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
        <h2 className="text-xl font-bold text-white mb-6">SEO 설정</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              메타 제목
            </label>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={(e) => handleInputChange('metaTitle', e.target.value)}
              placeholder="검색 엔진에 표시될 제목"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">최대 60자 ({formData.metaTitle.length}/60)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              메타 설명
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => handleInputChange('metaDescription', e.target.value)}
              rows={3}
              placeholder="검색 결과에 표시될 설명"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">최대 160자 ({formData.metaDescription.length}/160)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              키워드
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              placeholder="키워드를 쉼표로 구분하여 입력"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <FileUpload
            label="OG 이미지"
            description="소셜 미디어 공유 이미지 업로드 (권장 크기: 1200x630px)"
            accept="image/*"
            maxSize={5}
            value={ogImagePreview}
            onChange={(file, preview) => {
              handleInputChange('ogImage', file)
              if (preview) setOgImagePreview(preview)
            }}
            preview={true}
          />
        </div>
      </div>

      {/* 도메인 연결 섹션 */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
        <h2 className="text-xl font-bold text-white mb-6">도메인 연결</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              커스텀 도메인
            </label>
            <input
              type="text"
              value={formData.customDomain}
              onChange={(e) => handleInputChange('customDomain', e.target.value)}
              placeholder="www.yourdomain.com"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-300">도메인 인증 상태</p>
              <p className="text-xs text-gray-500 mt-1">도메인 DNS 설정이 필요합니다</p>
            </div>
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-sm rounded-lg">
              미인증
            </span>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-sm text-blue-300 font-medium mb-2">DNS 설정 가이드</p>
            <div className="space-y-2 text-xs text-gray-400">
              <p>1. 도메인 관리 페이지에서 DNS 설정으로 이동</p>
              <p>2. A 레코드 추가: @ → 123.45.67.89</p>
              <p>3. CNAME 레코드 추가: www → corefy.co</p>
            </div>
          </div>
        </div>
      </div>

      {/* 게시 설정 섹션 */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
        <h2 className="text-xl font-bold text-white mb-6">게시 설정</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-300">웹사이트 공개 상태</p>
              <p className="text-xs text-gray-500 mt-1">웹사이트를 공개하거나 비공개로 설정</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              게시 일시
            </label>
            <input
              type="datetime-local"
              value={formData.publishDate}
              onChange={(e) => handleInputChange('publishDate', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all"
        >
          변경사항 저장
        </button>
      </div>
    </div>
  )
}
