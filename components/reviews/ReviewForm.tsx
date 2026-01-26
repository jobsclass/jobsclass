'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ReviewFormProps {
  productId: string
  userId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReviewForm({ productId, userId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // TODO: API 호출로 리뷰 제출
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userId,
          rating,
          title,
          content
        })
      })

      if (!response.ok) throw new Error('Failed to submit review')

      setRating(5)
      setTitle('')
      setContent('')
      
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Review submission error:', error)
      alert('리뷰 작성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4">리뷰 작성</h3>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          별점
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 transition ${
                  value <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600 font-medium">
            {rating}.0
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제목 (선택)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="리뷰 제목을 입력하세요"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
        />
      </div>

      {/* Content */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          내용 *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="상품에 대한 솔직한 리뷰를 작성해주세요"
          required
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
        />
      </div>

      {/* Submit & Cancel */}
      <div className="flex gap-3">
        {onCancel && (
          <Button 
            type="button" 
            onClick={onCancel}
            variant="outline" 
            className="flex-1"
          >
            취소
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={loading || !content.trim()} 
          className="flex-1"
        >
          {loading ? '작성 중...' : '리뷰 등록'}
        </Button>
      </div>
    </form>
  )
}
