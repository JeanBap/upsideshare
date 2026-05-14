-- UpsideShare: Initial Schema Migration (FORWARD)
-- Agent 04 | 14/05/26

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgsodium";

-- 1. PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('brand', 'creator')),
  display_name text NOT NULL,
  email text NOT NULL UNIQUE,
  company_name text,
  stripe_account_id text,
  stripe_connected_at timestamptz,
  stripe_read_key_encrypted text,
  avatar_url text,
  bio text,
  website_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- 2. DEALS
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  product_url text,
  revenue_share_pct numeric(5,2) NOT NULL,
  has_equity_component boolean NOT NULL DEFAULT false,
  equity_pct numeric(5,2),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','completed','expired')),
  starts_at timestamptz,
  expires_at timestamptz,
  coupon_prefix text,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_deals_brand_id ON public.deals(brand_id);
CREATE INDEX idx_deals_status ON public.deals(status);

-- 3. APPLICATIONS
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','withdrawn')),
  creator_message text,
  brand_message text,
  coupon_code text,
  creator_slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(deal_id, creator_id)
);
CREATE INDEX idx_applications_deal_id ON public.applications(deal_id);
CREATE INDEX idx_applications_creator_id ON public.applications(creator_id);
CREATE UNIQUE INDEX idx_applications_coupon_code ON public.applications(coupon_code) WHERE coupon_code IS NOT NULL;

-- 4. ATTRIBUTED SALES
CREATE TABLE public.attributed_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.profiles(id),
  brand_id uuid NOT NULL REFERENCES public.profiles(id),
  stripe_charge_id text NOT NULL UNIQUE,
  amount_cents bigint NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  attribution_method text NOT NULL CHECK (attribution_method IN ('coupon','landing_page','manual')),
  attribution_ref text NOT NULL,
  commission_cents bigint NOT NULL,
  platform_fee_cents bigint NOT NULL,
  stripe_created_at timestamptz NOT NULL,
  synced_at timestamptz NOT NULL DEFAULT now(),
  verified boolean NOT NULL DEFAULT true
);
CREATE INDEX idx_attributed_sales_deal_id ON public.attributed_sales(deal_id);
CREATE INDEX idx_attributed_sales_creator_id ON public.attributed_sales(creator_id);
CREATE INDEX idx_attributed_sales_brand_id ON public.attributed_sales(brand_id);
CREATE INDEX idx_attributed_sales_stripe_created ON public.attributed_sales(stripe_created_at);

-- 5. LEDGER ENTRIES
CREATE TABLE public.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.profiles(id),
  brand_id uuid NOT NULL REFERENCES public.profiles(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_sales_cents bigint NOT NULL DEFAULT 0,
  commission_owed_cents bigint NOT NULL DEFAULT 0,
  platform_fee_cents bigint NOT NULL DEFAULT 0,
  brand_marked_paid boolean NOT NULL DEFAULT false,
  creator_confirmed boolean NOT NULL DEFAULT false,
  paid_at timestamptz,
  invoice_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ledger_brand_period ON public.ledger_entries(brand_id, period_start);
CREATE INDEX idx_ledger_creator_period ON public.ledger_entries(creator_id, period_start);

-- 6. EQUITY CONTRACTS
CREATE TABLE public.equity_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES public.profiles(id),
  creator_id uuid NOT NULL REFERENCES public.profiles(id),
  template_type text NOT NULL DEFAULT 'simple_grant',
  company_legal_name text NOT NULL,
  creator_legal_name text NOT NULL,
  equity_pct numeric(5,2) NOT NULL,
  revenue_target_cents bigint DEFAULT 0,
  vesting_months integer,
  cliff_months integer,
  conditions text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','signed','voided')),
  pdf_generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_equity_brand ON public.equity_contracts(brand_id);
CREATE INDEX idx_equity_creator ON public.equity_contracts(creator_id);

-- 7. WAITLIST SIGNUPS
CREATE TABLE public.waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  interest text NOT NULL CHECK (interest IN ('merchandise','experiences','handcrafted','notes','chat','general')),
  source_page text,
  resend_contact_id text,
  subscribed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email, interest)
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.equity_contracts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), COALESCE(NEW.raw_user_meta_data->>'role', 'creator'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
