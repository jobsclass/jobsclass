-- 온보딩 완료 여부 필드 추가
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE;

-- 인덱스 추가 (필수값 완료 여부 조회 시 성능 향상)
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding ON user_profiles(onboarding_complete);

-- 기존 사용자들은 모두 온보딩 완료로 처리
UPDATE user_profiles
SET onboarding_complete = TRUE
WHERE bio IS NOT NULL OR job_title IS NOT NULL;

COMMENT ON COLUMN user_profiles.onboarding_complete IS '온보딩 5문항 완료 여부 (FALSE면 웹사이트 배포 불가)';
