import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401 })
    }

    const { serviceTitle, category, description } = await request.json()

    if (!serviceTitle || !category) {
      return NextResponse.json({ error: '서비스명과 카테고리가 필요합니다' }, { status: 400 })
    }

    // AI 가격 책정 프롬프트
    const prompt = `당신은 전문 가격 책정 컨설턴트입니다. 다음 서비스에 대한 적정 가격을 추천해주세요:

서비스명: ${serviceTitle}
카테고리: ${category}
${description ? `설명: ${description}` : ''}

한국 시장을 기준으로 다음 형식의 JSON으로 응답해주세요:
{
  "recommendedPrice": 가격(숫자),
  "priceRange": {
    "min": 최소가격,
    "max": 최대가격
  },
  "reasoning": "가격 책정 근거 (100자 이내)",
  "marketInsights": "시장 분석 (100자 이내)",
  "tips": ["가격 설정 팁1", "가격 설정 팁2"]
}

참고:
- 온라인 강의: 10만원~50만원
- 컨설팅: 50만원~500만원
- 개발/디자인 대행: 100만원~1000만원
- 전자책: 1만원~5만원
- 1:1 코칭: 10만원~100만원`

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 전문 가격 책정 컨설턴트입니다. 시장 데이터를 기반으로 적정 가격을 추천합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    })

    const pricingData = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json({
      success: true,
      pricing: pricingData
    })

  } catch (error: any) {
    console.error('AI 가격 책정 오류:', error)
    return NextResponse.json(
      { error: 'AI 가격 책정 중 오류가 발생했습니다', details: error.message },
      { status: 500 }
    )
  }
}
