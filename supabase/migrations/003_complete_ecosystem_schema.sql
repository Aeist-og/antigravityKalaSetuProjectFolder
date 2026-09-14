-- 003_complete_ecosystem_schema.sql
-- Complete Ecosystem Expansion for KalaSetu:
-- 1. Vacation Mode & Business Registration for Artisan Profiles
-- 2. Business Profiles
-- 3. Customer Profiles
-- 4. Favourites
-- 5. Carts & Cart Items
-- 6. Orders & Order Items
-- 7. Account Deletion Requests with 15-Day Recovery

-- 1. Extend artisan_profiles with vacation mode and business registration columns
ALTER TABLE public.artisan_profiles
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS vacation_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vacation_message TEXT,
ADD COLUMN IF NOT EXISTS vacation_return_date TEXT,
ADD COLUMN IF NOT EXISTS msme_number TEXT,
ADD COLUMN IF NOT EXISTS craft_cluster TEXT,
ADD COLUMN IF NOT EXISTS gstin TEXT;

-- 2. Create business_profiles table
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    business_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    business_type TEXT,
    industry TEXT,
    state TEXT,
    district TEXT,
    address TEXT,
    gstin TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create customer_profiles table
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    delivery_address TEXT,
    pincode TEXT,
    state TEXT,
    district TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create favourites table
CREATE TABLE IF NOT EXISTS public.favourites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    artisan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- 5. Create carts and cart_items
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(cart_id, product_id)
);

-- 6. Create orders and order_items
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT DEFAULT 'COD',
    payment_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL DEFAULT 0,
    total_price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create account_deletion_requests
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    scheduled_deletion_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Permissive policies for dev / demo
DROP POLICY IF EXISTS "business_profiles_policy" ON public.business_profiles;
CREATE POLICY "business_profiles_policy" ON public.business_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "customer_profiles_policy" ON public.customer_profiles;
CREATE POLICY "customer_profiles_policy" ON public.customer_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "favourites_policy" ON public.favourites;
CREATE POLICY "favourites_policy" ON public.favourites FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "carts_policy" ON public.carts;
CREATE POLICY "carts_policy" ON public.carts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cart_items_policy" ON public.cart_items;
CREATE POLICY "cart_items_policy" ON public.cart_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "orders_policy" ON public.orders;
CREATE POLICY "orders_policy" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_policy" ON public.order_items;
CREATE POLICY "order_items_policy" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "account_deletion_requests_policy" ON public.account_deletion_requests;
CREATE POLICY "account_deletion_requests_policy" ON public.account_deletion_requests FOR ALL USING (true) WITH CHECK (true);
