import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/orders - 주문 생성
 * 서비스 구매를 위한 주문 생성
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // 사용자 인증 (선택적 - 비회원 구매 가능)
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await request.json()
    const {
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      amount,
    } = body

    // 필수 필드 검증
    if (!serviceId || !customerName || !customerEmail || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 서비스 정보 조회
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // 가격 검증 (서비스 타입이 direct_sale인지 확인)
    if (service.service_type !== 'direct_sale') {
      return NextResponse.json(
        { error: 'This service is not available for direct purchase' },
        { status: 400 }
      )
    }

    // 금액 검증
    const expectedAmount = service.base_price || 0
    if (parseFloat(amount) !== expectedAmount) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // 고객 정보 생성 또는 조회
    let customerId = null
    
    // 기존 고객 조회 (이메일 기준)
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customerEmail)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      // 신규 고객 생성
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          user_id: user?.id || null,
        })
        .select()
        .single()

      if (customerError) {
        console.error('Customer creation error:', customerError)
        return NextResponse.json(
          { error: 'Failed to create customer' },
          { status: 500 }
        )
      }

      customerId = newCustomer.id
    }

    // 주문 번호 생성 (ORD-YYYYMMDD-랜덤6자리)
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const randomSuffix = Math.floor(100000 + Math.random() * 900000)
    const orderNumber = `ORD-${today}-${randomSuffix}`

    // 주문 생성
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        service_id: serviceId,
        order_number: orderNumber,
        status: 'pending',
        total_amount: amount,
      })
      .select(`
        *,
        service:services(id, title, thumbnail_url, partner_id),
        customer:customers(id, name, email)
      `)
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        order,
        message: 'Order created successfully',
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/orders - 주문 목록 조회
 * 로그인한 사용자의 주문 목록 또는 파트너의 판매 내역
 */
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'customer' // 'customer' or 'partner'
    const status = searchParams.get('status') // 'pending', 'paid', 'cancelled', 'refunded'

    let query = supabase
      .from('orders')
      .select(`
        *,
        service:services(id, title, thumbnail_url, base_price),
        customer:customers(id, name, email, phone)
      `)
      .order('created_at', { ascending: false })

    if (role === 'customer') {
      // 고객: 자신의 주문 조회
      query = query.eq('customers.user_id', user.id)
    } else if (role === 'partner') {
      // 파트너: 자신의 서비스에 대한 주문 조회
      query = query.eq('services.partner_id', user.id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Query error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // 통계 계산
    const stats = {
      total: orders?.length || 0,
      pending: orders?.filter(o => o.status === 'pending').length || 0,
      paid: orders?.filter(o => o.status === 'paid').length || 0,
      cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
      refunded: orders?.filter(o => o.status === 'refunded').length || 0,
      totalRevenue: orders
        ?.filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
      stats,
    })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
