import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json()

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다' },
        { status: 400 }
      )
    }

    // Toss Payments 서버에 결제 승인 요청
    const tossResponse = await fetch(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            process.env.TOSS_SECRET_KEY + ':'
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount: parseInt(amount),
        }),
      }
    )

    const payment = await tossResponse.json()

    if (!tossResponse.ok) {
      console.error('Toss 결제 승인 실패:', payment)
      return NextResponse.json(
        { error: payment.message || '결제 승인에 실패했습니다' },
        { status: tossResponse.status }
      )
    }

    // Supabase에 주문 정보 저장
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // 주문 번호에서 product_id 추출 (URL 파라미터로 전달된 경우)
    const url = new URL(request.url)
    const productId = url.searchParams.get('productId')

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderId,
        buyer_id: payment.customerId || null,
        product_id: productId,
        amount: payment.totalAmount,
        payment_method: payment.method,
        payment_key: paymentKey,
        status: 'paid',
        paid_at: payment.approvedAt,
        toss_response: payment,
      })
      .select()
      .single()

    if (orderError) {
      console.error('주문 저장 오류:', orderError)
      return NextResponse.json(
        { error: '주문 정보 저장에 실패했습니다' },
        { status: 500 }
      )
    }

    // 크레딧 충전인 경우 (product_id가 없으면 크레딧 충전)
    if (!productId && payment.customerId) {
      const creditAmount = Math.floor(payment.totalAmount / 10)
      let bonus = 0

      // 보너스 계산
      if (payment.totalAmount >= 100000) {
        bonus = Math.floor(creditAmount * 0.2)
      } else if (payment.totalAmount >= 50000) {
        bonus = Math.floor(creditAmount * 0.1)
      }

      const totalCredits = creditAmount + bonus

      // charge_credits 함수 호출
      const { error: creditError } = await supabase.rpc('charge_credits', {
        p_user_id: payment.customerId,
        p_amount: totalCredits,
        p_order_id: order.id,
        p_description: `크레딧 충전 (₩${payment.totalAmount.toLocaleString()})`,
      })

      if (creditError) {
        console.error('크레딧 충전 오류:', creditError)
      }
    }

    return NextResponse.json({
      success: true,
      payment,
      order,
    })
  } catch (error: any) {
    console.error('결제 처리 오류:', error)
    return NextResponse.json(
      { error: error.message || '결제 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
