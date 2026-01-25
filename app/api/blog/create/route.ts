import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      tags = [],
      featuredImage,
      seoTitle,
      seoDescription,
      isPublished = false,
    } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Slug 중복 확인
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        user_id: user.id,
        title,
        slug,
        excerpt,
        content,
        category_id: category,
        tags,
        featured_image: featuredImage,
        seo_title: seoTitle,
        seo_description: seoDescription,
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
