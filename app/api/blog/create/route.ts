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
    const { title, slug, excerpt, content, category, tags, featuredImage, seoTitle, seoDescription, isPublished = false } = body

    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 본문은 필수입니다' },
        { status: 400 }
      )
    }

    // slug 중복 확인
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: '이미 사용 중인 URL 슬러그입니다' },
        { status: 400 }
      )
    }

    // 태그를 배열로 변환 (쉼표로 구분)
    const tagsArray = tags ? tags.split(',').map((t: string) => t.trim()) : []

    // 블로그 글 저장
    const { data: post, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        user_id: user.id,
        title,
        slug,
        excerpt,
        content,
        category,
        tags: tagsArray,
        featured_image_url: featuredImage || null,
        seo_title: seoTitle || title,
        seo_description: seoDescription || excerpt,
        is_published: isPublished,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: '블로그 글 저장에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
