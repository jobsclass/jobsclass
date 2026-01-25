import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, type } = body // type: 'service', 'blog', 'profile'

    // OpenAI API 호출 (환경변수에서 키 가져오기)
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(type),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      return NextResponse.json(
        { error: 'AI 생성에 실패했습니다' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const generatedText = data.choices[0]?.message?.content || ''

    return NextResponse.json({ text: generatedText })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

function getSystemPrompt(type: string): string {
  switch (type) {
    case 'service':
      return `당신은 전문적인 지식 서비스 마케팅 카피라이터입니다. 
사용자가 제공한 서비스 정보를 바탕으로 매력적이고 전문적인 서비스 설명을 작성해주세요.
- 고객의 문제를 명확히 파악
- 해결 방법을 구체적으로 제시
- 기대 효과를 명확히 제시
- 전문적이면서도 친근한 톤
- 2-3문단으로 구성
한국어로 작성하세요.`

    case 'blog':
      return `당신은 전문적인 블로그 콘텐츠 작성자입니다.
사용자가 제공한 주제로 유익하고 읽기 쉬운 블로그 글을 작성해주세요.
- 명확한 구조 (도입-본론-결론)
- 실용적인 정보 제공
- 읽기 쉬운 문장
- SEO 친화적인 내용
한국어로 작성하세요.`

    case 'profile':
      return `당신은 전문적인 프로필 작성 전문가입니다.
사용자가 제공한 정보를 바탕으로 전문적이고 신뢰감 있는 자기소개를 작성해주세요.
- 전문성 강조
- 경력 및 강점 부각
- 신뢰감 있는 톤
- 3-4문장으로 간결하게
한국어로 작성하세요.`

    default:
      return '전문적인 콘텐츠를 작성해주세요.'
  }
}
