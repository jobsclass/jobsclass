'use client'

import { useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface FileUploadProps {
  label?: string
  description?: string
  accept?: string
  maxSize?: number // MB
  value?: string
  onChange?: (file: File | null, previewUrl?: string) => void
  preview?: boolean
  className?: string
}

export default function FileUpload({
  label,
  description,
  accept = 'image/*',
  maxSize = 2,
  value,
  onChange,
  preview = true,
  className = ''
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError(null)

    if (!file) {
      return
    }

    // 파일 크기 검증
    if (file.size > maxSize * 1024 * 1024) {
      setError(`파일 크기는 ${maxSize}MB 이하여야 합니다`)
      return
    }

    // 이미지 미리보기
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        setPreviewUrl(url)
        onChange?.(file, url)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
      onChange?.(file)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onChange?.(null)
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {previewUrl && preview ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl border border-gray-700"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
        >
          <div className="flex flex-col items-center gap-2">
            {preview ? (
              <ImageIcon className="w-8 h-8 text-gray-500" />
            ) : (
              <Upload className="w-8 h-8 text-gray-500" />
            )}
            <p className="text-gray-400 text-sm">
              {description || '클릭하여 파일 업로드'}
            </p>
            <p className="text-gray-600 text-xs">
              {accept === 'image/*' ? 'PNG, JPG' : accept} (최대 {maxSize}MB)
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
