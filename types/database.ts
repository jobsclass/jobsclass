export type ServiceType = 
  | 'online-course'
  | 'offline-course'
  | 'consulting'
  | 'bootcamp'
  | 'coaching'
  | 'event'
  | 'professional-service'

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
  service_type: ServiceType
  price: number
  discount_price?: number
  instructor_name: string
  instructor_bio?: string
  thumbnail_url?: string
  curriculum?: any
  schedule?: any
  requirements?: string[]
  expected_outcomes?: string[]
  is_published: boolean
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
