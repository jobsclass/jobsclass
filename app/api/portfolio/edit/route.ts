import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: '포트폴리오 ID가 필요합니다' }, { status: 400 })
    }

    const { data: item, error: updateError } = await supabase
      .from('portfolios')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: '포트폴리오 수정에 실패했습니다' }, { status: 500 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json({ error: '포트폴리오 ID가 필요합니다' }, { status: 400 })
    }

    const { data: item, error: fetchError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json({ error: '포트폴리오를 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
