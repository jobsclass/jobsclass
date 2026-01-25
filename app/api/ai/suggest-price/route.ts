import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * 🎯 특허 핵심 기술 #3: 컨텍스트 기반 가격 추천
 * 카테고리별 시장 분석 데이터를 활용한 AI 가격 자동 산출
 */

// 카테고리별 시장 데이터 (실제 시장 조사 기반)
const MARKET_DATA = {
  'online_course': {
    avgPrice: 150000,
    priceRange: { min: 50000, max: 500000 },
    marketSize: '대',
    competition: '높음',
    trend: '상승',
    insights: '온라인 강의 시장은 지속 성장 중이며, 전문성과 실용성이 중요합니다.'
  },
  'offline_course': {
    avgPrice: 200000,
    priceRange: { min: 100000, max: 1000000 },
    marketSize: '중',
    competition: '중간',
    trend: '안정',
    insights: '오프라인 강의는 대면 가치와 네트워킹 기회를 강조해야 합니다.'
  },
  'coaching': {
    avgPrice: 300000,
    priceRange: { min: 100000, max: 1000000 },
    marketSize: '중',
    competition: '중간',
    trend: '상승',
    insights: '1:1 코칭은 개인화된 솔루션과 전문성이 가격 책정의 핵심입니다.'
  },
  'bootcamp': {
    avgPrice: 500000,
    priceRange: { min: 300000, max: 2000000 },
    marketSize: '중',
    competition: '중간',
    trend: '상승',
    insights: '부트캠프는 집중 트레이닝과 실무 중심 커리큘럼이 중요합니다.'
  },
  'consulting': {
    avgPrice: 1000000,
    priceRange: { min: 500000, max: 10000000 },
    marketSize: '대',
    competition: '높음',
    trend: '안정',
    insights: '컨설팅은 경력과 성과 사례가 가격에 큰 영향을 미칩니다.'
  },
  'development': {
    avgPrice: 2000000,
    priceRange: { min: 500000, max: 20000000 },
    marketSize: '대',
    competition: '높음',
    trend: '상승',
    insights: '개발 대행은 기술 스택과 프로젝트 규모에 따라 가격 편차가 큽니다.'
  },
  'marketing': {
    avgPrice: 1500000,
    priceRange: { min: 500000, max: 10000000 },
    marketSize: '대',
    competition: '높음',
    trend: '상승',
    insights: '마케팅 대행은 채널, 규모, 성과 보장 여부가 가격에 영향을 미칩니다.'
  },
  'design': {
    avgPrice: 1000000,
    priceRange: { min: 300000, max: 5000000 },
    marketSize: '대',
    competition: '높음',
    trend: '안정',
    insights: '디자인 대행은 포트폴리오 품질과 브랜드 경험이 중요합니다.'
  },
  'content': {
    avgPrice: 500000,
    priceRange: { min: 200000, max: 3000000 },
    marketSize: '중',
    competition: '높음',
    trend: '상승',
    insights: '콘텐츠 제작은 품질, 수량, 플랫폼에 따라 가격이 결정됩니다.'
  },
  'ebook': {
    avgPrice: 30000,
    priceRange: { min: 10000, max: 100000 },
    marketSize: '중',
    competition: '높음',
    trend: '안정',
    insights: '전자책은 전문성과 실용성, 볼륨이 가격 책정의 핵심입니다.'
  },
  'digital_product': {
    avgPrice: 50000,
    priceRange: { min: 10000, max: 500000 },
    marketSize: '중',
    competition: '중간',
    trend: '상승',
    insights: '디지털 상품은 활용도와 독창성이 가격에 큰 영향을 미칩니다.'
  },
  'other': {
    avgPrice: 100000,
    priceRange: { min: 50000, max: 1000000 },
    marketSize: '중',
    competition: '중간',
    trend: '안정',
    insights: '기타 서비스는 시장 포지셔닝과 타겟 고객 명확화가 중요합니다.'
  }
}

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

    console.log('💰 컨텍스트 기반 가격 추천 시작:', { serviceTitle, category })

    // Step 1: 카테고리별 시장 데이터 가져오기
    const marketData = MARKET_DATA[category as keyof typeof MARKET_DATA] || MARKET_DATA['other']
    console.log('📊 시장 데이터:', marketData)

    // Step 2: AI 가격 책정 프롬프트 (시장 데이터 포함)
    const prompt = `당신은 전문 가격 책정 컨설턴트입니다. 다음 서비스에 대한 적정 가격을 추천해주세요:

서비스명: ${serviceTitle}
카테고리: ${category}
${description ? `설명: ${description}` : ''}

📊 시장 데이터:
- 평균 가격: ${marketData.avgPrice.toLocaleString()}원
- 가격 범위: ${marketData.priceRange.min.toLocaleString()}원 ~ ${marketData.priceRange.max.toLocaleString()}원
- 시장 규모: ${marketData.marketSize}
- 경쟁 강도: ${marketData.competition}
- 시장 트렌드: ${marketData.trend}
- 인사이트: ${marketData.insights}

위 시장 데이터를 참고하여 다음 형식의 JSON으로 응답해주세요:
{
  "recommendedPrice": 추천가격(숫자),
  "priceRange": {
    "min": 최소가격,
    "max": 최대가격
  },
  "reasoning": "가격 책정 근거 (100자 이내)",
  "marketInsights": "시장 분석 및 포지셔닝 전략 (100자 이내)",
  "competitiveAdvantage": "경쟁 우위 포인트 (50자 이내)",
  "tips": ["가격 설정 팁1", "가격 설정 팁2", "가격 설정 팁3"]
}

시장 평균을 기준으로 서비스의 가치를 분석하여 적정 가격을 제시해주세요.`

    // Step 3: OpenAI API 호출
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
    console.log('✅ 가격 추천 완료:', pricingData.recommendedPrice)

    // Step 4: 시장 데이터와 함께 반환
    return NextResponse.json({
      success: true,
      pricing: {
        ...pricingData,
        marketData: {
          category: category,
          avgPrice: marketData.avgPrice,
          marketSize: marketData.marketSize,
          competition: marketData.competition,
          trend: marketData.trend,
          insights: marketData.insights
        }
      }
    })

  } catch (error: any) {
    console.error('AI 가격 책정 오류:', error)
    return NextResponse.json(
      { error: 'AI 가격 책정 중 오류가 발생했습니다', details: error.message },
      { status: 500 }
    )
  }
}
