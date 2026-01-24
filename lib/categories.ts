// Corefy 카테고리 시스템
// 8개 대분류 (Depth 1) + 세부 분류 (Depth 2)

export interface Category {
  id: string
  name: string
  description: string
  subcategories: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
  tags: string[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'it-dev',
    name: 'IT·개발',
    description: '웹, 앱, 데이터, AI, 게임 개발 등',
    subcategories: [
      {
        id: 'web-dev',
        name: '웹 개발',
        tags: ['프론트엔드', '백엔드', '풀스택', 'React', 'Node.js', 'Next.js'],
      },
      {
        id: 'app-dev',
        name: '앱 개발',
        tags: ['iOS', 'Android', 'Flutter', 'React Native', '크로스플랫폼'],
      },
      {
        id: 'data-ai',
        name: '데이터·AI',
        tags: ['Python', '머신러닝', 'ChatGPT', '데이터 분석', '딥러닝'],
      },
      {
        id: 'game-dev',
        name: '게임 개발',
        tags: ['Unity', 'Unreal', 'C#', 'C++', '게임 디자인'],
      },
      {
        id: 'programming-basics',
        name: '프로그래밍 기초',
        tags: ['코딩 입문', '알고리즘', '자료구조', 'CS 기초'],
      },
    ],
  },
  {
    id: 'design-creative',
    name: '디자인·크리에이티브',
    description: 'UI/UX, 그래픽, 영상, 3D 등',
    subcategories: [
      {
        id: 'uiux',
        name: 'UI/UX 디자인',
        tags: ['Figma', 'Sketch', '프로토타입', '사용자 경험', '웹 디자인'],
      },
      {
        id: 'graphic',
        name: '그래픽 디자인',
        tags: ['Photoshop', 'Illustrator', '브랜딩', '로고', '포스터'],
      },
      {
        id: 'video',
        name: '영상 제작',
        tags: ['Premiere', 'After Effects', '유튜브', '모션그래픽', '편집'],
      },
      {
        id: '3d',
        name: '3D·VR',
        tags: ['Blender', 'Maya', '3D 모델링', 'VR', 'AR'],
      },
    ],
  },
  {
    id: 'business-marketing',
    name: '비즈니스·마케팅',
    description: 'SNS, 콘텐츠, 광고, 브랜딩 등',
    subcategories: [
      {
        id: 'sns-marketing',
        name: 'SNS 마케팅',
        tags: ['인스타그램', '유튜브', 'TikTok', '숏폼', '콘텐츠 전략'],
      },
      {
        id: 'performance-marketing',
        name: '퍼포먼스 마케팅',
        tags: ['구글 애즈', '메타 광고', 'SEO', '데이터 분석', 'GA4'],
      },
      {
        id: 'branding',
        name: '브랜딩·전략',
        tags: ['브랜드 전략', '포지셔닝', '스토리텔링', 'CI/BI'],
      },
      {
        id: 'content-creation',
        name: '콘텐츠 제작',
        tags: ['블로그', '카피라이팅', '뉴스레터', '글쓰기'],
      },
    ],
  },
  {
    id: 'finance-investment',
    name: '재테크·금융',
    description: '주식, 부동산, 경제, 투자 등',
    subcategories: [
      {
        id: 'stock',
        name: '주식·투자',
        tags: ['주식', '해외주식', 'ETF', '투자 전략', '기술적 분석'],
      },
      {
        id: 'realestate',
        name: '부동산',
        tags: ['부동산 투자', '경매', '임대사업', '청약'],
      },
      {
        id: 'economy',
        name: '경제·금융',
        tags: ['거시경제', '금융상품', '재무설계', '은퇴 준비'],
      },
    ],
  },
  {
    id: 'startup-sidejob',
    name: '창업·부업',
    description: '1인 창업, 부업, 프리랜서 등',
    subcategories: [
      {
        id: 'online-business',
        name: '온라인 비즈니스',
        tags: ['쿠팡 파트너스', '스마트스토어', '블로그 수익화', '제휴 마케팅'],
      },
      {
        id: 'offline-business',
        name: '오프라인 창업',
        tags: ['프랜차이즈', '카페', '식당', '소자본 창업'],
      },
      {
        id: 'freelance',
        name: '프리랜서',
        tags: ['N잡러', '재능 판매', '외주', '포트폴리오'],
      },
    ],
  },
  {
    id: 'life-hobby',
    name: '라이프·취미',
    description: '요리, 운동, 공예, 반려동물 등',
    subcategories: [
      {
        id: 'cooking',
        name: '요리·베이킹',
        tags: ['홈쿡', '베이킹', '디저트', '건강식', '한식'],
      },
      {
        id: 'fitness',
        name: '운동·건강',
        tags: ['홈트', '필라테스', '요가', '다이어트', '헬스'],
      },
      {
        id: 'craft',
        name: '공예·DIY',
        tags: ['뜨개질', '목공', '캘리그라피', '수공예', '인테리어'],
      },
      {
        id: 'pet',
        name: '반려동물',
        tags: ['반려견', '고양이', '훈련', '건강', '용품'],
      },
    ],
  },
  {
    id: 'self-improvement',
    name: '자기계발·교양',
    description: '외국어, 독서, 심리, 커리어 등',
    subcategories: [
      {
        id: 'language',
        name: '외국어',
        tags: ['영어', '중국어', '일본어', '회화', '토익'],
      },
      {
        id: 'reading',
        name: '독서·글쓰기',
        tags: ['독서법', '글쓰기', '작가', '책 추천', '독서 모임'],
      },
      {
        id: 'psychology',
        name: '심리·상담',
        tags: ['심리학', '상담', '자존감', '인간관계', '마음 치유'],
      },
      {
        id: 'career',
        name: '커리어·이직',
        tags: ['이직', '면접', '이력서', '자기소개서', '커리어 전환'],
      },
    ],
  },
  {
    id: 'consulting',
    name: '전문 컨설팅',
    description: '법률, 세무, 노무, 특허 등',
    subcategories: [
      {
        id: 'legal',
        name: '법률',
        tags: ['계약서', '노동법', '부동산 법률', '소송'],
      },
      {
        id: 'tax',
        name: '세무·회계',
        tags: ['종합소득세', '부가가치세', '법인세', '회계', '절세'],
      },
      {
        id: 'labor',
        name: '노무·인사',
        tags: ['4대 보험', '근로계약서', 'HR', '급여 계산'],
      },
      {
        id: 'patent',
        name: '특허·지식재산',
        tags: ['특허', '상표', '저작권', '디자인 등록'],
      },
    ],
  },
]

// 카테고리 ID로 찾기
export function getCategoryById(categoryId: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === categoryId)
}

// 서브카테고리 ID로 찾기
export function getSubcategoryById(
  categoryId: string,
  subcategoryId: string
): Subcategory | undefined {
  const category = getCategoryById(categoryId)
  return category?.subcategories.find((sub) => sub.id === subcategoryId)
}

// 카테고리 전체 목록 (select용)
export function getCategoryOptions() {
  return CATEGORIES.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))
}

// 서브카테고리 목록 (특정 카테고리의)
export function getSubcategoryOptions(categoryId: string) {
  const category = getCategoryById(categoryId)
  return (
    category?.subcategories.map((sub) => ({
      value: sub.id,
      label: sub.name,
    })) || []
  )
}
