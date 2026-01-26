'use client'

import { Star } from 'lucide-react'

interface Review {
  id: string
  rating: number
  title?: string
  content: string
  buyer?: {
    display_name: string
  }
  created_at: string
}

interface ReviewListProps {
  reviews: Review[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">아직 리뷰가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-xl p-6 border border-gray-200">
          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {review.rating}.0
            </span>
          </div>

          {/* Title */}
          {review.title && (
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              {review.title}
            </h4>
          )}

          {/* Content */}
          <p className="text-gray-700 mb-4">{review.content}</p>

          {/* Buyer & Date */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="font-medium">
              {review.buyer?.display_name || '익명'}
            </span>
            <span>
              {new Date(review.created_at).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
