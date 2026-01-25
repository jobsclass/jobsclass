-- ============================================
-- Corefy 웹빌더 - 문제-해결 중심 필드 추가
-- ============================================

-- websites 테이블에 새 필드 추가
ALTER TABLE websites 
ADD COLUMN IF NOT EXISTS problem_category TEXT,
ADD COLUMN IF NOT EXISTS solution_types TEXT[],
ADD COLUMN IF NOT EXISTS target_customer TEXT;

-- 인덱스 추가 (검색 최적화)
CREATE INDEX IF NOT EXISTS idx_websites_problem_category ON websites(problem_category);

-- 주석 추가
COMMENT ON COLUMN websites.problem_category IS '고객이 해결하는 문제 카테고리 (예: 💰 수익 창출, 🚀 비즈니스 성장)';
COMMENT ON COLUMN websites.solution_types IS '제공하는 솔루션 타입 배열 (예: [온라인 강의, 전자책, 컨설팅])';
COMMENT ON COLUMN websites.target_customer IS '타겟 고객 설명 (예: 프리랜서 디자이너, 초보 마케터)';
