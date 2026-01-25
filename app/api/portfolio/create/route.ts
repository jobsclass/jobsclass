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
      description,
      client,
      projectDate,
      duration,
      projectUrl,
      technologies = [],
      category,
      images = [],
      isPublished = false,
    } = body

    if (!title || !slug || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        title,
        slug,
        description,
        client,
        project_date: projectDate,
        duration,
        project_url: projectUrl,
        technologies,
        category_id: category,
        media: images,
        is_published: isPublished,
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
