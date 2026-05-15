'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const MOCK_DEALS = [
  {
    id: '1',
    title: 'Summer skincare launch',
    brandName: 'GlowCo',
    category: 'Beauty',
    revenueSharePct: 12,
    equityPct: null,
    spotsLeft: 8,
    spotsTotal: 10,
  },
  {
    id: '2',
    title: 'Protein bar creator program',
    brandName: 'FuelBar',
    category: 'Health & Fitness',
    revenueSharePct: 15,
    equityPct: 0.5,
    spotsLeft: 3,
    spotsTotal: 5,
  },
  {
    id: '3',
    title: 'Home office essentials',
    brandName: 'DeskUp',
    category: 'Lifestyle',
    revenueSharePct: 10,
    equityPct: null,
    spotsLeft: 12,
    spotsTotal: 20,
  },
];

export default function LandingPage() {
  return (
    <main id="main-content" className="flex flex-col min-h-screen">
      {/* ───────────── Hero ───────────── */}
      <section className="relative bg-gradient-to-b from-purple-600 to-purple-800 px-5 pb-16 pt-14 text-white">
        <div className="mx-auto max-w-lg">
          <span className="mb-4 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
            Revenue share + equity, verified
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Brands &amp; creators.
            <br />
            Aligned by revenue.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-purple-100">
            Stripe-verified revenue tracking, template equity contracts, and a
            creator back office. All in one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button variant="coral" size="lg" fullWidth>
                Get started free
              </Button>
            </Link>
            <Link href="/deals">
              <Button variant="secondary" size="lg" fullWidth className="border-white text-white hover:bg-white/10">
                Browse deals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── How it works ───────────── */}
      <section className="bg-white px-5 py-16">
        <div className="mx-auto max-w-lg">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            How it works
          </h2>
          <div className="mt-10 grid gap-8">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Brand creates a deal
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Set revenue share percentage, optional equity, and the number
                  of creator spots. Connect Stripe for verified tracking.
                </p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Creators apply and promote
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Browse the deal marketplace, apply to the brands you believe
                  in, and share your unique tracking link.
                </p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Revenue tracked via Stripe
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Every sale is verified through Stripe webhooks. No
                  screenshots, no honor system. Real revenue, real payouts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Live deals ───────────── */}
      <section className="bg-gray-50 px-5 py-16">
        <div className="mx-auto max-w-lg">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Live deals
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Real brands, real revenue share. Apply today.
          </p>
          <div className="mt-8 grid gap-4">
            {MOCK_DEALS.map((deal) => (
              <Card key={deal.id} variant="surface" className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 font-bold text-sm">
                    {deal.brandName.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-800 truncate">
                        {deal.brandName}
                      </span>
                      <Badge variant="verified" />
                    </div>
                    <span className="text-xs text-gray-400">{deal.category}</span>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {deal.title}
                </h3>
                <div className="flex items-center gap-3">
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
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/deals">
              <Button variant="secondary" size="md">
                View all deals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── Pricing bar ───────────── */}
      <section className="bg-purple-600 px-5 py-12 text-white">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-xl font-bold">Simple pricing</h2>
          <p className="mt-2 text-4xl font-bold">5% of tracked revenue</p>
          <p className="mt-3 text-sm text-purple-100">
            Free to join. Pay only when you earn.
          </p>
        </div>
      </section>

      {/* ───────────── Footer ───────────── */}
      <footer className="bg-gray-900 px-5 py-8 text-center">
        <p className="text-sm font-semibold text-white">
          Powered by UpsideShare
        </p>
        <p className="mt-2 text-xs text-gray-400">
          All revenue tracked and verified via Stripe
        </p>
      </footer>
    </main>
  );
}
