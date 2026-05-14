-- UpsideShare: RLS Policies
-- Agent 04 | 14/05/26
-- Every table has RLS enabled. No exceptions.

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles: anyone can read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles: users update own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles: insert own on signup" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- DEALS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deals: anyone reads active" ON public.deals FOR SELECT USING (status = 'active' OR brand_id = auth.uid());
CREATE POLICY "Deals: brand creates own" ON public.deals FOR INSERT WITH CHECK (brand_id = auth.uid());
CREATE POLICY "Deals: brand updates own" ON public.deals FOR UPDATE USING (brand_id = auth.uid()) WITH CHECK (brand_id = auth.uid());
CREATE POLICY "Deals: brand deletes own draft" ON public.deals FOR DELETE USING (brand_id = auth.uid() AND status = 'draft');

-- APPLICATIONS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apps: creator reads own" ON public.applications FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "Apps: brand reads for own deals" ON public.applications FOR SELECT USING (
  deal_id IN (SELECT id FROM public.deals WHERE brand_id = auth.uid())
);
CREATE POLICY "Apps: creator creates own" ON public.applications FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Apps: brand updates status" ON public.applications FOR UPDATE USING (
  deal_id IN (SELECT id FROM public.deals WHERE brand_id = auth.uid())
);
CREATE POLICY "Apps: creator withdraws own" ON public.applications FOR UPDATE USING (creator_id = auth.uid());

-- ATTRIBUTED SALES
ALTER TABLE public.attributed_sales ENABLE ROW LEVEL SECURITY;
-- No client inserts. Edge functions use service_role key.
CREATE POLICY "Sales: brand reads own" ON public.attributed_sales FOR SELECT USING (brand_id = auth.uid());
CREATE POLICY "Sales: creator reads attributed" ON public.attributed_sales FOR SELECT USING (creator_id = auth.uid());

-- LEDGER ENTRIES
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ledger: brand reads own" ON public.ledger_entries FOR SELECT USING (brand_id = auth.uid());
CREATE POLICY "Ledger: creator reads own" ON public.ledger_entries FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "Ledger: brand marks paid" ON public.ledger_entries FOR UPDATE USING (brand_id = auth.uid())
  WITH CHECK (brand_id = auth.uid());
CREATE POLICY "Ledger: creator confirms" ON public.ledger_entries FOR UPDATE USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- EQUITY CONTRACTS
ALTER TABLE public.equity_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equity: brand reads own" ON public.equity_contracts FOR SELECT USING (brand_id = auth.uid());
CREATE POLICY "Equity: creator reads own" ON public.equity_contracts FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "Equity: brand creates" ON public.equity_contracts FOR INSERT WITH CHECK (brand_id = auth.uid());
CREATE POLICY "Equity: parties update status" ON public.equity_contracts FOR UPDATE
  USING (brand_id = auth.uid() OR creator_id = auth.uid())
  WITH CHECK (brand_id = auth.uid() OR creator_id = auth.uid());

-- WAITLIST SIGNUPS
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;
-- Anon can insert (public signup form)
CREATE POLICY "Waitlist: anon inserts" ON public.waitlist_signups FOR INSERT WITH CHECK (true);
-- Only service role reads (admin dashboard). No client reads.
-- No SELECT policy = no client can read waitlist data.
