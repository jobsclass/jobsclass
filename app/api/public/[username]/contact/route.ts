import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 공개 문의 폼 (비로그인 가능)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const supabase = await createClient()
    const { username } = await params
    
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

    // username으로 파트너 찾기
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('username', username)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: '파트너를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 고객 정보 저장
    const { data: customer, error: insertError } = await supabase
      .from('customers')
      .insert({
        user_id: profile.user_id,
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

    // TODO: 파트너에게 이메일 알림 발송
    
    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
      customer
    })

  } catch (error: any) {
    console.error('Public contact API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
