import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET: 사이트 설정 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase.from('site_settings').select('*')
    
    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, settings: data })
  } catch (error) {
    console.error('사이트 설정 조회 오류:', error)
    return NextResponse.json(
      { error: '사이트 설정을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 사이트 설정 업데이트
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // 관리자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자만 접근할 수 있습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { key, value, category, description } = body

    if (!key || !value) {
      return NextResponse.json(
        { error: 'key와 value는 필수입니다.' },
        { status: 400 }
      )
    }

    // Upsert: 있으면 업데이트, 없으면 생성
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value,
        category: category || 'general',
        description,
        updated_by: user.id
      }, {
        onConflict: 'key'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: '설정이 저장되었습니다.',
      setting: data 
    })
  } catch (error) {
    console.error('사이트 설정 저장 오류:', error)
    return NextResponse.json(
      { error: '설정 저장에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 사이트 설정 삭제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // 관리자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자만 접근할 수 있습니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'key는 필수입니다.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('site_settings')
      .delete()
      .eq('key', key)

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: '설정이 삭제되었습니다.' 
    })
  } catch (error) {
    console.error('사이트 설정 삭제 오류:', error)
    return NextResponse.json(
      { error: '설정 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
