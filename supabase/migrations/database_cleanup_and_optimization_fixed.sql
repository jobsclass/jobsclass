-- ============================================
-- JobsClass: 데이터베이스 최적화
-- 실제 테이블 구조 기반
-- ============================================

-- ============================================
-- 1. 성능 최적화를 위한 인덱스 추가
-- ============================================

-- 자주 사용되는 필터링 컬럼 (실제 필드명 사용)
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_products_service_type ON products(service_type);
CREATE INDEX IF NOT EXISTS idx_products_created_at_desc ON products(created_at DESC);

-- 파트너별 서비스 조회 최적화 (user_id 사용)
CREATE INDEX IF NOT EXISTS idx_products_user_published ON products(user_id, is_published);

-- 가격 범위 검색 최적화
CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(price) WHERE price IS NOT NULL;

-- 전문 검색 (Full-text search)
CREATE INDEX IF NOT EXISTS idx_products_search ON products 
USING gin(to_tsvector('korean', COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- ============================================
-- 2. 검색 함수 추가
-- ============================================

-- 서비스 검색 함수
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT DEFAULT NULL,
  filter_service_type TEXT DEFAULT NULL,
  filter_is_published BOOLEAN DEFAULT TRUE,
  min_price INTEGER DEFAULT NULL,
  max_price INTEGER DEFAULT NULL,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'DESC',
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  price INTEGER,
  service_type TEXT,
  is_published BOOLEAN,
  view_count INTEGER,
  purchase_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.title,
    p.description,
    p.price,
    p.service_type::TEXT,
    p.is_published,
    p.view_count,
    p.purchase_count,
    p.created_at
  FROM products p
  WHERE 
    (filter_is_published IS NULL OR p.is_published = filter_is_published)
    AND (filter_service_type IS NULL OR p.service_type::TEXT = filter_service_type)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (
      search_query IS NULL OR
      to_tsvector('korean', COALESCE(p.title, '') || ' ' || COALESCE(p.description, ''))
      @@ plainto_tsquery('korean', search_query)
    )
  ORDER BY
    CASE WHEN sort_by = 'created_at' AND sort_order = 'DESC' THEN p.created_at END DESC,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'ASC' THEN p.created_at END ASC,
    CASE WHEN sort_by = 'price' AND sort_order = 'DESC' THEN p.price END DESC,
    CASE WHEN sort_by = 'price' AND sort_order = 'ASC' THEN p.price END ASC,
    CASE WHEN sort_by = 'view_count' AND sort_order = 'DESC' THEN p.view_count END DESC,
    CASE WHEN sort_by = 'purchase_count' AND sort_order = 'DESC' THEN p.purchase_count END DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_products IS '서비스 검색 및 필터링 함수';

-- ============================================
-- 3. 통계 뷰 생성
-- ============================================

-- 파트너 수익 뷰 (user_id 기반)
CREATE OR REPLACE VIEW partner_earnings_view AS
SELECT 
  p.user_id as partner_id,
  up.display_name as partner_name,
  COUNT(DISTINCT p.id) as total_products,
  SUM(p.view_count) as total_views,
  SUM(p.purchase_count) as total_purchases,
  COALESCE(SUM(p.price * p.purchase_count), 0) as estimated_revenue
FROM products p
JOIN user_profiles up ON p.user_id = up.user_id
WHERE p.is_published = true
GROUP BY p.user_id, up.display_name;

COMMENT ON VIEW partner_earnings_view IS '파트너별 수익 통계';

-- ============================================
-- 4. 자동 updated_at 트리거 (기존에 없다면)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- products 테이블 트리거 (없다면)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. RLS 정책 확인 및 추가
-- ============================================

-- products 테이블 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 published 서비스 조회 가능
DROP POLICY IF EXISTS "products_select_published" ON products;
CREATE POLICY "products_select_published" ON products
  FOR SELECT USING (is_published = true);

-- 파트너는 자신의 서비스 모두 조회 가능
DROP POLICY IF EXISTS "products_select_own" ON products;
CREATE POLICY "products_select_own" ON products
  FOR SELECT USING (user_id = auth.uid());

-- 파트너는 자신의 서비스 생성 가능
DROP POLICY IF EXISTS "products_insert_own" ON products;
CREATE POLICY "products_insert_own" ON products
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 파트너는 자신의 서비스 수정 가능
DROP POLICY IF EXISTS "products_update_own" ON products;
CREATE POLICY "products_update_own" ON products
  FOR UPDATE USING (user_id = auth.uid());

-- 파트너는 자신의 서비스 삭제 가능
DROP POLICY IF EXISTS "products_delete_own" ON products;
CREATE POLICY "products_delete_own" ON products
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- 완료!
-- ============================================
