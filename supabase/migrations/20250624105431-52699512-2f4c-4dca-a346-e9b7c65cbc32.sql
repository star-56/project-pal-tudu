
-- Add student-specific columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS major TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT false;

-- Create marketplace items table for college stuff
CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  images TEXT[],
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  location TEXT,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for marketplace items
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

-- Create policies for marketplace items
CREATE POLICY "Anyone can view available marketplace items" ON public.marketplace_items FOR SELECT USING (status = 'available' OR auth.uid() = seller_id OR auth.uid() = buyer_id);
CREATE POLICY "Users can create marketplace items" ON public.marketplace_items FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their items" ON public.marketplace_items FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete their items" ON public.marketplace_items FOR DELETE USING (auth.uid() = seller_id);

-- Add educational project categories
UPDATE public.projects SET category = 'Academic Research' WHERE category = 'Research';
