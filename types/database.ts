// 서비스 카테고리 (8개 대분류)
export type ServiceCategory = 
  | 'it-dev'                // IT·개발
  | 'design-creative'       // 디자인·크리에이티브
  | 'business-marketing'    // 비즈니스·마케팅
  | 'finance-investment'    // 재테크·금융
  | 'startup-sidejob'       // 창업·부업
  | 'life-hobby'            // 라이프·취미
  | 'self-improvement'      // 자기계발·교양
  | 'consulting'            // 전문 컨설팅

// 서비스 세부 분류 (Depth 2)
export type ServiceSubcategory = 
  // IT·개발
  | 'web-dev'
  | 'app-dev'
  | 'data-ai'
  | 'game-dev'
  | 'programming-basics'
  // 디자인·크리에이티브
  | 'uiux'
  | 'graphic'
  | 'video'
  | '3d'
  // 비즈니스·마케팅
  | 'sns-marketing'
  | 'performance-marketing'
  | 'branding'
  | 'content-creation'
  // 재테크·금융
  | 'stock'
  | 'realestate'
  | 'economy'
  // 창업·부업
  | 'online-business'
  | 'offline-business'
  | 'freelance'
  // 라이프·취미
  | 'cooking'
  | 'fitness'
  | 'craft'
  | 'pet'
  // 자기계발·교양
  | 'language'
  | 'reading'
  | 'psychology'
  | 'career'
  // 전문 컨설팅
  | 'legal'
  | 'tax'
  | 'labor'
  | 'patent'

// 가격 모델
export type PricingModel = 
  | 'fixed'              // 고정 가격
  | 'hourly'             // 시간당
  | 'daily'              // 일당
  | 'package'            // 패키지
  | 'quote'              // 견적 문의
  | 'subscription'       // 구독

export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PRO'

export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded'

export type RefundStatus = 'pending' | 'approved' | 'rejected'

export interface PartnerProfile {
  id: string
  user_id: string
  display_name: string
  profile_url: string
  bio?: string
  avatar_url?: string
  subscription_plan: SubscriptionPlan
  early_bird: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  partner_id: string
  title: string
  slug: string
  description: string
  category_1: ServiceCategory          // 대분류
  category_2?: ServiceSubcategory      // 세부 분류
  tags?: string[]                      // 태그
  base_price?: number
  discount_price?: number
  instructor_name: string
  instructor_bio?: string
  thumbnail_url?: string
  curriculum?: any
  schedule?: any
  requirements?: string[]
  expected_outcomes?: string[]
  portfolio_images?: string[]
  channel_stats?: {
    platform?: string
    followers?: number
    avg_views?: number
    engagement_rate?: number
  }
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ServicePricing {
  id: string
  service_id: string
  pricing_model: PricingModel
  fixed_price?: number
  hourly_rate?: number
  daily_rate?: number
  packages?: {
    name: string
    price: number
    features: string[]
    duration_days?: number
  }[]
  subscription_monthly?: number
  subscription_yearly?: number
  delivery_days?: number
  revisions_included?: number
  created_at: string
  updated_at: string
}

export interface CourseVideo {
  id: string
  service_id: string
  title: string
  vimeo_url: string
  order_index: number
  duration?: number
  created_at: string
}

export interface Buyer {
  id: string
  partner_id: string
  email: string
  password_hash: string
  name: string
  phone?: string
  created_at: string
}

export interface Cart {
  id: string
  buyer_id: string
  service_id: string
  quantity: number
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  partner_id: string
  buyer_id: string
  service_id: string
  amount: number
  discount_amount: number
  final_amount: number
  coupon_id?: string
  status: OrderStatus
  payment_method?: string
  payment_key?: string
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  order_id: string
  service_id: string
  buyer_id: string
  started_watching: boolean
  progress: any
  completed: boolean
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  partner_id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase_amount?: number
  max_uses?: number
  used_count: number
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
}

export interface CouponUsage {
  id: string
  coupon_id: string
  order_id: string
  buyer_id: string
  created_at: string
}

export interface RefundRequest {
  id: string
  order_id: string
  buyer_id: string
  reason: string
  status: RefundStatus
  admin_note?: string
  created_at: string
  updated_at: string
}
