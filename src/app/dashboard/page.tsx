'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tag, DollarSign, Users, Zap, ArrowRight, AlertCircle, Plus, Search } from 'lucide-react';
import { useAuth } from '@/components/Providers';
import { createClient } from '@/lib/supabase';
import { NavBar } from '@/components/ui/NavBar';
import { getGreeting, formatCurrency } from '@/lib/utils';

/* ─── Shared components ─── */

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full bg-purple-600 text-white font-bold"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

function StripeBanner({ role }: { role: string }) {
  return (
    <div className="mx-5 mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">Connect Stripe</p>
        <p className="text-xs text-amber-600">
          {role === 'brand'
            ? 'Link your Stripe account so we can track revenue from your deals.'
            : 'Connect Stripe to receive payouts from your deals.'}
        </p>
      </div>
      <Link href="/onboarding" className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white">
        Connect
      </Link>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-4">
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function SectionHeader({ title, action, actionHref }: { title: string; action?: string; actionHref?: string }) {
  return (
    <div className="flex items-center justify-between px-5 mt-6 mb-3">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h2>
      {action && actionHref && (
        <Link href={actionHref} className="flex items-center gap-1 text-xs font-semibold text-purple-600">
          {action} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function DealRow({ title, subtitle, rightTop, rightBottom, badgeColor }: {
  title: string;
  subtitle: string;
  rightTop: string;
  rightBottom: string;
  badgeColor: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
      <div className={`h-2 w-2 rounded-full shrink-0 ${badgeColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-gray-900">{rightTop}</p>
        <p className="text-[10px] text-gray-400">{rightBottom}</p>
      </div>
    </div>
  );
}

function EmptyCard({ icon, title, body, ctaLabel, ctaHref }: {
  icon: React.ReactNode;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="mx-5 rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
      <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-3">
        {icon}
      </div>
      <p className="text-sm font-bold text-gray-900">{title}</p>
      <p className="mt-1 text-xs text-gray-400">{body}</p>
      <Link href={ctaHref}>
        <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white">
          {ctaLabel} <ArrowRight className="h-4 w-4" />
        </button>
      </Link>
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
      <ArrowRight className="h-4 w-4 text-gray-300" />
    </Link>
  );
}

/* ─── Loading ─── */
function LoadingSkeleton() {
  return (
    <div className="px-5 pt-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-2xl bg-gray-200" />
        <div className="h-20 rounded-2xl bg-gray-200" />
      </div>
      <div className="h-32 rounded-2xl bg-gray-200" />
    </div>
  );
}

/* ─── Creator dashboard ─── */

interface CreatorDeal {
  id: string;
  title: string;
  brand_name: string;
  revenue_share_pct: number;
  earned: number;
  status: string;
}

function CreatorView({ deals, totalEarnings, pendingPayout, displayName, stripeConnected }: {
  deals: CreatorDeal[];
  totalEarnings: number;
  pendingPayout: number;
  displayName: string;
  stripeConnected: boolean;
}) {
  const greeting = getGreeting();
  const activeDeals = deals.filter(d => d.status === 'approved');
  const pendingApps = deals.filter(d => d.status === 'pending');

  return (
    <>
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Avatar name={displayName} />
        <div>
          <p className="text-xs text-gray-400">{greeting}</p>
          <h1 className="text-lg font-bold text-gray-900">{displayName}</h1>
        </div>
      </div>

      {!stripeConnected && <StripeBanner role="creator" />}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-5 mt-4">
        <Stat label="Earnings" value={formatCurrency(totalEarnings)} icon={<DollarSign className="h-3.5 w-3.5" />} />
        <Stat label="Pending" value={formatCurrency(pendingPayout)} icon={<DollarSign className="h-3.5 w-3.5" />} />
      </div>

      {/* Active deals */}
      {activeDeals.length > 0 ? (
        <>
          <SectionHeader title="Active deals" action="Browse more" actionHref="/deals" />
          <div className="mx-5 rounded-2xl bg-white border border-gray-100 overflow-hidden">
            {activeDeals.map(deal => (
              <DealRow
                key={deal.id}
                title={deal.title}
                subtitle={`${deal.brand_name} · ${deal.revenue_share_pct}% share`}
                rightTop={formatCurrency(deal.earned)}
                rightBottom="earned"
                badgeColor="bg-green-500"
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <SectionHeader title="Active deals" />
          <EmptyCard
            icon={<Search className="h-6 w-6" />}
            title="No active deals yet"
            body="Browse deals from brands looking for creators like you."
            ctaLabel="Browse deals"
            ctaHref="/deals"
          />
        </>
      )}

      {/* Pending applications */}
      {pendingApps.length > 0 && (
        <>
          <SectionHeader title="Pending applications" />
          <div className="mx-5 rounded-2xl bg-white border border-gray-100 overflow-hidden">
            {pendingApps.map(deal => (
              <DealRow
                key={deal.id}
                title={deal.title}
                subtitle={deal.brand_name}
                rightTop={`${deal.revenue_share_pct}%`}
                rightBottom="awaiting review"
                badgeColor="bg-amber-400"
              />
            ))}
          </div>
        </>
      )}

      {/* Quick actions */}
      <SectionHeader title="Quick actions" />
      <div className="mx-5 space-y-2 pb-8">
        <QuickAction icon={<Search className="h-4 w-4" />} label="Browse deals" href="/deals" />
        <QuickAction icon={<Zap className="h-4 w-4" />} label="Connect Stripe" href="/onboarding" />
      </div>
    </>
  );
}

/* ─── Brand dashboard ─── */

interface BrandDeal {
  id: string;
  title: string;
  status: string;
  revenue_share_pct: number;
  slug: string;
}

interface LedgerRow {
  id: string;
  creator_name: string;
  period_start: string;
  amount: number;
  paid: boolean;
}

function BrandView({ deals, ledger, totalRevenue, commissionsOwed, creatorCount, displayName, stripeConnected }: {
  deals: BrandDeal[];
  ledger: LedgerRow[];
  totalRevenue: number;
  commissionsOwed: number;
  creatorCount: number;
  displayName: string;
  stripeConnected: boolean;
}) {
  const greeting = getGreeting();
  const activeDeals = deals.filter(d => d.status === 'active');

  return (
    <>
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Avatar name={displayName} />
        <div>
          <p className="text-xs text-gray-400">{greeting}</p>
          <h1 className="text-lg font-bold text-gray-900">{displayName}</h1>
        </div>
      </div>

      {!stripeConnected && <StripeBanner role="brand" />}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-5 mt-4">
        <Stat label="Revenue" value={formatCurrency(totalRevenue)} icon={<DollarSign className="h-3.5 w-3.5" />} />
        <Stat label="Commissions" value={formatCurrency(commissionsOwed)} icon={<DollarSign className="h-3.5 w-3.5" />} />
        <Stat label="Creators" value={String(creatorCount)} icon={<Users className="h-3.5 w-3.5" />} />
        <Stat label="Active deals" value={String(activeDeals.length)} icon={<Tag className="h-3.5 w-3.5" />} />
      </div>

      {/* Deals */}
      {deals.length > 0 ? (
        <>
          <SectionHeader title="Your deals" action="View all" actionHref="/deals" />
          <div className="mx-5 rounded-2xl bg-white border border-gray-100 overflow-hidden">
            {deals.map(deal => (
              <DealRow
                key={deal.id}
                title={deal.title}
                subtitle={`${deal.revenue_share_pct}% rev share`}
                rightTop={deal.status}
                rightBottom=""
                badgeColor={deal.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <SectionHeader title="Your deals" />
          <EmptyCard
            icon={<Plus className="h-6 w-6" />}
            title="Create your first deal"
            body="Set up a revenue share deal and start working with creators."
            ctaLabel="Create deal"
            ctaHref="/deals"
          />
        </>
      )}

      {/* Ledger */}
      {ledger.length > 0 && (
        <>
          <SectionHeader title="Recent payments" />
          <div className="mx-5 rounded-2xl bg-white border border-gray-100 overflow-hidden">
            {ledger.map(entry => (
              <DealRow
                key={entry.id}
                title={entry.creator_name}
                subtitle={new Date(entry.period_start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                rightTop={formatCurrency(entry.amount)}
                rightBottom={entry.paid ? 'paid' : 'pending'}
                badgeColor={entry.paid ? 'bg-green-500' : 'bg-amber-400'}
              />
            ))}
          </div>
        </>
      )}

      {/* Quick actions */}
      <SectionHeader title="Quick actions" />
      <div className="mx-5 space-y-2 pb-8">
        <QuickAction icon={<Plus className="h-4 w-4" />} label="Create a deal" href="/deals" />
        <QuickAction icon={<Zap className="h-4 w-4" />} label="Connect Stripe" href="/onboarding" />
        <QuickAction icon={<Users className="h-4 w-4" />} label="Browse deals" href="/deals" />
      </div>
    </>
  );
}

/* ─── Main page ─── */

export default function DashboardPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dataLoading, setDataLoading] = useState(true);

  const [creatorDeals, setCreatorDeals] = useState<CreatorDeal[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingPayout, setPendingPayout] = useState(0);

  const [brandDeals, setBrandDeals] = useState<BrandDeal[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [commissionsOwed, setCommissionsOwed] = useState(0);
  const [creatorCount, setCreatorCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/signup');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    async function loadCreator() {
      const uid = user!.id;

      const { data: apps } = await supabase
        .from('applications')
        .select('id, status, deal_id')
        .eq('creator_id', uid);

      const dealIds = (apps || []).map((a: any) => a.deal_id);

      let dealsMap: Record<string, any> = {};
      if (dealIds.length > 0) {
        const { data: dealsData } = await supabase
          .from('deals')
          .select('id, title, revenue_share_pct, brand_id')
          .in('id', dealIds);
        (dealsData || []).forEach((d: any) => { dealsMap[d.id] = d; });
      }

      const brandIds = [...new Set(Object.values(dealsMap).map((d: any) => d.brand_id))];
      let brandsMap: Record<string, string> = {};
      if (brandIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', brandIds);
        (profiles || []).forEach((p: any) => { brandsMap[p.id] = p.display_name; });
      }

      const { data: sales } = await supabase
        .from('attributed_sales')
        .select('commission_cents, deal_id')
        .eq('creator_id', uid);

      const revenueByDeal: Record<string, number> = {};
      let earnings = 0;
      (sales || []).forEach((r: any) => {
        earnings += r.commission_cents || 0;
        revenueByDeal[r.deal_id] = (revenueByDeal[r.deal_id] || 0) + (r.commission_cents || 0);
      });

      const { data: pending } = await supabase
        .from('ledger_entries')
        .select('commission_owed_cents')
        .eq('creator_id', uid)
        .eq('brand_marked_paid', true)
        .eq('creator_confirmed', false);

      const payout = (pending || []).reduce((s: number, e: any) => s + (e.commission_owed_cents || 0), 0);

      const mapped: CreatorDeal[] = (apps || []).map((app: any) => {
        const deal = dealsMap[app.deal_id];
        return {
          id: app.deal_id,
          title: deal?.title || 'Unknown deal',
          brand_name: deal ? (brandsMap[deal.brand_id] || 'Brand') : 'Brand',
          revenue_share_pct: deal?.revenue_share_pct || 0,
          earned: revenueByDeal[app.deal_id] || 0,
          status: app.status,
        };
      });

      setCreatorDeals(mapped);
      setTotalEarnings(earnings);
      setPendingPayout(payout);
      setDataLoading(false);
    }

    async function loadBrand() {
      const uid = user!.id;

      const { data: deals } = await supabase
        .from('deals')
        .select('id, title, status, revenue_share_pct, slug')
        .eq('brand_id', uid)
        .order('created_at', { ascending: false })
        .limit(5);

      const dIds = (deals || []).map((d: any) => d.id);
      let rev = 0;
      let comm = 0;
      const creators = new Set<string>();

      if (dIds.length > 0) {
        const { data: salesData } = await supabase
          .from('attributed_sales')
          .select('amount_cents, commission_cents, creator_id')
          .in('deal_id', dIds);
        (salesData || []).forEach((r: any) => {
          rev += r.amount_cents || 0;
          comm += r.commission_cents || 0;
          creators.add(r.creator_id);
        });
      }

      let ledgerRows: LedgerRow[] = [];
      if (dIds.length > 0) {
        const { data: lData } = await supabase
          .from('ledger_entries')
          .select('id, creator_id, period_start, commission_owed_cents, brand_marked_paid')
          .in('deal_id', dIds)
          .order('period_start', { ascending: false })
          .limit(5);

        const cIds = [...new Set((lData || []).map((l: any) => l.creator_id))];
        let namesMap: Record<string, string> = {};
        if (cIds.length > 0) {
          const { data: profs } = await supabase.from('profiles').select('id, display_name').in('id', cIds);
          (profs || []).forEach((p: any) => { namesMap[p.id] = p.display_name; });
        }

        ledgerRows = (lData || []).map((l: any) => ({
          id: l.id,
          creator_name: namesMap[l.creator_id] || 'Creator',
          period_start: l.period_start,
          amount: l.commission_owed_cents,
          paid: l.brand_marked_paid,
        }));
      }

      setBrandDeals((deals || []) as BrandDeal[]);
      setLedger(ledgerRows);
      setTotalRevenue(rev);
      setCommissionsOwed(comm);
      setCreatorCount(creators.size);
      setDataLoading(false);
    }

    if (role === 'creator') {
      loadCreator();
    } else {
      loadBrand();
    }
  }, [user, role]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <main className="flex flex-col min-h-screen bg-gray-50 pb-20">
        <LoadingSkeleton />
      </main>
    );
  }

  const displayName = user?.display_name || 'User';
  const stripeConnected = !!user?.stripe_account_id;

  return (
    <main id="main-content" className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {dataLoading ? (
        <LoadingSkeleton />
      ) : role === 'creator' ? (
        <CreatorView
          deals={creatorDeals}
          totalEarnings={totalEarnings}
          pendingPayout={pendingPayout}
          displayName={displayName}
          stripeConnected={stripeConnected}
        />
      ) : (
        <BrandView
          deals={brandDeals}
          ledger={ledger}
          totalRevenue={totalRevenue}
          commissionsOwed={commissionsOwed}
          creatorCount={creatorCount}
          displayName={displayName}
          stripeConnected={stripeConnected}
        />
      )}

      <NavBar
        role={role}
        activeTab={role === 'creator' ? 'home' : 'revenue'}
        onTabChange={(tab) => {
          if (tab === 'deals') router.push('/deals');
          else if (tab === 'equity') router.push('/equity');
        }}
      />
    </main>
  );
}
