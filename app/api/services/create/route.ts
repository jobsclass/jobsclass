import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 요청 데이터 파싱
    const body = await request.json()
    
    const {
      category,
      title,
      slug,
      description,
      thumbnail,
      targetCustomer,
      problemDescription,
      solutionProcess,
      expectedResults,
      price,
      originalPrice,
      currency = 'KRW',
      features = [],
      serviceCategory,
      deliveryFormat = 'online',
      duration,
      includes = [],
      requirements,
      maxParticipants,
      isRecurring = false,
      recurringInterval,
      isPublished = false,
    } = body

    // 필수 필드 검증
    if (!title || !slug || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Slug 중복 확인
    const { data: existingService } = await supabase
      .from('services')
      .select('id')
      .eq('partner_id', user.id)
      .eq('slug', slug)
      .single()

    if (existingService) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // 서비스 생성
    const { data, error } = await supabase
      .from('services')
      .insert({
        partner_id: user.id,
        title,
        slug,
        description,
        thumbnail_url: thumbnail,
        category_1: category,
        service_category: serviceCategory,
        delivery_format: deliveryFormat,
        duration,
        includes,
        requirements,
        max_participants: maxParticipants,
        is_recurring: isRecurring,
        recurring_interval: recurringInterval,
        instructor_bio: targetCustomer,
        base_price: price ? parseFloat(price) : null,
        discount_price: originalPrice ? parseFloat(originalPrice) : null,
        is_published: isPublished,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        data,
        message: 'Service created successfully' 
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
