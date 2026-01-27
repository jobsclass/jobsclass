-- 방금 가입한 유저 확인
SELECT 
  user_id,
  display_name,
  email,
  profile_type,
  business_number,
  business_registration_file,
  verification_status,
  onboarding_complete,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 3;

-- 크레딧 거래 내역 확인 (10,000 크레딧 지급 확인)
SELECT 
  user_id,
  type,
  amount,
  balance_after,
  description,
  created_at
FROM credit_transactions
ORDER BY created_at DESC
LIMIT 5;
