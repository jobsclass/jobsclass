import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/payments/confirm
 * Toss Payments 결제 승인
 * 
 * Toss Payments에서 리다이렉트된 후 호출됨
 * Query params: paymentKey, orderId, amount
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const body = await request.json()
    const { paymentKey, orderId, amount } = body

    // 필수 필드 검증
    if (!paymentKey || !orderId || !amount) {
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
        { error: 'Payment system is not configured. Please add TOSS_SECRET_KEY to environment variables.' },
        { status: 500 }
      )
    }

    // 주문 조회 (order_number 기준)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // 금액 검증
    if (parseFloat(amount) !== order.total_amount) {
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      )
    }

    // 이미 결제 완료된 주문인지 확인
    if (order.status === 'paid') {
      return NextResponse.json(
        { error: 'Order is already paid' },
        { status: 400 }
      )
    }

    // Toss Payments API 호출 - 결제 승인
    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    })

    const tossData = await tossResponse.json()

    if (!tossResponse.ok) {
      console.error('Toss Payments error:', tossData)
      return NextResponse.json(
        { 
          error: tossData.message || 'Payment confirmation failed',
          code: tossData.code,
        },
        { status: tossResponse.status }
      )
    }

    // 결제 정보 저장
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        payment_key: paymentKey,
        method: tossData.method || '카드',
        amount: parseFloat(amount),
        status: 'done',
        approved_at: new Date().toISOString(),
        toss_response: tossData, // 전체 응답 저장
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment record error:', paymentError)
      // 결제는 성공했지만 DB 저장 실패 - 수동 처리 필요
      return NextResponse.json(
        { 
          error: 'Payment succeeded but failed to save record',
          paymentKey,
          orderId,
        },
        { status: 500 }
      )
    }

    // 주문 상태 업데이트
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('Order update error:', updateError)
    }

    // TODO: 이메일 알림 발송
    // TODO: AI 사용량 로그 기록 (FREE 플랜 → STARTER 전환 시)

    return NextResponse.json({
      success: true,
      payment,
      order: {
        ...order,
        status: 'paid',
      },
      message: 'Payment confirmed successfully',
    })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
