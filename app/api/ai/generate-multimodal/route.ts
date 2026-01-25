import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

// OpenAI API 키 확인
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY 환경 변수가 설정되지 않았습니다!')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build'
})

/**
 * 🎯 특허 핵심 기술 #1: 멀티모달 AI 생성
 * 텍스트와 이미지를 동시에 생성하여 일관성 있는 서비스 콘텐츠 자동 구축
 */
export async function POST(request: NextRequest) {
  try {
    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build') {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다. Vercel 환경 변수에 OPENAI_API_KEY를 추가해주세요.' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401 })
    }

    const { serviceTitle, category, keywords = '' } = await request.json()

    if (!serviceTitle || !category) {
      return NextResponse.json({ error: '서비스명과 카테고리가 필요합니다' }, { status: 400 })
    }

    console.log('🎨 멀티모달 AI 생성 시작:', { serviceTitle, category, keywords })

    // Step 1: AI로 텍스트 생성 (GPT-4o-mini)
    const textPrompt = `당신은 전문 마케팅 카피라이터입니다. 다음 서비스에 대한 매력적인 콘텐츠를 생성해주세요:

서비스명: ${serviceTitle}
카테고리: ${category}
키워드: ${keywords || '전문, 고품질'}

다음 형식의 JSON으로 응답해주세요:
{
  "title": "서비스명 (입력값 그대로)",
  "description": "한 줄 요약 (20-30자)",
  "detailedDescription": "상세 설명 (100-150자)",
  "targetCustomer": "타겟 고객 (30-50자)",
  "problemDescription": "고객이 겪는 문제 (50-70자)",
  "solutionProcess": "해결 방법 (50-70자)",
  "expectedResults": "기대 효과 (50-70자)",
  "features": ["특징1", "특징2", "특징3"],
  "imagePrompt": "이 서비스를 시각적으로 표현하는 이미지 설명 (영문, 50단어 이내)"
}

마케팅에 효과적인 매력적인 문구로 작성해주세요.`

    const textCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 전문 마케팅 카피라이터입니다. 매력적이고 설득력 있는 콘텐츠를 작성합니다.'
        },
        {
          role: 'user',
          content: textPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8
    })

    const textContent = JSON.parse(textCompletion.choices[0].message.content || '{}')
    console.log('✅ 텍스트 생성 완료:', textContent.title)

    // Step 2: 생성된 텍스트 기반으로 이미지 생성 (DALL-E 3)
    // 텍스트에서 자동 생성된 imagePrompt 사용
    const optimizedImagePrompt = `Professional service thumbnail: ${textContent.imagePrompt}. Modern, clean, business-focused, high quality, vibrant colors, professional photography style, no text`

    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: optimizedImagePrompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard'
    })

    const imageUrl = imageResponse.data?.[0]?.url

    if (!imageUrl) {
      console.warn('⚠️ 이미지 생성 실패, 텍스트만 반환')
    } else {
      console.log('✅ 이미지 생성 완료:', imageUrl.substring(0, 50) + '...')
    }

    // Step 3: 멀티모달 일관성 검증 (간단한 키워드 매칭)
    const consistencyScore = validateConsistency(textContent, optimizedImagePrompt)
    console.log('🔍 일관성 점수:', consistencyScore)

    // Step 4: 통합 결과 반환
    return NextResponse.json({
      success: true,
      multimodal: {
        text: {
          title: textContent.title,
          description: textContent.description,
          detailedDescription: textContent.detailedDescription,
          targetCustomer: textContent.targetCustomer,
          problemDescription: textContent.problemDescription,
          solutionProcess: textContent.solutionProcess,
          expectedResults: textContent.expectedResults,
          features: textContent.features
        },
        image: {
          url: imageUrl,
          prompt: optimizedImagePrompt
        },
        metadata: {
          consistencyScore,
          generatedAt: new Date().toISOString(),
          model: {
            text: 'gpt-4o-mini',
            image: 'dall-e-3'
          }
        }
      }
    })

  } catch (error: any) {
    console.error('❌ 멀티모달 AI 생성 오류:', error)
    return NextResponse.json(
      { error: '멀티모달 AI 생성 중 오류가 발생했습니다', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * 텍스트와 이미지 프롬프트 간의 일관성 검증
 * @returns 0-100 점수 (높을수록 일관성 높음)
 */
function validateConsistency(textContent: any, imagePrompt: string): number {
  // 간단한 키워드 매칭 기반 일관성 점수
  const textKeywords = [
    textContent.title?.toLowerCase(),
    textContent.description?.toLowerCase(),
    textContent.targetCustomer?.toLowerCase()
  ].filter(Boolean).join(' ')

  const imageKeywords = imagePrompt.toLowerCase()

  // 공통 단어 개수 계산
  const textWords = new Set(textKeywords.split(/\s+/))
  const imageWords = imagePrompt.toLowerCase().split(/\s+/)
  
  let matchCount = 0
  imageWords.forEach(word => {
    if (textWords.has(word) && word.length > 3) {
      matchCount++
    }
  })

  // 점수 계산 (0-100)
  const score = Math.min(100, (matchCount / Math.max(imageWords.length, 1)) * 200)
  return Math.round(score)
}
