// JobsClass v2.0 상수 및 타입 정의

// ============================================
// 서비스 유형 (7가지)
// ============================================

export interface JobsClassServiceType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const JOBSCLASS_SERVICE_TYPES: JobsClassServiceType[] = [
  {
    id: 'online-course',
    name: '온라인 강의',
    description: 'VOD 중심의 체계적인 지식 콘텐츠',
    icon: '🎓',
    color: 'blue',
  },
  {
    id: 'coaching',
    name: '1:1 코칭/멘토링',
    description: '개인 맞춤형 코칭 서비스',
    icon: '🎯',
    color: 'green',
  },
  {
    id: 'consulting',
    name: '컨설팅',
    description: '전문적인 문제 해결 및 조언',
    icon: '💼',
    color: 'purple',
  },
  {
    id: 'ebook',
    name: '전자책',
    description: 'PDF, ePub 등 디지털 도서',
    icon: '📚',
    color: 'orange',
  },
  {
    id: 'template',
    name: '템플릿/도구',
    description: '바로 사용 가능한 템플릿과 도구',
    icon: '🛠️',
    color: 'yellow',
  },
  {
    id: 'service',
    name: '전문 서비스',
    description: '디자인, 개발 등 전문 서비스',
    icon: '⚡',
    color: 'red',
  },
  {
    id: 'community',
    name: '커뮤니티/멤버십',
    description: '지속적인 커뮤니티 및 콘텐츠',
    icon: '👥',
    color: 'pink',
  },
];

// ============================================
// 카테고리 (8개)
// ============================================

export interface JobsClassSubcategory {
  id: string;
  name: string;
}

export interface JobsClassCategory {
  id: string;
  name: string;
  description: string;
  emoji: string;
  subcategories: JobsClassSubcategory[];
}

export const JOBSCLASS_CATEGORIES: JobsClassCategory[] = [
  {
    id: 'it-dev',
    name: 'IT·개발',
    description: '웹/앱 개발, 데이터, AI',
    emoji: '💻',
    subcategories: [
      { id: 'web-dev', name: '웹 개발' },
      { id: 'app-dev', name: '앱 개발' },
      { id: 'data-ai', name: '데이터·AI' },
      { id: 'game-dev', name: '게임 개발' },
      { id: 'programming-basics', name: '프로그래밍 기초' },
    ],
  },
  {
    id: 'design-creative',
    name: '디자인·크리에이티브',
    description: 'UI/UX, 그래픽, 영상',
    emoji: '🎨',
    subcategories: [
      { id: 'uiux', name: 'UI/UX 디자인' },
      { id: 'graphic', name: '그래픽 디자인' },
      { id: 'video', name: '영상 제작' },
      { id: '3d', name: '3D·VR' },
    ],
  },
  {
    id: 'business-marketing',
    name: '비즈니스·마케팅',
    description: 'SNS, 퍼포먼스, 브랜딩',
    emoji: '📈',
    subcategories: [
      { id: 'sns-marketing', name: 'SNS 마케팅' },
      { id: 'performance-marketing', name: '퍼포먼스 마케팅' },
      { id: 'branding', name: '브랜딩·전략' },
      { id: 'content-creation', name: '콘텐츠 제작' },
    ],
  },
  {
    id: 'finance-investment',
    name: '재테크·금융',
    description: '주식, 부동산, 경제',
    emoji: '💰',
    subcategories: [
      { id: 'stock', name: '주식·투자' },
      { id: 'realestate', name: '부동산' },
      { id: 'economy', name: '경제·금융' },
    ],
  },
  {
    id: 'startup-sidejob',
    name: '창업·부업',
    description: '온라인 비즈니스, 창업',
    emoji: '🚀',
    subcategories: [
      { id: 'online-business', name: '온라인 비즈니스' },
      { id: 'offline-business', name: '오프라인 창업' },
      { id: 'freelance', name: '프리랜서' },
    ],
  },
  {
    id: 'life-hobby',
    name: '라이프·취미',
    description: '요리, 운동, 공예',
    emoji: '🎭',
    subcategories: [
      { id: 'cooking', name: '요리·베이킹' },
      { id: 'fitness', name: '운동·건강' },
      { id: 'craft', name: '공예·DIY' },
      { id: 'pet', name: '반려동물' },
    ],
  },
  {
    id: 'self-improvement',
    name: '자기계발·교양',
    description: '외국어, 독서, 심리',
    emoji: '📖',
    subcategories: [
      { id: 'language', name: '외국어' },
      { id: 'reading', name: '독서·글쓰기' },
      { id: 'psychology', name: '심리·상담' },
      { id: 'career', name: '커리어·이직' },
    ],
  },
  {
    id: 'consulting',
    name: '전문 컨설팅',
    description: '법률, 세무, 노무',
    emoji: '💼',
    subcategories: [
      { id: 'legal', name: '법률' },
      { id: 'tax', name: '세무·회계' },
      { id: 'labor', name: '노무·인사' },
      { id: 'patent', name: '특허·지식재산' },
    ],
  },
];

// ============================================
// 플랫폼 수수료 (10%)
// ============================================

export const PLATFORM_FEE_RATE = 0.10; // 10%

export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * PLATFORM_FEE_RATE);
}

export function calculatePartnerAmount(amount: number): number {
  return amount - calculatePlatformFee(amount);
}

export interface FeeBreakdown {
  amount: number;
  platform_fee: number;
  partner_amount: number;
}

export function calculateFeeBreakdown(amount: number): FeeBreakdown {
  const platform_fee = calculatePlatformFee(amount);
  const partner_amount = calculatePartnerAmount(amount);

  return {
    amount,
    platform_fee,
    partner_amount,
  };
}

// ============================================
// 헬퍼 함수
// ============================================

export function getServiceTypeById(id: string): JobsClassServiceType | undefined {
  return JOBSCLASS_SERVICE_TYPES.find((type) => type.id === id);
}

export function getCategoryById(id: string): JobsClassCategory | undefined {
  return JOBSCLASS_CATEGORIES.find((category) => category.id === id);
}

export function formatPrice(price: number, currency: string = 'KRW'): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `JC-${dateStr}-${randomStr}`;
}
