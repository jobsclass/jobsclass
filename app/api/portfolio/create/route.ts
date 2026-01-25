import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, slug, description, client, projectDate, projectDuration, projectUrl, technologies, category, thumbnail, isPublished = false } = body

    // 필수 필드 검증
    if (!title || !description) {
      return NextResponse.json(
        { error: '제목과 설명은 필수입니다' },
        { status: 400 }
      )
    }

    // slug 중복 확인
    const { data: existingItem } = await supabase
      .from('portfolio_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .single()

    if (existingItem) {
      return NextResponse.json(
        { error: '이미 사용 중인 URL 슬러그입니다' },
        { status: 400 }
      )
    }

    // 기술 스택 배열 필터링 (빈 값 제거)
    const techArray = technologies ? technologies.filter((t: string) => t.trim()) : []

    // 포트폴리오 항목 저장
    const { data: item, error: insertError } = await supabase
      .from('portfolio_items')
      .insert({
        user_id: user.id,
        title,
        slug,
        description,
        client,
        project_date: projectDate || null,
        project_duration: projectDuration || null,
        project_url: projectUrl || null,
        technologies: techArray,
        category,
        thumbnail_url: thumbnail || null,
        is_published: isPublished,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: '포트폴리오 항목 저장에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
