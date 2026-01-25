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

    const answers = await request.json()
    const { occupation, targetAudience, services, experience, achievements } = answers

    // AI 프롬프트 생성
    const prompt = `당신은 전문 웹사이트 빌더입니다. 다음 정보를 바탕으로 전문적인 웹사이트 콘텐츠를 생성해주세요:

직업: ${occupation}
타겟 고객: ${targetAudience}
제공 서비스: ${services}
경력: ${experience}
주요 성과: ${achievements || '없음'}

다음 형식의 JSON으로 응답해주세요:
{
  "profile": {
    "displayName": "이름",
    "jobTitle": "직함",
    "tagline": "한 줄 소개 (20자 이내)",
    "bio": "자기소개 (200-300자)",
    "expertise": ["전문분야1", "전문분야2", "전문분야3"]
  },
  "services": [
    {
      "title": "서비스명",
      "description": "서비스 설명 (100-150자)",
      "category": "온라인 강의|컨설팅|개발 대행|마케팅 대행|디자인 대행|콘텐츠 제작|전자책/가이드 중 하나",
      "price": 가격(숫자),
      "features": ["특징1", "특징2", "특징3"]
    }
  ] (3개),
  "blogs": [
    {
      "title": "블로그 제목",
      "content": "블로그 본문 (300-500자)",
      "excerpt": "요약 (50-100자)"
    }
  ] (5개),
  "portfolio": [
    {
      "title": "프로젝트명",
      "description": "프로젝트 설명 (100-150자)",
      "client": "클라이언트명",
      "technologies": ["기술1", "기술2"]
    }
  ] (3개),
  "career": [
    {
      "company": "회사명",
      "position": "직책",
      "description": "업무 설명 (100자 이내)"
    }
  ] (1-2개)
}

마케팅에 효과적인 매력적인 문구로 작성해주세요.`

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 전문 마케팅 카피라이터이자 웹사이트 빌더입니다. 한국어로 자연스럽고 매력적인 콘텐츠를 작성합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8
    })

    const generatedContent = JSON.parse(completion.choices[0].message.content || '{}')

    // 사용자 프로필 가져오기
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: '프로필을 찾을 수 없습니다' }, { status: 404 })
    }

    // 1. 프로필 업데이트
    await supabase
      .from('user_profiles')
      .update({
        display_name: generatedContent.profile.displayName,
        job_title: generatedContent.profile.jobTitle,
        tagline: generatedContent.profile.tagline,
        bio: generatedContent.profile.bio,
        expertise: generatedContent.profile.expertise
      })
      .eq('user_id', user.id)

    // 2. 서비스 생성
    for (const service of generatedContent.services) {
      const slug = service.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-가-힣]/g, '')

      await supabase.from('services').insert({
        user_id: user.id,
        title: service.title,
        slug: slug,
        description: service.description,
        service_category: service.category,
        price: service.price,
        currency: 'KRW',
        features: service.features,
        is_published: true
      })
    }

    // 3. 블로그 글 생성
    for (const blog of generatedContent.blogs) {
      const slug = blog.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-가-힣]/g, '')

      await supabase.from('blog_posts').insert({
        user_id: user.id,
        title: blog.title,
        slug: slug,
        content: blog.content,
        excerpt: blog.excerpt,
        is_published: true
      })
    }

    // 4. 포트폴리오 생성
    for (const item of generatedContent.portfolio) {
      const slug = item.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-가-힣]/g, '')

      await supabase.from('portfolios').insert({
        user_id: user.id,
        title: item.title,
        slug: slug,
        description: item.description,
        client: item.client,
        technologies: item.technologies,
        is_published: true
      })
    }

    // 5. 커리어 생성
    for (const career of generatedContent.career) {
      await supabase.from('experiences').insert({
        user_id: user.id,
        company: career.company,
        position: career.position,
        description: career.description,
        is_current: false
      })
    }

    return NextResponse.json({
      success: true,
      message: '웹사이트가 성공적으로 생성되었습니다!',
      data: generatedContent
    })

  } catch (error: any) {
    console.error('AI 웹사이트 생성 오류:', error)
    return NextResponse.json(
      { error: 'AI 생성 중 오류가 발생했습니다', details: error.message },
      { status: 500 }
    )
  }
}
