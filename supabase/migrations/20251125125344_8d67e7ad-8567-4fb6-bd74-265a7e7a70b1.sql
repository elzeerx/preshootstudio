-- Add email tracking fields to beta_invitations table
ALTER TABLE public.beta_invitations
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS link_clicked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS opened_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_beta_invitations_token ON public.beta_invitations(token);

-- Add comment for documentation
COMMENT ON COLUMN public.beta_invitations.email_opened_at IS 'Timestamp when the invitation email was first opened';
COMMENT ON COLUMN public.beta_invitations.link_clicked_at IS 'Timestamp when the invitation link was first clicked';
COMMENT ON COLUMN public.beta_invitations.opened_count IS 'Number of times the email was opened (tracked via pixel)';
COMMENT ON COLUMN public.beta_invitations.clicked_count IS 'Number of times the invitation link was clicked';