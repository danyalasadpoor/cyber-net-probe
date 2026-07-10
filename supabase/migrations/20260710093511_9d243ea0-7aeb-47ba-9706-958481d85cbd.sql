
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_self_upsert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Targets
CREATE TABLE public.targets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT DEFAULT '',
  favorite BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'unknown',
  status_code INT,
  latency_ms INT,
  availability NUMERIC(5,2) NOT NULL DEFAULT 0,
  checks_total INT NOT NULL DEFAULT 0,
  checks_online INT NOT NULL DEFAULT 0,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX targets_user_idx ON public.targets(user_id);
CREATE INDEX targets_user_status_idx ON public.targets(user_id, status);
CREATE INDEX targets_user_category_idx ON public.targets(user_id, category);
CREATE INDEX targets_user_favorite_idx ON public.targets(user_id, favorite);
CREATE INDEX targets_name_search_idx ON public.targets USING gin (to_tsvector('simple', name || ' ' || address));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.targets TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.targets_id_seq TO authenticated;
GRANT ALL ON public.targets TO service_role;
GRANT ALL ON SEQUENCE public.targets_id_seq TO service_role;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "targets_owner_all" ON public.targets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Scan jobs
CREATE TABLE public.scan_jobs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running',
  requested INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  completed INT NOT NULL DEFAULT 0,
  online INT NOT NULL DEFAULT 0,
  offline INT NOT NULL DEFAULT 0,
  avg_latency_ms NUMERIC(10,2),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
CREATE INDEX scan_jobs_user_idx ON public.scan_jobs(user_id, started_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scan_jobs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.scan_jobs_id_seq TO authenticated;
GRANT ALL ON public.scan_jobs TO service_role;
GRANT ALL ON SEQUENCE public.scan_jobs_id_seq TO service_role;
ALTER TABLE public.scan_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scan_jobs_owner_all" ON public.scan_jobs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Scan results (per-target samples per job)
CREATE TABLE public.scan_results (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES public.scan_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id BIGINT REFERENCES public.targets(id) ON DELETE SET NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL,
  status_code INT,
  latency_ms INT,
  error TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX scan_results_user_time_idx ON public.scan_results(user_id, checked_at DESC);
CREATE INDEX scan_results_job_idx ON public.scan_results(job_id);
CREATE INDEX scan_results_target_time_idx ON public.scan_results(target_id, checked_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scan_results TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.scan_results_id_seq TO authenticated;
GRANT ALL ON public.scan_results TO service_role;
GRANT ALL ON SEQUENCE public.scan_results_id_seq TO service_role;
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scan_results_owner_all" ON public.scan_results FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Activity logs
CREATE TABLE public.activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX activity_logs_user_time_idx ON public.activity_logs(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_logs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.activity_logs_id_seq TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
GRANT ALL ON SEQUENCE public.activity_logs_id_seq TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_logs_owner_all" ON public.activity_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User settings
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  timeout_ms INT NOT NULL DEFAULT 5000,
  concurrency INT NOT NULL DEFAULT 20,
  notifications BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_settings_owner_all" ON public.user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER targets_touch BEFORE UPDATE ON public.targets FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Profile auto-provision
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles(id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_settings(user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
