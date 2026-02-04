import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculatePlatformFee } from '@/lib/constants/jobsclass'

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
    const {
      service_type,
      category,
      subcategory,
      title,
      slug,
      description,
      thumbnail_url,
      price,
      original_price,
      features,
      requirements,
      deliverables,
      duration_hours,
      duration_days,
      curriculum,
      is_active,
      is_published,
    } = body

    // 필수 필드 검증
    if (!title || !service_type || !category || !price) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요' },
        { status: 400 }
      )
    }

    // 서비스 생성
    const { data: service, error: insertError } = await supabase
      .from('services')
      .insert({
        partner_id: user.id,
        service_type,
        category,
        subcategory: subcategory || null,
        title,
        slug,
        description,
        thumbnail_url: thumbnail_url || null,
        price: parseFloat(price),
        original_price: original_price ? parseFloat(original_price) : null,
        features: features?.filter((f: string) => f.trim()) || [],
        requirements: requirements?.filter((r: string) => r.trim()) || [],
        deliverables: deliverables?.filter((d: string) => d.trim()) || [],
        duration_hours: duration_hours ? parseInt(duration_hours) : null,
        duration_days: duration_days ? parseInt(duration_days) : null,
        curriculum: curriculum ? JSON.parse(curriculum) : null,
        is_active: is_active ?? true,
        is_published: is_published ?? false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: '서비스 등록에 실패했습니다', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      service,
    })

  } catch (error: any) {
    console.error('서비스 등록 에러:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다', details: error.message },
      { status: 500 }
    )
  }
}
