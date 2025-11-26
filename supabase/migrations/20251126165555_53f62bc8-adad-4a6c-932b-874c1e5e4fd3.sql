-- 1. Add run count columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS research_run_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS scripts_run_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS broll_run_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prompts_run_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS article_run_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS simplify_run_count INTEGER DEFAULT 0;

-- 2. Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price_monthly_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_yearly_usd NUMERIC(10,2),
    project_limit_monthly INTEGER,
    token_limit_monthly INTEGER NOT NULL,
    redo_limit_per_tab INTEGER NOT NULL DEFAULT 1,
    export_enabled BOOLEAN DEFAULT FALSE,
    api_access BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    paypal_product_id TEXT,
    paypal_plan_id_monthly TEXT,
    paypal_plan_id_yearly TEXT,
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Seed default plans
INSERT INTO subscription_plans (name, name_ar, slug, price_monthly_usd, price_yearly_usd, project_limit_monthly, token_limit_monthly, redo_limit_per_tab, export_enabled, priority_support, api_access, sort_order) VALUES
('Free', 'مجاني', 'free', 0, NULL, 5, 50000, 1, false, false, false, 0),
('Creator', 'المبدع', 'creator', 19, 190, 25, 250000, 5, true, false, false, 1),
('Pro', 'المحترف', 'pro', 49, 490, 100, 750000, 15, true, true, false, 2),
('Studio', 'الاستوديو', 'studio', 149, 1490, 999, 3000000, 99, true, true, true, 3)
ON CONFLICT (slug) DO NOTHING;

-- 3. Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    paypal_subscription_id TEXT UNIQUE,
    paypal_payer_id TEXT,
    paypal_email TEXT,
    billing_period TEXT DEFAULT 'monthly',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    projects_used_this_period INTEGER DEFAULT 0,
    canceled_at TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Create payment_history table
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES subscriptions(id),
    paypal_transaction_id TEXT NOT NULL,
    paypal_subscription_id TEXT,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL,
    plan_slug TEXT,
    plan_name TEXT,
    billing_period TEXT,
    paypal_event_id TEXT,
    paypal_event_type TEXT,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on payment_history
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- 5. Add subscription_tier to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- 6. RLS Policies for subscription_plans
CREATE POLICY "Everyone can view active plans" ON subscription_plans
FOR SELECT USING (is_active = true);

-- 7. RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription" ON subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON subscriptions
FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Admins can view all subscriptions" ON subscriptions
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. RLS Policies for payment_history
CREATE POLICY "Users can view their own payment history" ON payment_history
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert payment history" ON payment_history
FOR INSERT WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Admins can view all payment history" ON payment_history
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- 9. Create updated_at trigger for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 10. Create updated_at trigger for subscription_plans
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON subscription_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();