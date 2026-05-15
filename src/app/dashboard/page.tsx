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
import type { Deal, Application, LedgerEntry, RevenueEvent } from '@/lib/types';

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

interface CreatorData {
  totalEarnings: number;
  pendingPayout: number;
  activeDeals: number;
  deals: Array<{
    id: string;
    title: string;
    brand_name: string;
    revenue_share_pct: number;
    earned: number;
    status: string;
  }>;
}

function CreatorDashboard({ data }: { data: CreatorData }) {
  const greeting = getGreeting();

  return (
    <>
      <header className="px-5 pt-6 pb-2">
        <p className="text-sm text-gray-400">{greeting}</p>
        <h1 className="text-xl font-bold text-gray-900">Your dashboard</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 px-5">
        <StatCard
          label="Total earnings"
          value={formatCurrency(data.totalEarnings)}
        />
        <StatCard
          label="Pending payout"
          value={formatCurrency(data.pendingPayout)}
        />
        <StatCard
          label="Active deals"
          value={String(data.activeDeals)}
        />
        <StatCard
          label="Back office"
          value="Manage"
        />
      </div>

      <section className="mx-5 mt-6 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Your deals</h2>
          <Link href="/deals" className="text-xs text-purple-600 font-medium">Browse deals</Link>
        </div>
        <div className="mt-3 space-y-3">
          {data.deals.length === 0 ? (
            <Card variant="surface" className="py-8 text-center">
              <p className="text-sm text-gray-500">No active deals yet.</p>
              <Link href="/deals">
                <Button variant="primary" size="sm" className="mt-3">
                  Browse deals
                </Button>
              </Link>
            </Card>
          ) : (
            data.deals.map((deal) => (
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

interface BrandData {
  totalRevenue: number;
  commissionsOwed: number;
  activeCreators: number;
  activeDeals: number;
  deals: Array<{
    id: string;
    title: string;
    spots_taken: number;
    spots_total: number;
    status: string;
    revenue_share_pct: number;
  }>;
  ledger: Array<{
    id: string;
    creator_name: string;
    period_start: string;
    commission_total_cents: number;
    brand_marked_paid: boolean;
  }>;
}

function BrandDashboard({ data }: { data: BrandData }) {
  const greeting = getGreeting();

  return (
    <>
      <header className="px-5 pt-6 pb-2">
        <p className="text-sm text-gray-400">{greeting}</p>
        <h1 className="text-xl font-bold text-gray-900">Brand dashboard</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 px-5">
        <StatCard
          label="Revenue tracked"
          value={formatCurrency(data.totalRevenue)}
        />
        <StatCard
          label="Commissions owed"
          value={formatCurrency(data.commissionsOwed)}
        />
        <StatCard
          label="Active creators"
          value={String(data.activeCreators)}
        />
        <StatCard
          label="Active deals"
          value={String(data.activeDeals)}
        />
      </div>

      {/* Deals */}
      <section className="mx-5 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Your deals</h2>
          <Link href="/deals" className="text-xs text-purple-600 font-medium">View all</Link>
        </div>
        <div className="mt-3 space-y-3">
          {data.deals.length === 0 ? (
            <Card variant="surface" className="py-8 text-center">
              <p className="text-sm text-gray-500">No deals created yet.</p>
              <p className="text-xs text-gray-400 mt-1">Create your first deal to start working with creators.</p>
            </Card>
          ) : (
            data.deals.map((deal) => (
              <Card key={deal.id} variant="surface" className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{deal.title}</p>
                  <p className="text-xs text-gray-400">{deal.spots_taken}/{deal.spots_total} spots &middot; {deal.revenue_share_pct}%</p>
                </div>
                <Badge variant={deal.status === 'active' ? 'approved' : 'pending'}>
                  {deal.status}
                </Badge>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Ledger */}
      <section className="mx-5 mt-6 pb-6">
        <h2 className="text-base font-semibold text-gray-900">Recent ledger</h2>
        <div className="mt-3 space-y-3">
          {data.ledger.length === 0 ? (
            <Card variant="surface" className="py-6 text-center">
              <p className="text-sm text-gray-500">No ledger entries yet.</p>
            </Card>
          ) : (
            data.ledger.map((entry) => (
              <Card key={entry.id} variant="surface" className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{entry.creator_name}</p>
                  <p className="text-xs text-gray-400">{new Date(entry.period_start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="ml-3 flex items-center gap-2 shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(entry.commission_total_cents)}</p>
                  {entry.brand_marked_paid ? (
                    <Badge variant="approved">Paid</Badge>
                  ) : (
                    <Badge variant="pending">Pending</Badge>
                  )}
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
  const [creatorData, setCreatorData] = useState<CreatorData | null>(null);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Redirect to signup if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/signup');
    }
  }, [authLoading, user, router]);

  // Fetch data based on role
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function fetchCreatorData() {
      const userId = user!.id;

      // Get approved applications with deal info
      const { data: apps } = await supabase
        .from('applications')
        .select('id, status, deal_id, deals(id, title, revenue_share_pct, brand_id, profiles!deals_brand_id_fkey(display_name))')
        .eq('creator_id', userId)
        .in('status', ['approved', 'pending']);

      // Get revenue events for this creator
      const { data: revenue } = await supabase
        .from('revenue_events')
        .select('amount_cents, commission_cents, verified')
        .eq('creator_id', userId);

      // Get pending ledger entries
      const { data: ledger } = await supabase
        .from('ledger_entries')
        .select('commission_total_cents, creator_confirmed')
        .eq('creator_id', userId)
        .eq('brand_marked_paid', true)
        .eq('creator_confirmed', false);

      const totalEarnings = (revenue || []).reduce((sum, r) => sum + (r.commission_cents || 0), 0);
      const pendingPayout = (ledger || []).reduce((sum, l) => sum + (l.commission_total_cents || 0), 0);
      const activeApps = (apps || []).filter(a => a.status === 'approved');

      const deals = (apps || []).map(app => {
        const deal = app.deals as any;
        const brandProfile = deal?.profiles as any;
        const dealRevenue = (revenue || [])
          .filter((r: any) => r.deal_id === app.deal_id)
          .reduce((sum: number, r: any) => sum + (r.commission_cents || 0), 0);

        return {
          id: app.deal_id,
          title: deal?.title || 'Unknown deal',
          brand_name: brandProfile?.display_name || 'Unknown brand',
          revenue_share_pct: deal?.revenue_share_pct || 0,
          earned: dealRevenue,
          status: app.status,
        };
      });

      setCreatorData({
        totalEarnings,
        pendingPayout,
        activeDeals: activeApps.length,
        deals,
      });
      setDataLoading(false);
    }

    async function fetchBrandData() {
      const userId = user!.id;

      // Get brand's deals
      const { data: deals } = await supabase
        .from('deals')
        .select('id, title, spots_taken, spots_total, status, revenue_share_pct')
        .eq('brand_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get revenue events for brand's deals
      const dealIds = (deals || []).map(d => d.id);
      let totalRevenue = 0;
      let commissionsOwed = 0;
      let creatorIds = new Set<string>();

      if (dealIds.length > 0) {
        const { data: revenue } = await supabase
          .from('revenue_events')
          .select('amount_cents, commission_cents, creator_id')
          .in('deal_id', dealIds);

        totalRevenue = (revenue || []).reduce((sum, r) => sum + (r.amount_cents || 0), 0);
        commissionsOwed = (revenue || []).reduce((sum, r) => sum + (r.commission_cents || 0), 0);
        (revenue || []).forEach(r => creatorIds.add(r.creator_id));
      }

      // Get recent ledger entries
      const { data: ledgerRaw } = await supabase
        .from('ledger_entries')
        .select('id, creator_id, period_start, commission_total_cents, brand_marked_paid, profiles!ledger_entries_creator_id_fkey(display_name)')
        .in('deal_id', dealIds.length > 0 ? dealIds : ['none'])
        .order('period_start', { ascending: false })
        .limit(5);

      const ledger = (ledgerRaw || []).map(entry => {
        const profile = entry.profiles as any;
        return {
          id: entry.id,
          creator_name: profile?.display_name || 'Creator',
          period_start: entry.period_start,
          commission_total_cents: entry.commission_total_cents,
          brand_marked_paid: entry.brand_marked_paid,
        };
      });

      setBrandData({
        totalRevenue,
        commissionsOwed,
        activeCreators: creatorIds.size,
        activeDeals: (deals || []).filter(d => d.status === 'active').length,
        deals: deals || [],
        ledger,
      });
      setDataLoading(false);
    }

    if (role === 'creator') {
      fetchCreatorData();
    } else {
      fetchBrandData();
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
        <CreatorDashboard data={creatorData || { totalEarnings: 0, pendingPayout: 0, activeDeals: 0, deals: [] }} />
      ) : (
        <BrandDashboard data={brandData || { totalRevenue: 0, commissionsOwed: 0, activeCreators: 0, activeDeals: 0, deals: [], ledger: [] }} />
      )}

      <NavBar
        role={role}
        activeTab={role === 'creator' ? 'home' : 'revenue'}
        onTabChange={(tab) => {
          if (tab === 'deals') router.push('/deals');
          else if (tab === 'home' || tab === 'revenue') router.push('/dashboard');
          else if (tab === 'profile' || tab === 'settings') router.push('/dashboard');
          else if (tab === 'earnings') router.push('/dashboard');
          else if (tab === 'equity') router.push('/equity');
        }}
      />
    </main>
  );
}
