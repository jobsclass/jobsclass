import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 요청 데이터
    const body = await request.json()
    const { 
      template, 
      title, 
      slug, 
      description, 
      content, 
      settings,
      problem_category,
      solution_types,
      target_customer
    } = body

    // 필수 필드 검증
    if (!template || !title || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: template, title, slug' },
        { status: 400 }
      )
    }

    // slug 중복 확인
    const { data: existing } = await supabase
      .from('websites')
      .select('id')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists. Please choose a different one.' },
        { status: 400 }
      )
    }

    // 웹사이트 생성
    const { data: website, error } = await supabase
      .from('websites')
      .insert({
        user_id: user.id,
        template_id: template,
        title,
        slug,
        description: description || '',
        problem_category: problem_category || null,
        solution_types: solution_types || [],
        target_customer: target_customer || null,
        content: content || {},
        settings: settings || {
          colors: {
            primary: '#3B82F6',
            secondary: '#8B5CF6',
            accent: '#F59E0B'
          },
          fonts: {
            heading: 'Pretendard',
            body: 'Pretendard'
          }
        },
        is_published: true,
        published_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ website }, { status: 201 })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
