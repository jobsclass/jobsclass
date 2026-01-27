-- ============================================
-- JobsClass: 데이터베이스 정리 및 최적화
-- products 테이블 표준화, 인덱스 최적화, 뷰 생성
-- ============================================

-- ============================================
-- 1. products 테이블 최종 구조 확정
-- ============================================
-- 이미 존재하는 products 테이블을 JobsClass 표준으로 사용
-- services 테이블은 레거시로 처리 (사용 안 함)

COMMENT ON TABLE products IS 'JobsClass 메인 서비스/상품 테이블 (표준)';

-- ============================================
-- 2. 성능 최적화를 위한 인덱스 추가
-- ============================================

-- 자주 사용되는 필터링 컬럼
CREATE INDEX IF NOT EXISTS idx_products_status_active ON products(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_category_type ON products(category, service_type);
CREATE INDEX IF NOT EXISTS idx_products_pricing_model ON products(pricing_model);
CREATE INDEX IF NOT EXISTS idx_products_created_at_desc ON products(created_at DESC);

-- 파트너별 서비스 조회 최적화
CREATE INDEX IF NOT EXISTS idx_products_partner_status ON products(partner_id, status);

-- 가격 범위 검색 최적화
CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(price) WHERE price IS NOT NULL;

-- 전문 검색 (Full-text search)
CREATE INDEX IF NOT EXISTS idx_products_title_search ON products USING GIN (to_tsvector('korean', title));
CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING GIN (to_tsvector('korean', description));

-- client_needs 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_client_needs_status_open ON client_needs(status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_client_needs_category ON client_needs(category);
CREATE INDEX IF NOT EXISTS idx_client_needs_created_at_desc ON client_needs(created_at DESC);

-- proposals 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_proposals_need_status ON proposals(need_id, status);
CREATE INDEX IF NOT EXISTS idx_proposals_partner_status ON proposals(partner_id, status);

-- quotations 테이블 인덱스 (이미 있지만 확인)
CREATE INDEX IF NOT EXISTS idx_quotations_status_valid ON quotations(status, valid_until);

-- contracts 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_contracts_status_active ON contracts(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_contracts_client_status ON contracts(client_id, status);
CREATE INDEX IF NOT EXISTS idx_contracts_partner_status ON contracts(partner_id, status);

-- ============================================
-- 3. 복합 뷰 생성 (자주 사용하는 JOIN 쿼리 단순화)
-- ============================================

-- 뷰 1: 서비스 상세 정보 (파트너 정보 포함)
DROP VIEW IF EXISTS products_with_partner CASCADE;
CREATE VIEW products_with_partner AS
SELECT 
  p.*,
  up.display_name as partner_name,
  up.username as partner_username,
  up.avatar_url as partner_avatar,
  up.partner_success_rate,
  up.partner_total_revenue,
  up.partner_completed_projects,
  up.bio as partner_bio,
  up.expertise as partner_expertise
FROM products p
LEFT JOIN user_profiles up ON p.partner_id = up.id;

COMMENT ON VIEW products_with_partner IS '서비스 정보 + 파트너 프로필 (마켓플레이스 리스트용)';

-- 뷰 2: 니즈 + 클라이언트 정보 + 제안 수
DROP VIEW IF EXISTS needs_with_client CASCADE;
CREATE VIEW needs_with_client AS
SELECT 
  cn.*,
  up.display_name as client_name,
  up.avatar_url as client_avatar,
  COUNT(DISTINCT p.id) as proposal_count
FROM client_needs cn
LEFT JOIN user_profiles up ON cn.client_id = up.id
LEFT JOIN proposals p ON cn.id = p.need_id
GROUP BY cn.id, up.display_name, up.avatar_url;

COMMENT ON VIEW needs_with_client IS '니즈 정보 + 클라이언트 프로필 + 제안 수';

-- 뷰 3: 진행 중인 프로젝트 대시보드
DROP VIEW IF EXISTS active_projects CASCADE;
CREATE VIEW active_projects AS
SELECT 
  c.id as contract_id,
  c.contract_number,
  c.agreed_price,
  c.status as contract_status,
  c.start_date,
  c.end_date,
  c.created_at,
  
  -- 파트너 정보
  c.partner_id,
  partner.display_name as partner_name,
  partner.avatar_url as partner_avatar,
  
  -- 클라이언트 정보
  c.client_id,
  client.display_name as client_name,
  client.avatar_url as client_avatar,
  
  -- 견적서 정보
  q.quotation_number,
  q.total_price as quotation_price,
  
  -- 마일스톤 진행률
  COALESCE(AVG(pm.progress), 0) as overall_progress,
  COUNT(DISTINCT pm.id) as total_milestones,
  COUNT(DISTINCT CASE WHEN pm.status = 'completed' THEN pm.id END) as completed_milestones,
  
  -- 납품 현황
  COUNT(DISTINCT d.id) as total_deliveries,
  COUNT(DISTINCT CASE WHEN d.status = 'approved' THEN d.id END) as approved_deliveries
  
FROM contracts c
LEFT JOIN user_profiles partner ON c.partner_id = partner.id
LEFT JOIN user_profiles client ON c.client_id = client.id
LEFT JOIN quotations q ON c.quotation_id = q.id
LEFT JOIN project_milestones pm ON c.id = pm.contract_id
LEFT JOIN deliveries d ON c.id = d.contract_id
WHERE c.status = 'active'
GROUP BY 
  c.id, c.contract_number, c.agreed_price, c.status, c.start_date, c.end_date, c.created_at,
  c.partner_id, partner.display_name, partner.avatar_url,
  c.client_id, client.display_name, client.avatar_url,
  q.quotation_number, q.total_price;

COMMENT ON VIEW active_projects IS '진행 중인 프로젝트 전체 현황 (대시보드용)';

-- 뷰 4: 파트너 통계
DROP VIEW IF EXISTS partner_stats CASCADE;
CREATE VIEW partner_stats AS
SELECT 
  up.id as partner_id,
  up.display_name,
  up.username,
  
  -- 서비스 통계
  COUNT(DISTINCT p.id) as total_services,
  COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_services,
  
  -- 제안 통계
  COUNT(DISTINCT pr.id) as total_proposals,
  COUNT(DISTINCT CASE WHEN pr.status = 'accepted' THEN pr.id END) as accepted_proposals,
  
  -- 계약 통계
  COUNT(DISTINCT c.id) as total_contracts,
  COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_contracts,
  COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN c.id END) as completed_contracts,
  
  -- 매출 통계
  COALESCE(SUM(CASE WHEN c.status = 'completed' THEN c.agreed_price END), 0) as total_revenue,
  COALESCE(AVG(CASE WHEN c.status = 'completed' THEN c.agreed_price END), 0) as avg_project_value,
  
  -- 평점 (미래 구현 예정)
  up.partner_success_rate as success_rate
  
FROM user_profiles up
LEFT JOIN products p ON up.id = p.partner_id
LEFT JOIN proposals pr ON up.id = pr.partner_id
LEFT JOIN contracts c ON up.id = c.partner_id
WHERE up.user_type = 'partner'
GROUP BY up.id, up.display_name, up.username, up.partner_success_rate;

COMMENT ON VIEW partner_stats IS '파트너별 통계 정보 (대시보드/프로필용)';

-- ============================================
-- 4. 유용한 함수 생성
-- ============================================

-- 함수 1: 서비스 검색 (전문 검색)
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT,
  filter_category TEXT DEFAULT NULL,
  filter_service_type TEXT DEFAULT NULL,
  filter_pricing_model TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price INTEGER,
  category TEXT,
  service_type service_type,
  pricing_model pricing_model,
  partner_name TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.category,
    p.service_type,
    p.pricing_model,
    up.display_name as partner_name,
    ts_rank(
      to_tsvector('korean', p.title || ' ' || COALESCE(p.description, '')),
      plainto_tsquery('korean', search_query)
    ) as rank
  FROM products p
  LEFT JOIN user_profiles up ON p.partner_id = up.id
  WHERE 
    p.status = 'active'
    AND (
      search_query IS NULL OR
      to_tsvector('korean', p.title || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('korean', search_query)
    )
    AND (filter_category IS NULL OR p.category = filter_category)
    AND (filter_service_type IS NULL OR p.service_type::TEXT = filter_service_type)
    AND (filter_pricing_model IS NULL OR p.pricing_model::TEXT = filter_pricing_model)
  ORDER BY rank DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_products IS '서비스 전문 검색 (한글 지원)';

-- 함수 2: 추천 서비스 (간단한 버전, AI 매칭 전까지)
CREATE OR REPLACE FUNCTION recommend_products_for_need(
  need_id_param UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price INTEGER,
  service_type service_type,
  partner_name TEXT,
  match_score NUMERIC
) AS $$
DECLARE
  need_category TEXT;
  need_keywords TEXT[];
BEGIN
  -- 니즈 정보 가져오기
  SELECT category, ARRAY(SELECT unnest(string_to_array(lower(title || ' ' || description), ' ')))
  INTO need_category, need_keywords
  FROM client_needs
  WHERE id = need_id_param;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.service_type,
    up.display_name as partner_name,
    (
      -- 카테고리 일치: 50점
      CASE WHEN p.category = need_category THEN 50 ELSE 0 END +
      -- 키워드 매칭: 최대 30점
      (
        SELECT COUNT(*) * 10
        FROM unnest(need_keywords) nk
        WHERE lower(p.title || ' ' || COALESCE(p.description, '')) LIKE '%' || nk || '%'
      )::INTEGER +
      -- 파트너 성공률: 최대 20점
      COALESCE(up.partner_success_rate, 0) / 5
    )::NUMERIC as match_score
  FROM products p
  LEFT JOIN user_profiles up ON p.partner_id = up.id
  WHERE 
    p.status = 'active'
    AND (p.category = need_category OR need_category IS NULL)
  ORDER BY match_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION recommend_products_for_need IS '니즈에 맞는 서비스 추천 (간단한 키워드 매칭)';

-- ============================================
-- 5. 통계용 Materialized View (선택적)
-- ============================================

-- 일일 통계 (성능 중요한 경우)
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_stats AS
SELECT 
  date_trunc('day', created_at) as date,
  COUNT(*) as total_services,
  COUNT(DISTINCT partner_id) as active_partners,
  AVG(price) as avg_price
FROM products
WHERE status = 'active'
GROUP BY date_trunc('day', created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

COMMENT ON MATERIALIZED VIEW daily_stats IS '일일 통계 (수동 REFRESH 필요)';

-- Refresh 함수
CREATE OR REPLACE FUNCTION refresh_daily_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. 데이터 정합성 체크
-- ============================================

-- products 테이블의 필수 필드 체크
DO $$
BEGIN
  -- pricing_model이 negotiable인데 price_range_min이 NULL인 경우 경고
  IF EXISTS (
    SELECT 1 FROM products 
    WHERE pricing_model = 'negotiable' 
    AND price_range_min IS NULL
  ) THEN
    RAISE WARNING '협의제 서비스 중 최소 가격이 설정되지 않은 항목이 있습니다.';
  END IF;
  
  -- pricing_model이 fixed인데 price가 NULL인 경우 경고
  IF EXISTS (
    SELECT 1 FROM products 
    WHERE pricing_model = 'fixed' 
    AND price IS NULL
  ) THEN
    RAISE WARNING '정액제 서비스 중 가격이 설정되지 않은 항목이 있습니다.';
  END IF;
END $$;

-- ============================================
-- 완료!
-- ============================================
