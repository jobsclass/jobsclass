import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    // 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = No rows found
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: '프로필을 불러오는데 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile: profile || null })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

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
    const { displayName, jobTitle, tagline, bio, expertise, email, phone, location, profileImage } = body

    // 프로필이 존재하는지 확인
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingProfile) {
      // 업데이트
      const { data: profile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          display_name: displayName,
          job_title: jobTitle,
          tagline,
          bio,
          expertise: expertise || [],
          email,
          phone,
          location,
          avatar_url: profileImage || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json(
          { error: '프로필 업데이트에 실패했습니다' },
          { status: 500 }
        )
      }

      return NextResponse.json({ profile })
    } else {
      // 생성 (username은 필수이므로 이메일 앞부분 사용)
      const username = user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`
      
      const { data: profile, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          display_name: displayName || 'Unknown',
          email: email || user.email || '',
          username,
          job_title: jobTitle,
          tagline,
          bio,
          expertise: expertise || [],
          phone,
          location,
          avatar_url: profileImage || null,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json(
          { error: '프로필 생성에 실패했습니다' },
          { status: 500 }
        )
      }

      return NextResponse.json({ profile }, { status: 201 })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
