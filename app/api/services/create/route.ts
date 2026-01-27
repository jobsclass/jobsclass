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
      // 서비스 타입
      serviceType = 'direct_sale',
      
      // 기본 정보
      category,
      title,
      slug,
      description,
      thumbnail,
      
      // 상세 정보
      targetCustomer,
      problemDescription,
      solutionProcess,
      expectedResults,
      
      // 가격 (direct_sale만)
      price,
      originalPrice,
      currency = 'KRW',
      
      // 외부 링크 (external_link만)
      externalUrl,
      externalButtonText = '서비스 바로가기',
      
      // 문의 설정 (inquiry만)
      inquiryEnabled = false,
      inquiryDescription,
      
      // 특징
      features = [],
      
      // 추가 필드 (레거시)
      serviceCategory,
      deliveryFormat = 'online',
      duration,
      includes = [],
      requirements,
      maxParticipants,
      isRecurring = false,
      recurringInterval,
      
      // 공개 설정
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
      .from('products')
      .select('id')
      .eq('user_id', user.id)
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
      .from('products')
      .insert({
        user_id: user.id,
        
        // 서비스 타입
        service_type: serviceType,
        
        // 기본 정보
        title,
        slug,
        description,
        thumbnail_url: thumbnail,
        category_1: category,
        service_category: serviceCategory,
        
        // 상세 정보
        instructor_bio: targetCustomer,
        
        // 가격 (direct_sale만)
        base_price: serviceType === 'direct_sale' && price ? parseFloat(price) : null,
        discount_price: serviceType === 'direct_sale' && originalPrice ? parseFloat(originalPrice) : null,
        currency,
        
        // 외부 링크 (external_link만)
        external_url: serviceType === 'external_link' ? externalUrl : null,
        external_button_text: serviceType === 'external_link' ? externalButtonText : null,
        
        // 문의 설정 (inquiry만)
        inquiry_enabled: serviceType === 'inquiry',
        inquiry_description: serviceType === 'inquiry' ? inquiryDescription : null,
        
        // 추가 필드
        delivery_format: deliveryFormat,
        duration,
        includes,
        requirements,
        max_participants: maxParticipants,
        is_recurring: isRecurring,
        recurring_interval: recurringInterval,
        
        // 공개 설정
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
