-- ==========================================================================
-- CUTY LIVE VIDEO CHAT - SUPABASE DATABASE INITIALIZATION SCRIPT (RESIZED & PREFIXED)
-- Copy-paste this entire script into your Supabase SQL Editor and run it.
-- ==========================================================================

-- 1. Create Profiles Table (Prefix: cuty_)
CREATE TABLE IF NOT EXISTS public.cuty_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  gender TEXT DEFAULT 'female',
  country TEXT DEFAULT 'Global',
  avatar_url TEXT DEFAULT '/Profile Images/imgi_14_thumb_32f22d27a0.jpg',
  coins INTEGER DEFAULT 30 CHECK (coins >= 0),
  is_vip BOOLEAN DEFAULT false,
  online_status TEXT DEFAULT 'offline',
  age INTEGER DEFAULT 18 CHECK (age >= 18),
  rules_accepted BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.cuty_profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public cuty profiles are viewable by everyone" ON public.cuty_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own cuty profile" ON public.cuty_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Create Messages (DMs) Table
CREATE TABLE IF NOT EXISTS public.cuty_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.cuty_profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.cuty_profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cuty_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cuty messages" ON public.cuty_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their own cuty messages" ON public.cuty_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 3. Create Calls Logs Table
CREATE TABLE IF NOT EXISTS public.cuty_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL REFERENCES public.cuty_profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.cuty_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cuty_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cuty call records" ON public.cuty_calls
  FOR SELECT USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert cuty calls" ON public.cuty_calls
  FOR INSERT WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update cuty calls they are in" ON public.cuty_calls
  FOR UPDATE USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- 4. Create User Blocks/Safety Table
CREATE TABLE IF NOT EXISTS public.cuty_blocks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES public.cuty_profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.cuty_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE public.cuty_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cuty blocks list" ON public.cuty_blocks
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block people in cuty" ON public.cuty_blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

-- 5. Trigger to handle profile creation on Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_cuty_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.cuty_profiles (id, username, gender, country, avatar_url, coins, age, rules_accepted)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'Cuty User'),
    COALESCE(new.raw_user_meta_data->>'gender', 'female'),
    COALESCE(new.raw_user_meta_data->>'country', 'Global'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '/Profile Images/imgi_14_thumb_32f22d27a0.jpg'),
    30,
    COALESCE((new.raw_user_meta_data->>'age')::INTEGER, 18),
    COALESCE((new.raw_user_meta_data->>'rules_accepted')::BOOLEAN, true)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_cuty_user_created ON auth.users;
CREATE TRIGGER on_auth_cuty_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_cuty_user();

-- Enable Realtime for key tables
alter publication supabase_realtime add table public.cuty_profiles;
alter publication supabase_realtime add table public.cuty_messages;
alter publication supabase_realtime add table public.cuty_calls;
alter publication supabase_realtime add table public.cuty_blocks;
