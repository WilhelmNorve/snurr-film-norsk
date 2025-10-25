-- Tabeller for videoplattform

-- Videos tabell
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- i sekunder
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video reports tabell
CREATE TABLE public.video_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- User actions tabell (bans, suspensions)
CREATE TABLE public.user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('ban', 'suspend', 'warn', 'unsuspend', 'unban')),
  reason TEXT NOT NULL,
  duration_days INTEGER, -- NULL for permanent
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform settings tabell
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Indexes for performance
CREATE INDEX idx_videos_user_id ON public.videos(user_id);
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX idx_videos_is_flagged ON public.videos(is_flagged) WHERE is_flagged = true;
CREATE INDEX idx_video_reports_status ON public.video_reports(status) WHERE status = 'pending';
CREATE INDEX idx_user_actions_user_id ON public.user_actions(user_id);
CREATE INDEX idx_user_actions_is_active ON public.user_actions(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos
CREATE POLICY "Videos are viewable by everyone"
  ON public.videos FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can insert their own videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any video"
  ON public.videos FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any video"
  ON public.videos FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for video_reports
CREATE POLICY "Users can create reports"
  ON public.video_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON public.video_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.video_reports FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update reports"
  ON public.video_reports FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_actions
CREATE POLICY "Admins can view all user actions"
  ON public.user_actions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create user actions"
  ON public.user_actions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update user actions"
  ON public.user_actions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for platform_settings
CREATE POLICY "Everyone can view settings"
  ON public.platform_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update settings"
  ON public.platform_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert settings"
  ON public.platform_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updating updated_at
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value) VALUES
  ('max_video_duration_seconds', '180'::jsonb),
  ('max_file_size_mb', '100'::jsonb),
  ('allowed_file_types', '["video/mp4", "video/quicktime", "video/webm"]'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;