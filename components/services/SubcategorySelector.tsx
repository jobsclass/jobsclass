'use client'

import { ServiceCategory, ServiceSubcategory } from '@/types/database'
import { getCategoryById } from '@/lib/categories'

interface SubcategorySelectorProps {
  categoryId: ServiceCategory
  selectedSubcategory?: ServiceSubcategory
  onSelect: (subcategory: ServiceSubcategory) => void
}

export default function SubcategorySelector({
  categoryId,
  selectedSubcategory,
  onSelect,
}: SubcategorySelectorProps) {
  const category = getCategoryById(categoryId)

  if (!category) return null

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-200">
        세부 분류 선택
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {category.subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            type="button"
            onClick={() => onSelect(subcategory.id as ServiceSubcategory)}
            className={`
              group relative p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${
                selectedSubcategory === subcategory.id
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-primary-400 hover:bg-gray-800'
              }
            `}
          >
            <h4
              className={`
                font-semibold mb-2 transition-colors
                ${selectedSubcategory === subcategory.id ? 'text-primary-400' : 'text-white'}
              `}
            >
              {subcategory.name}
            </h4>

            <div className="flex flex-wrap gap-1">
              {subcategory.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded"
                >
                  {tag}
                </span>
              ))}
              {subcategory.tags.length > 3 && (
                <span className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded">
                  +{subcategory.tags.length - 3}
                </span>
              )}
            </div>

            {selectedSubcategory === subcategory.id && (
              <div className="absolute top-2 right-2">
                <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
