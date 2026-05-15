'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { NavBar } from '@/components/ui/NavBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/components/Providers';
import { createClient } from '@/lib/supabase';
import { getGreeting, formatCurrency } from '@/lib/utils';

function DashboardSkeleton() {
  return (
    <div className="space-y-6 px-5 pt-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

/* ─── Creator view ─── */

interface CreatorDeal {
  id: string;
  title: string;
  brand_name: string;
  revenue_share_pct: number;
  earned: number;
  status: string;
}

function CreatorDashboard({ deals, totalEarnings, pendingPayout }: {
  deals: CreatorDeal[];
  totalEarnings: number;
  pendingPayout: number;
}) {
  const greeting = getGreeting();
  const activeCount = deals.filter(d => d.status === 'approved').length;

  return (
    <>
      <header className="px-5 pt-6 pb-2">
        <p className="text-sm text-gray-400">{greeting}</p>
        <h1 className="text-xl font-bold text-gray-900">Your dashboard</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 px-5">
        <StatCard label="Total earnings" value={formatCurrency(totalEarnings)} />
        <StatCard label="Pending payout" value={formatCurrency(pendingPayout)} />
        <StatCard label="Active deals" value={String(activeCount)} />
        <StatCard label="Back office" value="Manage" />
      </div>

      <section className="mx-5 mt-6 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Your deals</h2>
          <Link href="/deals" className="text-xs text-purple-600 font-medium">Browse deals</Link>
        </div>
        <div className="mt-3 space-y-3">
          {deals.length === 0 ? (
            <Card variant="surface" className="py-8 text-center">
              <p className="text-sm text-gray-500">No active deals yet.</p>
              <Link href="/deals">
                <Button variant="primary" size="sm" className="mt-3">Browse deals</Button>
              </Link>
            </Card>
          ) : (
            deals.map((deal) => (
              <Card key={deal.id} variant="surface" className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{deal.title}</p>
                  <p className="text-xs text-gray-400">{deal.brand_name} &middot; {deal.revenue_share_pct}% rev share</p>
                </div>
                <div className="ml-3 text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(deal.earned)}</p>
                  <Badge variant={deal.status === 'approved' ? 'approved' : 'pending'}>
                    {deal.status === 'approved' ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </>
  );
}

/* ─── Brand view ─── */

interface BrandDeal {
  id: string;
  title: string;
  spots_taken: number;
  spots_total: number;
  status: string;
  revenue_share_pct: number;
}

interface LedgerRow {
  id: string;
  creator_name: string;
  period_start: string;
  amount: number;
  paid: boolean;
}

function BrandDashboard({ deals, ledger, totalRevenue, commissionsOwed, creatorCount }: {
  deals: BrandDeal[];
  ledger: LedgerRow[];
  totalRevenue: number;
  commissionsOwed: number;
  creatorCount: number;
}) {
  const greeting = getGreeting();
  const activeDeals = deals.filter(d => d.status === 'active').length;

  return (
    <>
      <header className="px-5 pt-6 pb-2">
        <p className="text-sm text-gray-400">{greeting}</p>
        <h1 className="text-xl font-bold text-gray-900">Brand dashboard</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 px-5">
        <StatCard label="Revenue tracked" value={formatCurrency(totalRevenue)} />
        <StatCard label="Commissions owed" value={formatCurrency(commissionsOwed)} />
        <StatCard label="Active creators" value={String(creatorCount)} />
        <StatCard label="Active deals" value={String(activeDeals)} />
      </div>

      <section className="mx-5 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Your deals</h2>
          <Link href="/deals" className="text-xs text-purple-600 font-medium">View all</Link>
        </div>
        <div className="mt-3 space-y-3">
          {deals.length === 0 ? (
            <Card variant="surface" className="py-8 text-center">
              <p className="text-sm text-gray-500">No deals created yet.</p>
            </Card>
          ) : (
            deals.map((deal) => (
              <Card key={deal.id} variant="surface" className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{deal.title}</p>
                  <p className="text-xs text-gray-400">{deal.spots_taken}/{deal.spots_total} spots &middot; {deal.revenue_share_pct}%</p>
                </div>
                <Badge variant={deal.status === 'active' ? 'approved' : 'pending'}>{deal.status}</Badge>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="mx-5 mt-6 pb-6">
        <h2 className="text-base font-semibold text-gray-900">Recent ledger</h2>
        <div className="mt-3 space-y-3">
          {ledger.length === 0 ? (
            <Card variant="surface" className="py-6 text-center">
              <p className="text-sm text-gray-500">No ledger entries yet.</p>
            </Card>
          ) : (
            ledger.map((entry) => (
              <Card key={entry.id} variant="surface" className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{entry.creator_name}</p>
                  <p className="text-xs text-gray-400">{new Date(entry.period_start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="ml-3 flex items-center gap-2 shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(entry.amount)}</p>
                  <Badge variant={entry.paid ? 'approved' : 'pending'}>{entry.paid ? 'Paid' : 'Pending'}</Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </>
  );
}

/* ─── Main page ─── */

export default function DashboardPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dataLoading, setDataLoading] = useState(true);

  // Creator state
  const [creatorDeals, setCreatorDeals] = useState<CreatorDeal[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingPayout, setPendingPayout] = useState(0);

  // Brand state
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

      // Applications
      const { data: apps } = await supabase
        .from('applications')
        .select('id, status, deal_id')
        .eq('creator_id', uid);

      const dealIds = (apps || []).map(a => a.deal_id);

      // Deals for those applications
      let dealsMap: Record<string, { title: string; revenue_share_pct: number; brand_id: string }> = {};
      if (dealIds.length > 0) {
        const { data: dealsData } = await supabase
          .from('deals')
          .select('id, title, revenue_share_pct, brand_id')
          .in('id', dealIds);
        (dealsData || []).forEach(d => { dealsMap[d.id] = d; });
      }

      // Brand names
      const brandIds = [...new Set(Object.values(dealsMap).map(d => d.brand_id))];
      let brandsMap: Record<string, string> = {};
      if (brandIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', brandIds);
        (profiles || []).forEach(p => { brandsMap[p.id] = p.display_name; });
      }

      // Revenue
      const { data: revenue } = await supabase
        .from('revenue_events')
        .select('commission_cents, deal_id')
        .eq('creator_id', uid);

      const revenueByDeal: Record<string, number> = {};
      let earnings = 0;
      (revenue || []).forEach(r => {
        earnings += r.commission_cents || 0;
        revenueByDeal[r.deal_id] = (revenueByDeal[r.deal_id] || 0) + (r.commission_cents || 0);
      });

      // Pending ledger
      const { data: pending } = await supabase
        .from('ledger_entries')
        .select('commission_total_cents')
        .eq('creator_id', uid)
        .eq('brand_marked_paid', true)
        .eq('creator_confirmed', false);

      const payout = (pending || []).reduce((s, e) => s + (e.commission_total_cents || 0), 0);

      const mapped: CreatorDeal[] = (apps || []).map(app => {
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
        .select('id, title, spots_taken, spots_total, status, revenue_share_pct')
        .eq('brand_id', uid)
        .order('created_at', { ascending: false })
        .limit(5);

      const dIds = (deals || []).map(d => d.id);
      let rev = 0;
      let comm = 0;
      const creators = new Set<string>();

      if (dIds.length > 0) {
        const { data: revData } = await supabase
          .from('revenue_events')
          .select('amount_cents, commission_cents, creator_id')
          .in('deal_id', dIds);
        (revData || []).forEach(r => {
          rev += r.amount_cents || 0;
          comm += r.commission_cents || 0;
          creators.add(r.creator_id);
        });
      }

      // Ledger
      let ledgerRows: LedgerRow[] = [];
      if (dIds.length > 0) {
        const { data: lData } = await supabase
          .from('ledger_entries')
          .select('id, creator_id, period_start, commission_total_cents, brand_marked_paid')
          .in('deal_id', dIds)
          .order('period_start', { ascending: false })
          .limit(5);

        const creatorIds = [...new Set((lData || []).map(l => l.creator_id))];
        let namesMap: Record<string, string> = {};
        if (creatorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', creatorIds);
          (profiles || []).forEach(p => { namesMap[p.id] = p.display_name; });
        }

        ledgerRows = (lData || []).map(l => ({
          id: l.id,
          creator_name: namesMap[l.creator_id] || 'Creator',
          period_start: l.period_start,
          amount: l.commission_total_cents,
          paid: l.brand_marked_paid,
        }));
      }

      setBrandDeals(deals || []);
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
        <DashboardSkeleton />
      </main>
    );
  }

  return (
    <main id="main-content" className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {dataLoading ? (
        <DashboardSkeleton />
      ) : role === 'creator' ? (
        <CreatorDashboard deals={creatorDeals} totalEarnings={totalEarnings} pendingPayout={pendingPayout} />
      ) : (
        <BrandDashboard deals={brandDeals} ledger={ledger} totalRevenue={totalRevenue} commissionsOwed={commissionsOwed} creatorCount={creatorCount} />
      )}

      <NavBar
        role={role}
        activeTab={role === 'creator' ? 'home' : 'revenue'}
        onTabChange={(tab) => {
          if (tab === 'deals') router.push('/deals');
          else if (tab === 'home' || tab === 'revenue') router.push('/dashboard');
          else if (tab === 'equity') router.push('/equity');
        }}
      />
    </main>
  );
}
