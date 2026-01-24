'use client'

import { useState } from 'react'
import { ServiceSubcategory } from '@/types/database'
import { getCategoryById, getSubcategoryById } from '@/lib/categories'
import { X } from 'lucide-react'

interface TagInputProps {
  categoryId?: string
  subcategoryId?: ServiceSubcategory
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export default function TagInput({
  categoryId,
  subcategoryId,
  selectedTags,
  onTagsChange,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  // 추천 태그 가져오기
  const suggestedTags =
    categoryId && subcategoryId
      ? getSubcategoryById(categoryId, subcategoryId)?.tags || []
      : []

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-200">
        태그 (검색 최적화)
      </label>

      {/* 선택된 태그 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-300 border border-primary-500/30 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-primary-100 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 태그 입력 */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="태그 입력 후 Enter"
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
      />

      {/* 추천 태그 */}
      {suggestedTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">추천 태그:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTags
              .filter((tag) => !selectedTags.includes(tag))
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300 hover:border-primary-500 hover:text-primary-400 transition-all"
                >
                  + {tag}
                </button>
              ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        태그는 검색 노출을 높이는 데 도움이 됩니다. (최대 10개 권장)
      </p>
    </div>
  )
}
