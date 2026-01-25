import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 사용자 인증 확인 (파트너)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401 })
    }

    const { name, email, phone, message, serviceId } = await request.json()

    // 필수값 검증
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: '이름, 이메일, 문의 내용은 필수입니다' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다' },
        { status: 400 }
      )
    }

    // 고객 정보 저장
    const { data: customer, error: insertError } = await supabase
      .from('customers')
      .insert({
        user_id: user.id,
        name,
        email,
        phone: phone || null,
        message,
        service_id: serviceId || null,
        status: 'new'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Customer insert error:', insertError)
      return NextResponse.json(
        { error: '문의 접수 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    // TODO: 이메일 알림 발송 (나중에 구현)
    
    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 접수되었습니다',
      customer
    })

  } catch (error: any) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// GET: 문의 목록 조회 (대시보드용)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 필터: new, contacted, completed, cancelled
    const serviceId = searchParams.get('serviceId') // 특정 서비스만

    let query = supabase
      .from('customers')
      .select('*, services(id, title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (serviceId) {
      query = query.eq('service_id', serviceId)
    }

    const { data: customers, error } = await query

    if (error) {
      console.error('Customers fetch error:', error)
      return NextResponse.json(
        { error: '문의 목록 조회 실패' },
        { status: 500 }
      )
    }

    return NextResponse.json({ customers })

  } catch (error: any) {
    console.error('Customers GET error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
