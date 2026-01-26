-- ============================================
-- JobsClass 2.0: 양방향 매칭 시스템 (숨고 방식)
-- 클라이언트 니즈 등록 + 파트너 제안
-- ============================================

-- ============================================
-- 1. 클라이언트 니즈(요청서) 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS client_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  deadline DATE,
  location TEXT, -- 오프라인이 필요한 경우
  status TEXT DEFAULT 'open', -- open/in_progress/completed/cancelled
  view_count INTEGER DEFAULT 0,
  proposal_count INTEGER DEFAULT 0,
  matched_service_ids UUID[], -- AI 매칭된 서비스 ID 목록
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_client_needs_client ON client_needs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_needs_status ON client_needs(status);
CREATE INDEX IF NOT EXISTS idx_client_needs_category ON client_needs(category);
CREATE INDEX IF NOT EXISTS idx_client_needs_created_at ON client_needs(created_at DESC);

-- ============================================
-- 2. 파트너 제안서 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS partner_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES client_needs(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL, -- 연관 서비스 (옵션)
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposed_price INTEGER NOT NULL,
  estimated_duration TEXT, -- 예: "2주", "1개월"
  portfolio_links TEXT[], -- 포트폴리오 링크
  status TEXT DEFAULT 'pending', -- pending/accepted/rejected/withdrawn
  is_featured BOOLEAN DEFAULT false, -- 추천 제안
  ai_match_score DECIMAL(3,2), -- AI 매칭 점수 (0.00 ~ 1.00)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(need_id, partner_id)
);

CREATE INDEX IF NOT EXISTS idx_proposals_need ON partner_proposals(need_id);
CREATE INDEX IF NOT EXISTS idx_proposals_partner ON partner_proposals(partner_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON partner_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON partner_proposals(created_at DESC);

-- ============================================
-- 3. 클라이언트 프로필 (AI 자동 소개)
-- ============================================
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS client_bio TEXT, -- 클라이언트 소개
ADD COLUMN IF NOT EXISTS client_industry TEXT, -- 업종/분야
ADD COLUMN IF NOT EXISTS client_company_size TEXT, -- 회사 규모
ADD COLUMN IF NOT EXISTS client_budget_range TEXT, -- 예산 범위
ADD COLUMN IF NOT EXISTS client_preferences JSONB DEFAULT '{}'::jsonb, -- 선호 조건
ADD COLUMN IF NOT EXISTS ai_profile_summary TEXT; -- AI 생성 프로필 요약

-- 파트너 프로필 확장
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS partner_bio TEXT, -- 파트너 소개
ADD COLUMN IF NOT EXISTS partner_expertise TEXT[], -- 전문 분야
ADD COLUMN IF NOT EXISTS partner_portfolio_url TEXT, -- 포트폴리오 URL
ADD COLUMN IF NOT EXISTS partner_years_experience INTEGER, -- 경력 년수
ADD COLUMN IF NOT EXISTS partner_response_time TEXT, -- 평균 응답 시간
ADD COLUMN IF NOT EXISTS partner_success_rate DECIMAL(5,2) DEFAULT 0; -- 성공률

-- ============================================
-- 4. 니즈-제안 활동 로그
-- ============================================
CREATE TABLE IF NOT EXISTS need_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES client_needs(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- created/viewed/proposed/accepted/rejected/completed
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_need_activities_need ON need_activities(need_id);
CREATE INDEX IF NOT EXISTS idx_need_activities_actor ON need_activities(actor_id);
CREATE INDEX IF NOT EXISTS idx_need_activities_created_at ON need_activities(created_at DESC);

-- ============================================
-- 5. 알림 시스템
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- need_created/proposal_received/proposal_accepted/message_received
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 6. RLS 정책
-- ============================================

-- client_needs: 모두 읽기, 본인만 생성/수정
ALTER TABLE client_needs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view open needs" ON client_needs 
  FOR SELECT USING (status = 'open' OR client_id = auth.uid());
CREATE POLICY "Clients can create needs" ON client_needs 
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update own needs" ON client_needs 
  FOR UPDATE USING (auth.uid() = client_id);

-- partner_proposals: 니즈 작성자와 제안자만 조회
ALTER TABLE partner_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view proposals for their needs or own proposals" ON partner_proposals 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM client_needs WHERE id = need_id AND client_id = auth.uid())
    OR partner_id = auth.uid()
  );
CREATE POLICY "Partners can create proposals" ON partner_proposals 
  FOR INSERT WITH CHECK (auth.uid() = partner_id);
CREATE POLICY "Partners can update own proposals" ON partner_proposals 
  FOR UPDATE USING (auth.uid() = partner_id);

-- need_activities: 관련자만 조회
ALTER TABLE need_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view activities for their needs" ON need_activities 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM client_needs WHERE id = need_id AND client_id = auth.uid())
    OR actor_id = auth.uid()
  );

-- notifications: 본인 것만 조회/수정
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications 
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 7. 트리거: 제안 수 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_need_proposal_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE client_needs
    SET proposal_count = proposal_count + 1
    WHERE id = NEW.need_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE client_needs
    SET proposal_count = GREATEST(proposal_count - 1, 0)
    WHERE id = OLD.need_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_need_proposal_count
AFTER INSERT OR DELETE ON partner_proposals
FOR EACH ROW
EXECUTE FUNCTION update_need_proposal_count();

-- ============================================
-- 8. 트리거: 제안 시 알림 생성
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_proposal()
RETURNS TRIGGER AS $$
DECLARE
  client_user_id UUID;
  partner_name TEXT;
BEGIN
  -- 클라이언트 ID 가져오기
  SELECT client_id INTO client_user_id
  FROM client_needs
  WHERE id = NEW.need_id;
  
  -- 파트너 이름 가져오기
  SELECT display_name INTO partner_name
  FROM user_profiles
  WHERE user_id = NEW.partner_id;
  
  -- 알림 생성
  INSERT INTO notifications (user_id, type, title, message, link_url, metadata)
  VALUES (
    client_user_id,
    'proposal_received',
    '새로운 제안이 도착했습니다',
    partner_name || '님이 회원님의 요청에 제안서를 보냈습니다.',
    '/needs/' || NEW.need_id,
    jsonb_build_object('proposal_id', NEW.id, 'partner_id', NEW.partner_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_proposal
AFTER INSERT ON partner_proposals
FOR EACH ROW
EXECUTE FUNCTION notify_new_proposal();

-- ============================================
-- 9. 트리거: 제안 수락 시 알림
-- ============================================
CREATE OR REPLACE FUNCTION notify_proposal_accepted()
RETURNS TRIGGER AS $$
DECLARE
  client_name TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- 클라이언트 이름 가져오기
    SELECT display_name INTO client_name
    FROM user_profiles u
    JOIN client_needs n ON u.user_id = n.client_id
    WHERE n.id = NEW.need_id;
    
    -- 파트너에게 알림
    INSERT INTO notifications (user_id, type, title, message, link_url, metadata)
    VALUES (
      NEW.partner_id,
      'proposal_accepted',
      '제안이 수락되었습니다! 🎉',
      client_name || '님이 회원님의 제안을 수락했습니다.',
      '/proposals/' || NEW.id,
      jsonb_build_object('need_id', NEW.need_id, 'client_id', (SELECT client_id FROM client_needs WHERE id = NEW.need_id))
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_proposal_accepted
AFTER UPDATE ON partner_proposals
FOR EACH ROW
EXECUTE FUNCTION notify_proposal_accepted();

-- ============================================
-- 완료!
-- ============================================
