-- ==========================================================================
-- CUTY LIVE VIDEO CHAT - SUPABASE DATABASE INITIALIZATION SCRIPT
-- Copy-paste this entire script into your Supabase SQL Editor and run it.
-- ==========================================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  gender TEXT DEFAULT 'female',
  country TEXT DEFAULT 'Global',
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  coins INTEGER DEFAULT 30 CHECK (coins >= 0),
  is_vip BOOLEAN DEFAULT false,
  online_status TEXT DEFAULT 'offline',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Create Messages (DMs) Table
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their own messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 3. Create Calls Logs Table
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own call records" ON public.calls
  FOR SELECT USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert calls" ON public.calls
  FOR INSERT WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update calls they are in" ON public.calls
  FOR UPDATE USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- 4. Create User Blocks/Safety Table
CREATE TABLE IF NOT EXISTS public.blocks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blocks list" ON public.blocks
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block people" ON public.blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

-- 5. Trigger to handle profile creation on Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, gender, country, avatar_url, coins)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'Cuty User'),
    COALESCE(new.raw_user_meta_data->>'gender', 'female'),
    COALESCE(new.raw_user_meta_data->>'country', 'Global'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    30
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime for key tables
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.calls;
alter publication supabase_realtime add table public.blocks;
