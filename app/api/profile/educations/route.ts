import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { data, error } = await supabase
      .from('user_educations')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })

    if (error) return NextResponse.json({ error: '학력 목록을 불러오는데 실패했습니다' }, { status: 500 })
    return NextResponse.json({ educations: data || [] })
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { school, degree, major, startDate, endDate, isCurrent } = await request.json()

    const { data, error } = await supabase
      .from('user_educations')
      .insert({ user_id: user.id, school, degree, major, start_date: startDate, end_date: isCurrent ? null : endDate, is_current: isCurrent || false })
      .select()
      .single()

    if (error) return NextResponse.json({ error: '학력 추가에 실패했습니다' }, { status: 500 })
    return NextResponse.json({ education: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { id, school, degree, major, startDate, endDate, isCurrent } = await request.json()
    if (!id) return NextResponse.json({ error: '학력 ID가 필요합니다' }, { status: 400 })

    const { data, error } = await supabase
      .from('user_educations')
      .update({ school, degree, major, start_date: startDate, end_date: isCurrent ? null : endDate, is_current: isCurrent })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: '학력 수정에 실패했습니다' }, { status: 500 })
    return NextResponse.json({ education: data })
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: '학력 ID가 필요합니다' }, { status: 400 })

    const { error } = await supabase.from('user_educations').delete().eq('id', id).eq('user_id', user.id)
    if (error) return NextResponse.json({ error: '학력 삭제에 실패했습니다' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
