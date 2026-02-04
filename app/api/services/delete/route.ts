import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
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

    // URL 파라미터에서 ID 가져오기
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '서비스 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // 서비스 소유권 확인 및 삭제
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
      .eq('partner_id', user.id) // 본인 서비스만 삭제 가능

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: '서비스 삭제에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '서비스가 삭제되었습니다',
    })

  } catch (error: any) {
    console.error('서비스 삭제 에러:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
