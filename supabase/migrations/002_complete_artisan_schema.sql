-- =========================================================
-- KalaSetu Master Schema: Complete Artisan & Marketplace Engine
-- SIH 2026 Problem Statement SIH26090
-- =========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'artisan' CHECK (role IN ('artisan', 'business', 'customer', 'admin')),
  language_preference TEXT NOT NULL DEFAULT 'hi' CHECK (language_preference IN ('en', 'hi')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Artisan Profiles Table
CREATE TABLE IF NOT EXISTS public.artisan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  craft_type TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT,
  experience_years TEXT,
  production_capacity TEXT,
  bio TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  title_en TEXT,
  title_hi TEXT,
  craft_type TEXT,
  category TEXT,
  material TEXT,
  technique TEXT,
  origin_state TEXT,
  origin_district TEXT,
  production_time_days INT NOT NULL DEFAULT 1,
  description_en TEXT,
  description_hi TEXT,
  dimensions TEXT,
  quantity_available INT NOT NULL DEFAULT 1,
  customization_available BOOLEAN NOT NULL DEFAULT false,
  care_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  processed_url TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Product Pricing Table
CREATE TABLE IF NOT EXISTS public.product_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  material_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  labour_cost_per_day NUMERIC(10, 2) NOT NULL DEFAULT 0,
  labour_days NUMERIC(5, 1) NOT NULL DEFAULT 1,
  total_labour_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  packaging_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  additional_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 20,
  total_calculated_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  suggested_retail_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  suggested_bulk_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  final_listing_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  calculation_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. KalaChannel Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  craft_type TEXT,
  linked_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. KalaChannel Post Likes Table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 8. KalaChannel Post Comments Table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Activities & In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  message TEXT NOT NULL,
  message_hi TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. B2B Opportunities Table
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  title TEXT NOT NULL,
  craft_type TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 10,
  budget NUMERIC(10, 2),
  deadline TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'fulfilled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. B2B Opportunity Responses Table
CREATE TABLE IF NOT EXISTS public.opportunity_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  message TEXT NOT NULL,
  quote_amount NUMERIC(10, 2),
  linked_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Physical Exhibition QR & Digital Showcases Table
CREATE TABLE IF NOT EXISTS public.exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exhibition_name TEXT NOT NULL,
  collection_title TEXT NOT NULL,
  description TEXT,
  promo_message TEXT,
  share_slug TEXT UNIQUE,
  stall_number TEXT,
  qr_code_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- Enable Row Level Security (RLS) on all tables
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibitions ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- Row Level Security Policies
-- =========================================================

-- Profiles: Authenticated users can view profiles, insert their own, update their own
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Artisan Profiles: Anyone can view, artisan manages own
CREATE POLICY "Public read artisan profiles" ON public.artisan_profiles FOR SELECT USING (true);
CREATE POLICY "Artisans insert own craft profile" ON public.artisan_profiles FOR INSERT WITH CHECK (auth.uid() = artisan_id);
CREATE POLICY "Artisans update own craft profile" ON public.artisan_profiles FOR UPDATE USING (auth.uid() = artisan_id);

-- Products: Artisans manage own; public can view published
CREATE POLICY "View own or published products" ON public.products FOR SELECT USING (auth.uid() = artisan_id OR status = 'published');
CREATE POLICY "Artisans insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = artisan_id);
CREATE POLICY "Artisans update own products" ON public.products FOR UPDATE USING (auth.uid() = artisan_id);
CREATE POLICY "Artisans delete own products" ON public.products FOR DELETE USING (auth.uid() = artisan_id);

-- Product Images
CREATE POLICY "View product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Artisans manage own product images" ON public.product_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.products WHERE products.id = product_images.product_id AND products.artisan_id = auth.uid())
);

-- Product Pricing
CREATE POLICY "View product pricing" ON public.product_pricing FOR SELECT USING (true);
CREATE POLICY "Artisans manage own product pricing" ON public.product_pricing FOR ALL USING (
  EXISTS (SELECT 1 FROM public.products WHERE products.id = product_pricing.product_id AND products.artisan_id = auth.uid())
);

-- Posts
CREATE POLICY "Public read posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Artisans insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = artisan_id);
CREATE POLICY "Artisans update own posts" ON public.posts FOR UPDATE USING (auth.uid() = artisan_id);
CREATE POLICY "Artisans delete own posts" ON public.posts FOR DELETE USING (auth.uid() = artisan_id);

-- Post Likes
CREATE POLICY "Public read post likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users manage own post likes" ON public.post_likes FOR ALL USING (auth.uid() = user_id);

-- Post Comments
CREATE POLICY "Public read post comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users insert comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own comments" ON public.post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- Activities
CREATE POLICY "Users view own activities" ON public.activities FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "System/users insert activities" ON public.activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own activities" ON public.activities FOR UPDATE USING (auth.uid() = recipient_id);

-- Opportunities
CREATE POLICY "Public read opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Business insert opportunities" ON public.opportunities FOR INSERT WITH CHECK (auth.uid() = business_id);
CREATE POLICY "Business update own opportunities" ON public.opportunities FOR UPDATE USING (auth.uid() = business_id);

-- Opportunity Responses
CREATE POLICY "View opportunity responses" ON public.opportunity_responses FOR SELECT USING (
  auth.uid() = artisan_id OR EXISTS (SELECT 1 FROM public.opportunities WHERE opportunities.id = opportunity_responses.opportunity_id AND opportunities.business_id = auth.uid())
);
CREATE POLICY "Artisan insert opportunity responses" ON public.opportunity_responses FOR INSERT WITH CHECK (auth.uid() = artisan_id);
CREATE POLICY "Participants update responses" ON public.opportunity_responses FOR UPDATE USING (
  auth.uid() = artisan_id OR EXISTS (SELECT 1 FROM public.opportunities WHERE opportunities.id = opportunity_responses.opportunity_id AND opportunities.business_id = auth.uid())
);

-- Exhibitions
CREATE POLICY "Public read exhibitions" ON public.exhibitions FOR SELECT USING (true);
CREATE POLICY "Artisans manage own exhibitions" ON public.exhibitions FOR ALL USING (auth.uid() = artisan_id);

-- =========================================================
-- Enable Supabase Realtime for interactive tables
-- =========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunity_responses;
