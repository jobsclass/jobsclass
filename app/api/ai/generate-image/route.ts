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

    const { prompt, type = 'service' } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: '프롬프트가 필요합니다' }, { status: 400 })
    }

    // AI 이미지 생성 프롬프트 최적화
    const optimizedPrompt = type === 'logo' 
      ? `Professional minimalist logo design: ${prompt}. Clean, modern, simple shapes, flat design, white background, vector style, no text`
      : `Professional service thumbnail image: ${prompt}. Modern, clean, business-focused, high quality, vibrant colors, professional photography style`

    // OpenAI DALL-E 3로 이미지 생성
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: optimizedPrompt,
      n: 1,
      size: type === 'logo' ? '1024x1024' : '1792x1024', // 로고: 정사각형, 썸네일: 와이드
      quality: 'standard'
    })

    const imageUrl = response.data?.[0]?.url

    if (!imageUrl) {
      throw new Error('이미지 생성 실패')
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      prompt: optimizedPrompt
    })

  } catch (error: any) {
    console.error('AI 이미지 생성 오류:', error)
    return NextResponse.json(
      { error: 'AI 이미지 생성 중 오류가 발생했습니다', details: error.message },
      { status: 500 }
    )
  }
}
