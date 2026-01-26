-- ============================================
-- JobsClass 2.0: Business Partner System
-- 사업자 기반 파트너 시스템 + 요금제 + 메시징
-- ============================================

-- ============================================
-- 1. 파트너 요금제 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS partner_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER NOT NULL,
  revenue_share_rate DECIMAL(5,2) NOT NULL, -- 매출 쉐어 비율 (예: 15.00)
  max_products INTEGER, -- NULL = 무제한
  ai_content_limit INTEGER, -- NULL = 무제한
  priority_listing BOOLEAN DEFAULT false,
  banner_ad BOOLEAN DEFAULT false,
  interview_benefit BOOLEAN DEFAULT false,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 요금제 데이터 삽입 (파트너 중심 수익 모델)
INSERT INTO partner_plans (id, name, name_ko, price_monthly, price_yearly, revenue_share_rate, max_products, ai_content_limit, priority_listing, banner_ad, interview_benefit, features)
VALUES 
  ('basic', 'BASIC', '베이직', 0, 0, 20.00, 5, 10, false, false, false, 
   '["월 요금 무료", "서비스 등록 5개", "매출 쉐어 20%", "기본 관리 도구", "니즈 제안 가능"]'::jsonb),
  ('pro', 'PRO', '프로', 49000, 470400, 12.00, NULL, NULL, true, false, false, 
   '["서비스 등록 무제한", "매출 쉐어 12%", "우선 노출", "AI 프로필 작성", "고급 분석 도구", "니즈 우선 알림"]'::jsonb),
  ('enterprise', 'ENTERPRISE', '엔터프라이즈', 99000, 950400, 8.00, NULL, NULL, true, true, true, 
   '["서비스 등록 무제한", "매출 쉐어 8%", "최우선 노출", "AI 프로필 작성", "배너 광고", "스타트업잡스 인터뷰", "전담 매니저", "니즈 최우선 알림"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  revenue_share_rate = EXCLUDED.revenue_share_rate,
  features = EXCLUDED.features;

-- ============================================
-- 2. user_profiles 확장 (사업자 정보)
-- ============================================
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS business_number TEXT, -- 사업자등록번호
ADD COLUMN IF NOT EXISTS business_registration_file TEXT, -- 사업자등록증 파일 URL
ADD COLUMN IF NOT EXISTS business_verified BOOLEAN DEFAULT false, -- 사업자 검증 완료 여부
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending', -- pending/approved/rejected
ADD COLUMN IF NOT EXISTS verification_message TEXT, -- 승인/거절 메시지
ADD COLUMN IF NOT EXISTS partner_plan_id TEXT REFERENCES partner_plans(id), -- 현재 요금제
ADD COLUMN IF NOT EXISTS partner_plan_start_date TIMESTAMPTZ, -- 요금제 시작일
ADD COLUMN IF NOT EXISTS partner_plan_end_date TIMESTAMPTZ, -- 요금제 만료일
ADD COLUMN IF NOT EXISTS partner_plan_billing_cycle TEXT DEFAULT 'monthly', -- monthly/yearly
ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(12,2) DEFAULT 0, -- 총 매출
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0, -- 총 주문 수
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ; -- 검증 완료 시간

-- 검증 상태 인덱스
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_status ON user_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_partner_plan ON user_profiles(partner_plan_id);

-- ============================================
-- 3. 파트너 구독 결제 내역
-- ============================================
CREATE TABLE IF NOT EXISTS partner_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES partner_plans(id),
  billing_cycle TEXT NOT NULL, -- monthly/yearly
  amount INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'card',
  payment_status TEXT DEFAULT 'pending', -- pending/completed/failed/cancelled
  payment_key TEXT, -- Toss Payments 결제 키
  order_id TEXT UNIQUE, -- 주문 ID
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  auto_renewal BOOLEAN DEFAULT true,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_user ON partner_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_status ON partner_subscriptions(payment_status);
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_end_date ON partner_subscriptions(end_date);

-- ============================================
-- 4. 플랫폼 내 메시징 시스템
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL, -- 연관 상품 (옵션)
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  partner_unread_count INTEGER DEFAULT 0,
  client_unread_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active/archived/blocked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, client_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_partner ON conversations(partner_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- ============================================
-- 5. 메시지 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_filtered TEXT, -- 연락처 필터링 후 내용
  has_contact_info BOOLEAN DEFAULT false, -- 연락처 포함 여부
  detected_contacts JSONB DEFAULT '[]'::jsonb, -- 감지된 연락처 목록
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================
-- 6. 연락처 감지 로그 (보안)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  detected_type TEXT NOT NULL, -- phone/email/url/kakao
  detected_value TEXT NOT NULL,
  action_taken TEXT DEFAULT 'warn', -- warn/block/allow
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_logs_user ON contact_detection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_logs_created_at ON contact_detection_logs(created_at DESC);

-- ============================================
-- 7. 매출 쉐어 정산 테이블 (기존 payouts 확장)
-- ============================================
ALTER TABLE payouts
ADD COLUMN IF NOT EXISTS revenue_share_rate DECIMAL(5,2), -- 해당 거래의 수수료율
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2), -- 플랫폼 수수료
ADD COLUMN IF NOT EXISTS partner_amount DECIMAL(10,2), -- 파트너 정산 금액
ADD COLUMN IF NOT EXISTS partner_plan_id TEXT REFERENCES partner_plans(id); -- 당시 요금제

-- ============================================
-- 8. RLS 정책
-- ============================================

-- partner_plans: 모두 읽기 가능
ALTER TABLE partner_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view partner plans" ON partner_plans FOR SELECT USING (true);

-- partner_subscriptions: 본인 것만 조회
ALTER TABLE partner_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON partner_subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

-- conversations: 참여자만 조회
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations" ON conversations 
  FOR SELECT USING (auth.uid() = partner_id OR auth.uid() = client_id);
CREATE POLICY "Users can create conversations" ON conversations 
  FOR INSERT WITH CHECK (auth.uid() = partner_id OR auth.uid() = client_id);
CREATE POLICY "Users can update own conversations" ON conversations 
  FOR UPDATE USING (auth.uid() = partner_id OR auth.uid() = client_id);

-- messages: 대화 참여자만 조회/생성
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their conversations" ON messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = messages.conversation_id 
      AND (partner_id = auth.uid() OR client_id = auth.uid())
    )
  );
CREATE POLICY "Users can send messages in their conversations" ON messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (partner_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- contact_detection_logs: 관리자만 조회
ALTER TABLE contact_detection_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view contact logs" ON contact_detection_logs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 9. 트리거: 대화 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NOW(),
    partner_unread_count = CASE 
      WHEN NEW.receiver_id = partner_id THEN partner_unread_count + 1 
      ELSE partner_unread_count 
    END,
    client_unread_count = CASE 
      WHEN NEW.receiver_id = client_id THEN client_unread_count + 1 
      ELSE client_unread_count 
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_on_message();

-- ============================================
-- 10. 트리거: 메시지 읽음 처리
-- ============================================
CREATE OR REPLACE FUNCTION mark_message_as_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
    UPDATE conversations
    SET 
      partner_unread_count = CASE 
        WHEN NEW.receiver_id = partner_id THEN GREATEST(partner_unread_count - 1, 0)
        ELSE partner_unread_count 
      END,
      client_unread_count = CASE 
        WHEN NEW.receiver_id = client_id THEN GREATEST(client_unread_count - 1, 0)
        ELSE client_unread_count 
      END
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_message_as_read
AFTER UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION mark_message_as_read();

-- ============================================
-- 완료!
-- ============================================
