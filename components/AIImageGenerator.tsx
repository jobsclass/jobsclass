'use client'

import { useState } from 'react'
import { Sparkles, Wand2, Download, RefreshCw, Loader2 } from 'lucide-react'

interface AIImageGeneratorProps {
  title: string
  category: string
  description?: string
  onImageGenerated: (imageUrl: string) => void
}

export default function AIImageGenerator({
  title,
  category,
  description,
  onImageGenerated
}: AIImageGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string>('')
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!title || !category) {
      setError('서비스명과 카테고리를 먼저 입력해주세요')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/ai/generate-multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTitle: title,
          category,
          keywords: description || ''
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'AI 이미지 생성 실패')
      }

      setGeneratedImage(data.imageUrl)
      onImageGenerated(data.imageUrl)
      
    } catch (err: any) {
      console.error('AI Image generation error:', err)
      setError(err.message || 'AI 이미지 생성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return
    
    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/\s+/g, '-')}-ai-image.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  return (
    <div className="space-y-4">
      {/* AI 생성 버튼 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !title || !category}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI 이미지 생성 중...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              AI로 이미지 생성
            </>
          )}
        </button>

        {generatedImage && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            재생성
          </button>
        )}
      </div>

      {/* 안내 메시지 */}
      {!title || !category ? (
        <p className="text-sm text-gray-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          서비스명과 카테고리를 입력하면 AI가 자동으로 이미지를 생성합니다
        </p>
      ) : null}

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* 생성된 이미지 미리보기 */}
      {generatedImage && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-gray-700">
            <img
              src={generatedImage}
              alt="AI Generated"
              className="w-full h-auto"
            />
            
            {/* 다운로드 버튼 오버레이 */}
            <div className="absolute bottom-4 right-4">
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 font-semibold rounded-lg hover:bg-white transition-colors"
              >
                <Download className="w-4 h-4" />
                다운로드
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI가 생성한 이미지입니다. 마음에 들지 않으면 재생성 버튼을 눌러주세요.</span>
          </div>
        </div>
      )}

      {/* 비용 안내 */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-semibold text-white mb-1">AI 이미지 생성 가이드</p>
            <ul className="space-y-1 text-gray-400">
              <li>• <strong>FREE 플랜</strong>: AI 이미지 생성 불가 (수동 업로드만 가능)</li>
              <li>• <strong>STARTER 플랜</strong>: 월 10개까지 무료</li>
              <li>• <strong>PRO 플랜</strong>: 무제한 생성</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
