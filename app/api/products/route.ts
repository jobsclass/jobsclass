import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

// Verify authentication and get user from JWT
async function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

// GET /api/products - 상품 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get('partnerId')
    const category = searchParams.get('category')
    const published = searchParams.get('published')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const supabase = await createServerClient()
    let query = supabase
      .from('services')
      .select('*, user_profiles!inner(display_name, username)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by partner
    if (partnerId) {
      query = query.eq('user_id', partnerId)
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category)
    }

    // Filter by published status
    if (published === 'true') {
      query = query.eq('status', 'active')
    } else if (published === 'false') {
      query = query.neq('status', 'active')
    }

    const { data: products, error, count } = await query

    if (error) {
      console.error('Products fetch error:', error)
      return NextResponse.json(
        { error: '상품 목록을 불러오는 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/products - 상품 등록
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user || user.role !== 'partner') {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      subcategory,
      price,
      discount_price,
      product_type,
      thumbnail_url,
      images,
      video_url,
      tags,
      difficulty_level,
      duration,
      includes,
      requirements,
      target_audience,
    } = body

    // Validation
    if (!title || !description || !category || !price || !product_type) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요' },
        { status: 400 }
      )
    }

    if (price < 0) {
      return NextResponse.json(
        { error: '가격은 0원 이상이어야 합니다' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100)

    const supabase = await createServerClient()

    // Create product
    const { data: product, error: productError } = await supabase
      .from('services')
      .insert({
        user_id: user.userId as string,
        title,
        slug,
        description,
        category,
        subcategory,
        price: parseFloat(price),
        discount_price: discount_price ? parseFloat(discount_price) : null,
        service_type: product_type || 'direct_sale',
        image_url: thumbnail_url,
        images: images || [],
        video_url,
        tags: tags || [],
        difficulty_level,
        duration,
        status: 'draft', // 기본적으로 draft
      })
      .select()
      .single()

    if (productError) {
      console.error('Product creation error:', productError)
      
      // Check for duplicate slug
      if (productError.code === '23505') {
        return NextResponse.json(
          { error: '이미 등록된 상품 제목입니다' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: '상품 등록 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Product POST error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
