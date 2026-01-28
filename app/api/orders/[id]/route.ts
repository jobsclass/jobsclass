import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/orders/[id] - 주문 상세 조회
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        service:products(
          id,
          title,
          slug,
          description,
          image_url,
          price,
          discount_price,
          user_id
        ),
        customer:customers(id, name, email, phone, user_id),
        payments(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Query error:', error)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // 권한 확인: 본인의 주문이거나 서비스 제공자인 경우만
    const isCustomer = order.customer?.user_id === user.id
    const isPartner = order.service?.user_id === user.id

    if (!isCustomer && !isPartner) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      order,
    })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/orders/[id] - 주문 상태 변경
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    // 상태 유효성 검증
    const validStatuses = ['pending', 'paid', 'cancelled', 'refunded']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // 기존 주문 조회
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*, service:products(user_id)')
      .eq('id', id)
      .single()

    if (fetchError || !existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // 권한 확인: 서비스 제공자만 상태 변경 가능
    if (existingOrder.service?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 주문 상태 업데이트
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order,
      message: `Order status updated to ${status}`,
    })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/orders/[id] - 주문 삭제 (취소)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // 기존 주문 조회
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*, service:products(user_id), customer:customers(user_id)')
      .eq('id', id)
      .single()

    if (fetchError || !existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // 권한 확인
    const isCustomer = existingOrder.customer?.user_id === user.id
    const isPartner = existingOrder.service?.user_id === user.id

    if (!isCustomer && !isPartner) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 결제 완료된 주문은 삭제 불가 (취소로 변경)
    if (existingOrder.status === 'paid') {
      return NextResponse.json(
        { error: 'Paid orders cannot be deleted. Please request a refund instead.' },
        { status: 400 }
      )
    }

    // 주문 삭제
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
