-- Enable realtime for beta_signups table
ALTER TABLE public.beta_signups REPLICA IDENTITY FULL;

-- Add beta_signups to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.beta_signups;