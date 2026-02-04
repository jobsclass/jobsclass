import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

    // URL 파라미터 가져오기
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const serviceType = searchParams.get('service_type') || ''
    const isPublished = searchParams.get('is_published')

    // 쿼리 빌더
    let query = supabase
      .from('services')
      .select('*')
      .eq('partner_id', user.id)
      .order('created_at', { ascending: false })

    // 필터 적용
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (serviceType) {
      query = query.eq('service_type', serviceType)
    }
    if (isPublished !== null && isPublished !== '') {
      query = query.eq('is_published', isPublished === 'true')
    }

    const { data: services, error: fetchError } = await query

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        { error: '서비스 목록을 불러오는데 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      services: services || [],
    })

  } catch (error: any) {
    console.error('서비스 목록 조회 에러:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
