'use client'

import { ServiceCategory } from '@/types/database'
import { CATEGORIES } from '@/lib/categories'

interface CategorySelectorProps {
  selectedCategory?: ServiceCategory
  onSelect: (category: ServiceCategory) => void
}

export default function CategorySelector({ selectedCategory, onSelect }: CategorySelectorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-200">
        카테고리 선택 <span className="text-red-400">*</span>
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id as ServiceCategory)}
            className={`
              group relative p-4 rounded-lg border-2 transition-all duration-200
              ${
                selectedCategory === category.id
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-primary-400 hover:bg-gray-800'
              }
            `}
          >
            <div className="text-left">
              <h3 className={`
                font-semibold mb-1 transition-colors
                ${selectedCategory === category.id ? 'text-primary-400' : 'text-white'}
              `}>
                {category.name}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-2">
                {category.description}
              </p>
            </div>
            
            {selectedCategory === category.id && (
              <div className="absolute top-2 right-2">
                <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
