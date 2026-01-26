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
