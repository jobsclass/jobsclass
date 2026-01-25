import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: '사용자 이름을 입력해주세요' },
        { status: 400 }
      )
    }

    // username 유효성 검사
    const usernameRegex = /^[a-z0-9-_]+$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { 
          available: false, 
          error: '사용자 이름은 영문 소문자, 숫자, 하이픈, 언더스코어만 사용 가능합니다' 
        },
        { status: 200 }
      )
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { 
          available: false, 
          error: '사용자 이름은 3자 이상 30자 이하여야 합니다' 
        },
        { status: 200 }
      )
    }

    const supabase = await createClient()

    // user_profiles 테이블에서 username 중복 확인
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = 결과 없음 (정상)
      console.error('Username check error:', error)
      return NextResponse.json(
        { error: '사용자 이름 확인 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    // 중복 여부 반환
    const available = !data
    
    return NextResponse.json({
      available,
      message: available 
        ? '사용 가능한 사용자 이름입니다' 
        : '이미 사용 중인 사용자 이름입니다'
    })

  } catch (error: any) {
    console.error('Check username API error:', error)
    return NextResponse.json(
      { error: '사용자 이름 확인 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
