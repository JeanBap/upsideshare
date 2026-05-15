-- Add missing columns to equity_contracts for generate-contract edge function
ALTER TABLE public.equity_contracts 
  ADD COLUMN IF NOT EXISTS share_class text DEFAULT 'common',
  ADD COLUMN IF NOT EXISTS effective_date date;

-- Add unique constraint for upsert on (deal_id, creator_id)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'equity_contracts_deal_creator_unique'
  ) THEN
    ALTER TABLE public.equity_contracts 
      ADD CONSTRAINT equity_contracts_deal_creator_unique UNIQUE (deal_id, creator_id);
  END IF;
END $$;