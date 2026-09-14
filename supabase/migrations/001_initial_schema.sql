-- KalaSetu Core Relational Schema & Row Level Security
-- SIH 2026 Problem Statement SIH26090

-- 1. Profiles Table (Global user identities)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'artisan' CHECK (role IN ('artisan', 'business', 'customer')),
  language_preference TEXT NOT NULL DEFAULT 'hi' CHECK (language_preference IN ('en', 'hi')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Artisan Profiles Table (Specific craft metadata)
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

-- 5. Product Pricing Table (Transparent cost breakdown)
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

-- 6. AI Generation Records (Auditability & provider switching)
CREATE TABLE IF NOT EXISTS public.ai_generation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  operation TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_reference TEXT,
  output_reference TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'unavailable')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_records ENABLE ROW LEVEL SECURITY;

-- 8. Row Level Security Policies

-- Profiles: Users can view their own profile; public can view basic artisan identity
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Artisan Profiles: Artisans manage their own craft profile
CREATE POLICY "Artisans can view own craft profile" ON public.artisan_profiles
  FOR SELECT USING (auth.uid() = artisan_id);

CREATE POLICY "Artisans can insert own craft profile" ON public.artisan_profiles
  FOR INSERT WITH CHECK (auth.uid() = artisan_id);

CREATE POLICY "Artisans can update own craft profile" ON public.artisan_profiles
  FOR UPDATE USING (auth.uid() = artisan_id);

-- Products: Artisans view all their own products; any user can view published products
CREATE POLICY "Artisans can view own products or published" ON public.products
  FOR SELECT USING (auth.uid() = artisan_id OR status = 'published');

CREATE POLICY "Artisans can insert own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = artisan_id);

CREATE POLICY "Artisans can update own products" ON public.products
  FOR UPDATE USING (auth.uid() = artisan_id);

CREATE POLICY "Artisans can delete own products" ON public.products
  FOR DELETE USING (auth.uid() = artisan_id);

-- Product Images: Linked to product ownership
CREATE POLICY "View images for accessible products" ON public.product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_images.product_id
      AND (products.artisan_id = auth.uid() OR products.status = 'published')
    )
  );

CREATE POLICY "Artisans can manage images for own products" ON public.product_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_images.product_id
      AND products.artisan_id = auth.uid()
    )
  );

-- Product Pricing: Linked to product ownership
CREATE POLICY "Artisans view own product pricing" ON public.product_pricing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_pricing.product_id
      AND products.artisan_id = auth.uid()
    )
  );

CREATE POLICY "Artisans manage own product pricing" ON public.product_pricing
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_pricing.product_id
      AND products.artisan_id = auth.uid()
    )
  );

-- AI Records: Artisans can view their own AI operation audit trail
CREATE POLICY "Artisans view own AI records" ON public.ai_generation_records
  FOR SELECT USING (auth.uid() = artisan_id);

CREATE POLICY "Artisans insert own AI records" ON public.ai_generation_records
  FOR INSERT WITH CHECK (auth.uid() = artisan_id);
