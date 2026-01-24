// 서비스 카테고리 (6개)
export type ServiceCategory = 
  | 'education'          // 교육 서비스
  | 'mentoring'          // 멘토링
  | 'intensive'          // 집중 프로그램
  | 'professional'       // 전문 서비스
  | 'collaboration'      // 협업 & 홍보
  | 'digital'            // 디지털 상품

// 서비스 세부 타입
export type ServiceSubtype = 
  // 교육 서비스
  | 'online-course'
  | 'offline-lecture'
  | 'workshop'
  // 멘토링
  | '1on1-mentoring'
  | 'group-mentoring'
  | 'longterm-mentoring'
  // 집중 프로그램
  | 'bootcamp'
  | 'retreat'
  | 'challenge'
  // 전문 서비스
  | 'design'
  | 'development'
  | 'marketing'
  // 협업 & 홍보
  | 'youtube-promo'
  | 'instagram-promo'
  | 'blog-collab'
  // 디지털 상품
  | 'ebook'
  | 'template'
  | 'membership'

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
  category: ServiceCategory
  service_subtype: ServiceSubtype
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
