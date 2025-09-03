-- Migration Template
-- Create this with: supabase migration new your_migration_name

-- Create table with standard fields
CREATE TABLE public.your_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS (required for security)
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own records" ON public.your_table
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records" ON public.your_table
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records" ON public.your_table
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records" ON public.your_table
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at_your_table
  BEFORE UPDATE ON public.your_table
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for performance
CREATE INDEX idx_your_table_user_id ON public.your_table(user_id);
CREATE INDEX idx_your_table_name ON public.your_table(name);

-- After creating migration:
-- 1. Run: supabase db reset
-- 2. Run: pnpm run db:types