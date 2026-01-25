import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - List experiences
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('user_experiences')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Fetch error:', error)
      return NextResponse.json({ error: '경력 목록을 불러오는데 실패했습니다' }, { status: 500 })
    }

    return NextResponse.json({ experiences: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// POST - Create experience
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { company, position, startDate, endDate, isCurrent, description } = body

    if (!company || !position || !startDate) {
      return NextResponse.json({ error: '필수 필드를 입력해주세요' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('user_experiences')
      .insert({
        user_id: user.id,
        company,
        position,
        start_date: startDate,
        end_date: isCurrent ? null : endDate,
        is_current: isCurrent || false,
        description,
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: '경력 추가에 실패했습니다' }, { status: 500 })
    }

    return NextResponse.json({ experience: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// PUT - Update experience
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { id, company, position, startDate, endDate, isCurrent, description } = body

    if (!id) {
      return NextResponse.json({ error: '경력 ID가 필요합니다' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('user_experiences')
      .update({
        company,
        position,
        start_date: startDate,
        end_date: isCurrent ? null : endDate,
        is_current: isCurrent,
        description,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: '경력 수정에 실패했습니다' }, { status: 500 })
    }

    return NextResponse.json({ experience: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// DELETE - Delete experience
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '경력 ID가 필요합니다' }, { status: 400 })
    }

    const { error } = await supabase
      .from('user_experiences')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: '경력 삭제에 실패했습니다' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
