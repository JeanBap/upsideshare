/* ============================================================
   UpsideShare — TypeScript type definitions
   Maps 1:1 to the Supabase database schema.
   ============================================================ */

// --------------- Enums ---------------

export type UserRole = 'brand' | 'creator';

export type DealStatus = 'draft' | 'active' | 'paused' | 'expired';

export type AttributionMethod = 'coupon' | 'landing_page' | 'both';

export type AttributionType = 'coupon' | 'landing_page';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type ShareClass = 'common' | 'preferred';

export type EquityContractStatus = 'draft' | 'sent' | 'signed';

export type BackOfficeStreamType =
  | 'merchandise'
  | 'fan_chat'
  | 'experiences'
  | 'handwritten_notes'
  | 'handcrafted_items'
  | 'video_shoutouts'
  | 'custom';

// --------------- Social links ---------------

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  bluesky?: string;
  [key: string]: string | undefined;
}

// --------------- Table row types ---------------

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  social_links: SocialLinks;
  stripe_account_id: string | null;
  stripe_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  product_url: string;
  revenue_share_pct: number;
  has_equity: boolean;
  equity_pct: number | null;
  attribution_method: AttributionMethod;
  coupon_prefix: string;
  spots_total: number;
  spots_taken: number;
  category: string;
  status: DealStatus;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  deal_id: string;
  creator_id: string;
  pitch_message: string;
  status: ApplicationStatus;
  coupon_code: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface RevenueEvent {
  id: string;
  deal_id: string;
  creator_id: string;
  stripe_charge_id: string;
  amount_cents: number;
  commission_cents: number;
  platform_fee_cents: number;
  attribution_type: AttributionType;
  verified: boolean;
  event_date: string;
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  deal_id: string;
  creator_id: string;
  period_start: string;
  period_end: string;
  commission_total_cents: number;
  brand_marked_paid: boolean;
  brand_paid_at: string | null;
  creator_confirmed: boolean;
  creator_confirmed_at: string | null;
  created_at: string;
}

export interface EquityContract {
  id: string;
  deal_id: string;
  brand_id: string;
  creator_id: string;
  equity_pct: number;
  revenue_target_cents: number;
  share_class: ShareClass;
  vesting_months: number | null;
  cliff_months: number | null;
  effective_date: string;
  additional_terms: string | null;
  pdf_url: string | null;
  status: EquityContractStatus;
  created_at: string;
  updated_at: string;
}

export interface BackOfficeStream {
  id: string;
  creator_id: string;
  stream_type: BackOfficeStreamType;
  title: string;
  description: string;
  price_cents: number;
  images: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --------------- Supabase Database type ---------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      deals: {
        Row: Deal;
        Insert: Omit<Deal, 'id' | 'spots_taken' | 'created_at' | 'updated_at'> & {
          id?: string;
          spots_taken?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Deal, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      applications: {
        Row: Application;
        Insert: Omit<Application, 'id' | 'status' | 'coupon_code' | 'rejection_reason' | 'created_at' | 'updated_at'> & {
          id?: string;
          status?: ApplicationStatus;
          coupon_code?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Application, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      revenue_events: {
        Row: RevenueEvent;
        Insert: Omit<RevenueEvent, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<RevenueEvent, 'id' | 'created_at'>>;
      };
      ledger_entries: {
        Row: LedgerEntry;
        Insert: Omit<LedgerEntry, 'id' | 'brand_marked_paid' | 'brand_paid_at' | 'creator_confirmed' | 'creator_confirmed_at' | 'created_at'> & {
          id?: string;
          brand_marked_paid?: boolean;
          brand_paid_at?: string | null;
          creator_confirmed?: boolean;
          creator_confirmed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<LedgerEntry, 'id' | 'created_at'>>;
      };
      equity_contracts: {
        Row: EquityContract;
        Insert: Omit<EquityContract, 'id' | 'revenue_target_cents' | 'created_at' | 'updated_at'> & {
          id?: string;
          revenue_target_cents?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<EquityContract, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      back_office_streams: {
        Row: BackOfficeStream;
        Insert: Omit<BackOfficeStream, 'id' | 'is_active' | 'created_at' | 'updated_at'> & {
          id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<BackOfficeStream, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      deal_status: DealStatus;
      attribution_method: AttributionMethod;
      attribution_type: AttributionType;
      application_status: ApplicationStatus;
      share_class: ShareClass;
      equity_contract_status: EquityContractStatus;
      back_office_stream_type: BackOfficeStreamType;
    };
  };
}
