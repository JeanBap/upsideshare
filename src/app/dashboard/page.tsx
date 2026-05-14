'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { NavBar } from '@/components/ui/NavBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { getGreeting, formatCurrency } from '@/lib/utils';
import type { UserRole } from '@/lib/types';

/* ─── Mock data: creator ─── */
const CREATOR_STATS = {
  totalEarnings: 234500,
  pendingPayout: 45000,
  activeDeals: 3,
  backOfficeItems: 5,
};

const CREATOR_DEALS = [
  { id: '1', title: 'Summer skincare launch', brand: 'GlowCo', revenueSharePct: 12, status: 'active' as const, earned: 89000 },
  { id: '2', title: 'Protein bar creator program', brand: 'FuelBar', revenueSharePct: 15, status: 'active' as const, earned: 123500 },
  { id: '3', title: 'Home office essentials', brand: 'DeskUp', revenueSharePct: 10, status: 'active' as const, earned: 22000 },
];

/* ─── Mock data: brand ─── */
const BRAND_STATS = {
  totalRevenue: 1845000,
  commissionsOwed: 221400,
  activeCreators: 12,
  platformFeePct: 5,
};

const BRAND_CREATORS = [
  { id: '1', name: 'Sarah Chen', revenueGenerated: 450000, commission: 54000 },
  { id: '2', name: 'Marcus Johnson', revenueGenerated: 380000, commission: 45600 },
  { id: '3', name: 'Aisha Patel', revenueGenerated: 315000, commission: 37800 },
];

const BRAND_LEDGER = [
  { id: '1', creator: 'Sarah Chen', period: 'Apr 2026', amount: 18000, confirmed: false },
  { id: '2', creator: 'Marcus Johnson', period: 'Apr 2026', amount: 15200, confirmed: false },
  { id: '3', creator: 'Aisha Patel', period: 'Mar 2026', amount: 12600, confirmed: true },
];

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

function CreatorDashboard() {
  const greeting = getGreeting();

  return (
    <>
      <header className="px-5 pt-6 pb-2">
        <p className="text-sm text-gray-400">{greeting}</p>
        <h1 className="text-xl font-bold text-gray-900">Your dashboard</h1>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 px-5">
        <StatCard
          label="Total earnings"
          value={formatCurrency(CREATOR_STATS.totalEarnings)}
          trend="+12% this month"
          trendUp
        />
        <StatCard
          label="Pending payout"
          value={formatCurrency(CREATOR_STATS.pendingPayout)}
        />
        <StatCard
          label="Active deals"
          value={String(CREATOR_STATS.activeDeals)}
        />
        <StatCard
          label="Back office"
          value={`${CREATOR_STATS.backOfficeItems} items`}
        />
      </div>

      {/* Earnings trend chart placeholder */}
      <section className="mx-5 mt-6">
        <h2 className="text-base font-semibold text-gray-900">Earnings trend</h2>
        <Card variant="surface" className="mt-3 flex h-48 items-center justify-center">
          <div className="text-center">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p className="mt-2 text-sm text-gray-400">Chart coming soon</p>
          </div>
        </Card>
      </section>

      {/* Active deals */}
      <section className="mx-5 mt-6 pb-6">
        <h2 className="text-base font-semibold text-gray-900">Active deals</h2>
        <div className="mt-3 space-y-3">
          {CREATOR_DEALS.map((deal) => (
            <Card key={deal.id} variant="surface" className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{deal.title}</p>
                <p className="text-xs text-gray-400">{deal.brand} · {deal.revenueSharePct}% rev share</p>
              </div>
              <div className="ml-3 text-right shrink-0">
                <p className="text-sm font-bold text-gray-900">{formatCurrency(deal.earned)}</p>
                <Badge variant="approved">Active</Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

function BrandDashboard() {
  const greeting = getGreeting();

  return (
    <>
      <header className="px-5 pt-6 pb-2">
        <p className="text-sm text-gray-400">{greeting}</p>
        <h1 className="text-xl font-bold text-gray-900">Brand dashboard</h1>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 px-5">
        <StatCard
          label="Total revenue tracked"
          value={formatCurrency(BRAND_STATS.totalRevenue)}
          trend="+8% this month"
          trendUp
        />
        <StatCard
          label="Commissions owed"
          value={formatCurrency(BRAND_STATS.commissionsOwed)}
        />
        <StatCard
          label="Active creators"
          value={String(BRAND_STATS.activeCreators)}
        />
        <StatCard
          label="Platform fee"
          value={`${BRAND_STATS.platformFeePct}%`}
        />
      </div>

      {/* Revenue by creator */}
      <section className="mx-5 mt-6">
        <h2 className="text-base font-semibold text-gray-900">Revenue by creator</h2>
        <div className="mt-3 space-y-3">
          {BRAND_CREATORS.map((creator) => (
            <Card key={creator.id} variant="surface" className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 text-xs font-bold">
                  {creator.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{creator.name}</p>
                  <p className="text-xs text-gray-400">Revenue: {formatCurrency(creator.revenueGenerated)}</p>
                </div>
              </div>
              <div className="ml-3 text-right shrink-0">
                <p className="text-sm font-bold text-coral-400">{formatCurrency(creator.commission)}</p>
                <p className="text-[10px] text-gray-400">commission</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Ledger */}
      <section className="mx-5 mt-6 pb-6">
        <h2 className="text-base font-semibold text-gray-900">Ledger</h2>
        <p className="mt-1 text-xs text-gray-400">Pending confirmations and completed payouts</p>
        <div className="mt-3 space-y-3">
          {BRAND_LEDGER.map((entry) => (
            <Card key={entry.id} variant="surface" className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{entry.creator}</p>
                <p className="text-xs text-gray-400">{entry.period}</p>
              </div>
              <div className="ml-3 flex items-center gap-2 shrink-0">
                <p className="text-sm font-bold text-gray-900">{formatCurrency(entry.amount)}</p>
                {entry.confirmed ? (
                  <Badge variant="approved">Confirmed</Badge>
                ) : (
                  <Badge variant="pending">Pending</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>('creator');
  const [loading] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Role toggle (for demo) */}
      <div className="sticky top-0 z-40 flex items-center justify-end gap-2 bg-white border-b border-gray-200 px-5 py-2">
        <span className="text-xs text-gray-400">View as:</span>
        <button
          onClick={() => setRole('creator')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            role === 'creator' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Creator
        </button>
        <button
          onClick={() => setRole('brand')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            role === 'brand' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Brand
        </button>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : role === 'creator' ? (
        <CreatorDashboard />
      ) : (
        <BrandDashboard />
      )}

      <NavBar
        role={role}
        activeTab={role === 'creator' ? 'home' : 'revenue'}
      />
    </div>
  );
}
