-- ============================================
-- Fix user_profiles table for JobsClass
-- Add missing columns for business verification
-- ============================================

-- Add missing columns to user_profiles if they don't exist
DO $$ 
BEGIN
  -- business_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'business_number'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN business_number TEXT;
    RAISE NOTICE '✅ business_number column added';
  END IF;

  -- business_registration_file
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'business_registration_file'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN business_registration_file TEXT;
    RAISE NOTICE '✅ business_registration_file column added';
  END IF;

  -- verification_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN verification_status TEXT DEFAULT 'pending';
    RAISE NOTICE '✅ verification_status column added';
  END IF;

  -- onboarding_complete
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'onboarding_complete'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_complete BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ onboarding_complete column added';
  END IF;
END $$;

-- Create index on business_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_number 
  ON user_profiles(business_number);

-- Create index on verification_status
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_status 
  ON user_profiles(verification_status);

-- ============================================
-- Success message
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ user_profiles table updated successfully!';
  RAISE NOTICE 'Added columns: business_number, business_registration_file, verification_status, onboarding_complete';
  RAISE NOTICE '';
END $$;
