import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH: 고객 상태 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()

    // 상태값 검증
    const validStatuses = ['new', 'contacted', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태값입니다' },
        { status: 400 }
      )
    }

    // 본인 고객인지 확인 후 업데이트
    const { data: customer, error: updateError } = await supabase
      .from('customers')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Customer update error:', updateError)
      return NextResponse.json(
        { error: '상태 업데이트 실패' },
        { status: 500 }
      )
    }

    if (!customer) {
      return NextResponse.json(
        { error: '고객 정보를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '상태가 업데이트되었습니다',
      customer
    })

  } catch (error: any) {
    console.error('Customer PATCH error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE: 고객 정보 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401 })
    }

    const { id } = await params

    // 본인 고객인지 확인 후 삭제
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Customer delete error:', deleteError)
      return NextResponse.json(
        { error: '삭제 실패' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '고객 정보가 삭제되었습니다'
    })

  } catch (error: any) {
    console.error('Customer DELETE error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
