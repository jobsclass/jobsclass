// 서비스 타입 정의 (6가지)
export const SERVICE_TYPES = {
  online_course: {
    id: 'online_course',
    name: '온라인 강의',
    description: 'VOD 중심의 체계적인 지식 콘텐츠',
    icon: '🎓',
    color: 'blue'
  },
  mentoring: {
    id: 'mentoring',
    name: '멘토링',
    description: '1:1 또는 소규모 맞춤 코칭 (컨설팅 포함)',
    icon: '🎯',
    color: 'green'
  },
  group_coaching: {
    id: 'group_coaching',
    name: '그룹 코칭',
    description: '규모별 선택 가능 (소/중/대규모)',
    icon: '👥',
    color: 'purple'
  },
  digital_product: {
    id: 'digital_product',
    name: '디지털 상품',
    description: '전자책, 템플릿, 콘텐츠 판매',
    icon: '📦',
    color: 'orange'
  },
  project_service: {
    id: 'project_service',
    name: '프로젝트 대행',
    description: '개발/디자인/마케팅 등 실무 대행 (홍보 포함)',
    icon: '🚀',
    color: 'red'
  },
  community_event: {
    id: 'community_event',
    name: '커뮤니티 & 네트워킹',
    description: '오프라인 모임, 스터디 그룹, 네트워크 이벤트',
    icon: '🤝',
    color: 'pink'
  }
} as const

export type ServiceTypeId = keyof typeof SERVICE_TYPES

// 카테고리 정의 (8개)
export const CATEGORIES = {
  tech: {
    id: 'tech',
    name: 'IT & 기술',
    description: '개발, 데이터, AI, 프로그래밍',
    emoji: '💻',
    color: 'blue'
  },
  design: {
    id: 'design',
    name: '디자인 & 크리에이티브',
    description: 'UI/UX, 그래픽, 영상, 3D',
    emoji: '🎨',
    color: 'purple'
  },
  marketing: {
    id: 'marketing',
    name: '마케팅 & 세일즈',
    description: '퍼포먼스, SNS, 브랜딩, 콘텐츠',
    emoji: '📈',
    color: 'green'
  },
  business: {
    id: 'business',
    name: '비즈니스 & 전략',
    description: '창업, 경영, 재테크, 투자',
    emoji: '💼',
    color: 'indigo'
  },
  content: {
    id: 'content',
    name: '콘텐츠 & 미디어',
    description: '글쓰기, 블로그, 영상, 크리에이터',
    emoji: '✍️',
    color: 'yellow'
  },
  language: {
    id: 'language',
    name: '언어 & 글로벌',
    description: '외국어, 번역, 글로벌 비즈니스',
    emoji: '🌐',
    color: 'cyan'
  },
  lifestyle: {
    id: 'lifestyle',
    name: '라이프스타일 & 웰니스',
    description: '운동, 건강, 요리, 취미',
    emoji: '🧘',
    color: 'pink'
  },
  career: {
    id: 'career',
    name: '커리어 & 자기계발',
    description: '이직, 면접, 자기계발, 심리',
    emoji: '🎯',
    color: 'orange'
  }
} as const

export type CategoryId = keyof typeof CATEGORIES

// TypeScript 타입
export interface ServiceType {
  id: ServiceTypeId
  name: string
  description: string
  icon: string
  color: string
}

export interface Category {
  id: CategoryId
  name: string
  description: string
  emoji: string
  color: string
}

// 헬퍼 함수
export const getServiceType = (id: ServiceTypeId): ServiceType => SERVICE_TYPES[id]
export const getCategory = (id: CategoryId): Category => CATEGORIES[id]

export const getAllServiceTypes = (): ServiceType[] => 
  Object.values(SERVICE_TYPES)

export const getAllCategories = (): Category[] => 
  Object.values(CATEGORIES)
