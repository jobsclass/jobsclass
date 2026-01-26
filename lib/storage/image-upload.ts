import { createClient } from '@/lib/supabase/client'

export async function uploadImage(file: File, folder: string = 'products'): Promise<string> {
  const supabase = createClient()
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)

  return publicUrl
}

export async function deleteImage(url: string): Promise<void> {
  const supabase = createClient()
  
  // Extract file path from URL
  const urlParts = url.split('/storage/v1/object/public/images/')
  if (urlParts.length < 2) {
    throw new Error('Invalid image URL')
  }
  
  const filePath = urlParts[1]

  const { error } = await supabase.storage
    .from('images')
    .remove([filePath])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

export function getPlaceholderImage(category?: string): string {
  // Return a placeholder gradient based on category
  const gradients = {
    course: 'from-blue-400 to-blue-600',
    mentoring: 'from-purple-400 to-purple-600',
    consulting: 'from-green-400 to-green-600',
    ebook: 'from-pink-400 to-pink-600',
    template: 'from-yellow-400 to-yellow-600',
    default: 'from-gray-400 to-gray-600'
  }
  
  const gradient = gradients[category as keyof typeof gradients] || gradients.default
  
  // Return a data URL with gradient
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(59,130,246);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(147,51,234);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#grad)"/>
    </svg>
  `)}`
}
