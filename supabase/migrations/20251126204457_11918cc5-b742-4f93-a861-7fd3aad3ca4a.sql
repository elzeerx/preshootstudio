-- Fix token limit default for free tier (50K instead of 100K)
ALTER TABLE profiles 
ALTER COLUMN monthly_token_limit SET DEFAULT 50000;

-- Update existing free tier users who still have the old default
UPDATE profiles 
SET monthly_token_limit = 50000
WHERE subscription_tier = 'free' 
  AND monthly_token_limit = 100000;

-- Fix Nawaf's account: Create subscription record
INSERT INTO subscriptions (
  user_id,
  plan_id,
  status,
  paypal_subscription_id,
  billing_period,
  current_period_start,
  current_period_end
) 
SELECT 
  p.id,
  sp.id,
  'active',
  'I-PUGT0G3XTU2H',
  'monthly',
  NOW(),
  NOW() + INTERVAL '1 month'
FROM profiles p
CROSS JOIN subscription_plans sp
WHERE p.email = 'nawaf@recipe.marketing'
  AND sp.slug = 'creator'
ON CONFLICT (user_id) DO NOTHING;

-- Update Nawaf's profile to Creator tier with correct token limit
UPDATE profiles 
SET 
  subscription_tier = 'creator',
  monthly_token_limit = 250000
WHERE email = 'nawaf@recipe.marketing';