-- Add dunning management columns to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS dunning_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_dunning_email timestamp with time zone,
ADD COLUMN IF NOT EXISTS grace_period_end timestamp with time zone,
ADD COLUMN IF NOT EXISTS payment_retry_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_payment_attempt timestamp with time zone;

-- Add index for dunning queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_dunning ON subscriptions(status, grace_period_end, dunning_count) 
WHERE status IN ('past_due', 'active');

COMMENT ON COLUMN subscriptions.dunning_count IS 'Number of dunning emails sent for current payment failure';
COMMENT ON COLUMN subscriptions.last_dunning_email IS 'Timestamp of last dunning reminder email sent';
COMMENT ON COLUMN subscriptions.grace_period_end IS 'End date of grace period before suspension';
COMMENT ON COLUMN subscriptions.payment_retry_count IS 'Number of automatic payment retry attempts';
COMMENT ON COLUMN subscriptions.last_payment_attempt IS 'Timestamp of last payment retry attempt';