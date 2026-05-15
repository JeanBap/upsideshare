'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NavBar } from '@/components/ui/NavBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { JsonLd } from '@/components/JsonLd';

const CATEGORIES = ['All', 'Beauty', 'Health & Fitness', 'Lifestyle', 'Tech', 'Food & Drink', 'Fashion'];

const MOCK_DEALS = [
  {
    id: '1',
    slug: 'summer-skincare-launch',
    title: 'Summer skincare launch',
    brandName: 'GlowCo',
    category: 'Beauty',
    description: 'Promote our new summer SPF line. 12% of every sale tracked through your unique link.',
    revenueSharePct: 12,
    equityPct: null,
    spotsLeft: 8,
    spotsTotal: 10,
    verified: true,
  },
  {
    id: '2',
    slug: 'protein-bar-creator-program',
    title: 'Protein bar creator program',
    brandName: 'FuelBar',
    category: 'Health & Fitness',
    description: 'Join the FuelBar family. Revenue share plus equity for top performers.',
    revenueSharePct: 15,
    equityPct: 0.5,
    spotsLeft: 3,
    spotsTotal: 5,
    verified: true,
  },
  {
    id: '3',
    slug: 'home-office-essentials',
    title: 'Home office essentials',
    brandName: 'DeskUp',
    category: 'Lifestyle',
    description: 'Help remote workers upgrade their setup. Generous rev share on every desk and chair sold.',
    revenueSharePct: 10,
    equityPct: null,
    spotsLeft: 12,
    spotsTotal: 20,
    verified: true,
  },
  {
    id: '4',
    slug: 'smart-water-bottle',
    title: 'Smart water bottle launch',
    brandName: 'HydroTrack',
    category: 'Tech',
    description: 'Be the first to promote our app-connected water bottle. Early creators get equity.',
    revenueSharePct: 18,
    equityPct: 1.0,
    spotsLeft: 2,
    spotsTotal: 3,
    verified: false,
  },
  {
    id: '5',
    slug: 'artisan-coffee-club',
    title: 'Artisan coffee subscription',
    brandName: 'BeanScene',
    category: 'Food & Drink',
    description: 'Monthly coffee subscription box. Recurring revenue share on every subscriber you bring in.',
    revenueSharePct: 20,
    equityPct: null,
    spotsLeft: 15,
    spotsTotal: 25,
    verified: true,
  },
  {
    id: '6',
    slug: 'sustainable-streetwear',
    title: 'Sustainable streetwear drop',
    brandName: 'EcoThread',
    category: 'Fashion',
    description: 'Limited edition sustainable collection. High revenue share for authentic creators.',
    revenueSharePct: 14,
    equityPct: null,
    spotsLeft: 6,
    spotsTotal: 10,
    verified: true,
  },
];

function DealCardSkeleton() {
  return (
    <Card variant="surface" className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" rounded />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16 ml-auto" />
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">No deals found</h3>
      <p className="mt-1 text-sm text-gray-600">
        Try a different search or check back later.
      </p>
    </div>
  );
}

export default function DealsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_DEALS.filter((deal) => {
      const matchesCategory = activeCategory === 'All' || deal.category === activeCategory;
      const matchesSearch =
        search === '' ||
        deal.title.toLowerCase().includes(search.toLowerCase()) ||
        deal.brandName.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Revenue Share Deals on UpsideShare',
        description: 'Browse active brand-creator revenue share deals with Stripe-verified tracking.',
        url: 'https://upsideshare.com/deals',
        numberOfItems: MOCK_DEALS.length,
        itemListElement: MOCK_DEALS.map((deal, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `https://upsideshare.com/deals/${deal.slug}`,
          name: deal.title,
        })),
      }} />
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-5 pb-4 pt-6">
        <h1 className="text-xl font-bold text-gray-900">Deals</h1>

        {/* Search */}
        <div className="relative mt-3">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search deals"
            placeholder="Search deals..."
            className="w-full rounded-[10px] border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Filter chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Deal grid */}
      <main id="main-content" className="flex-1 px-5 pt-4">
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <DealCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {filtered.map((deal) => (
              <Link key={deal.id} href={`/deals/${deal.slug}`} className="block">
                <Card variant="surface" className="flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 font-bold text-sm">
                      {deal.brandName.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-800 truncate">
                          {deal.brandName}
                        </span>
                        <Badge variant={deal.verified ? 'verified' : 'unverified'} />
                      </div>
                      <span className="text-xs text-gray-400">{deal.category}</span>
                    </div>
                  </div>

                  <h2 className="text-base font-semibold text-gray-900 leading-snug">
                    {deal.title}
                  </h2>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {deal.description}
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-600">
                      {deal.revenueSharePct}% rev share
                    </span>
                    {deal.equityPct != null && deal.equityPct > 0 && (
                      <Badge variant="equity">{deal.equityPct}% equity</Badge>
                    )}
                    <span className="ml-auto text-xs text-gray-400">
                      {deal.spotsLeft} spots left
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <NavBar role="creator" activeTab="deals" />
    </div>
  );
}
