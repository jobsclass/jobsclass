import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/payments/cancel
 * 결제 취소 (환불)
 */
export async function POST(request: Request) {
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

    const body = await request.json()
    const { paymentKey, cancelReason } = body

    // 필수 필드 검증
    if (!paymentKey || !cancelReason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Toss Payments Secret Key
    const secretKey = process.env.TOSS_SECRET_KEY
    if (!secretKey) {
      console.error('TOSS_SECRET_KEY is not configured')
      return NextResponse.json(
        { error: 'Payment system is not configured' },
        { status: 500 }
      )
    }

    // 결제 정보 조회
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        order:orders(
          *,
          customer:customers(user_id),
          service:products(user_id)
        )
      `)
      .eq('payment_key', paymentKey)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // 권한 확인: 구매자 본인만 취소 가능
    if (payment.order?.customer?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 이미 취소된 결제인지 확인
    if (payment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Payment is already cancelled' },
        { status: 400 }
      )
    }

    // Toss Payments API 호출 - 결제 취소
    const tossResponse = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancelReason,
      }),
    })

    const tossData = await tossResponse.json()

    if (!tossResponse.ok) {
      console.error('Toss Payments cancel error:', tossData)
      return NextResponse.json(
        { 
          error: tossData.message || 'Payment cancellation failed',
          code: tossData.code,
        },
        { status: tossResponse.status }
      )
    }

    // 결제 상태 업데이트
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: cancelReason,
        toss_cancel_response: tossData,
      })
      .eq('payment_key', paymentKey)

    if (updatePaymentError) {
      console.error('Payment update error:', updatePaymentError)
    }

    // 주문 상태 업데이트
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ 
        status: 'refunded',
        refunded_at: new Date().toISOString(),
      })
      .eq('id', payment.order_id)

    if (updateOrderError) {
      console.error('Order update error:', updateOrderError)
    }

    // TODO: 환불 완료 이메일 발송

    return NextResponse.json({
      success: true,
      message: 'Payment cancelled successfully',
      cancelledAt: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
