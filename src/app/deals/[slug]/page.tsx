'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const MOCK_DEALS: Record<string, {
  slug: string;
  title: string;
  brandName: string;
  brandVerified: boolean;
  category: string;
  description: string;
  longDescription: string;
  revenueSharePct: number;
  equityPct: number | null;
  equityDescription: string | null;
  attributionMethod: string;
  attributionExplainer: string;
  spotsTotal: number;
  spotsLeft: number;
}> = {
  'summer-skincare-launch': {
    slug: 'summer-skincare-launch',
    title: 'Summer skincare launch',
    brandName: 'GlowCo',
    brandVerified: true,
    category: 'Beauty',
    description: 'Promote our new summer SPF line. 12% of every sale tracked through your unique link.',
    longDescription: 'GlowCo is launching a premium SPF line for summer 2026. We are looking for creators who are passionate about skincare and sun protection. You will receive a unique coupon code and landing page link. Every sale attributed to you earns a 12% revenue share, verified through Stripe. Payouts are processed monthly after brand confirmation.',
    revenueSharePct: 12,
    equityPct: null,
    equityDescription: null,
    attributionMethod: 'Coupon code + landing page',
    attributionExplainer: 'You get a unique coupon code (e.g., SARAH12) and a branded landing page link. When a customer uses either, the sale is automatically attributed to you via Stripe webhooks.',
    spotsTotal: 10,
    spotsLeft: 8,
  },
  'protein-bar-creator-program': {
    slug: 'protein-bar-creator-program',
    title: 'Protein bar creator program',
    brandName: 'FuelBar',
    brandVerified: true,
    category: 'Health & Fitness',
    description: 'Join the FuelBar family. Revenue share plus equity for top performers.',
    longDescription: 'FuelBar is building a creator-powered brand. We offer 15% revenue share on every sale plus 0.5% equity for creators who hit revenue targets. This is a long-term partnership. We are looking for fitness and nutrition creators with engaged audiences who genuinely love our products.',
    revenueSharePct: 15,
    equityPct: 0.5,
    equityDescription: '0.5% common equity vests over 12 months after reaching $10,000 in attributed revenue. Template contract provided through UpsideShare.',
    attributionMethod: 'Coupon code',
    attributionExplainer: 'You receive a unique coupon code. Every purchase using your code is tracked through Stripe and attributed to you automatically.',
    spotsTotal: 5,
    spotsLeft: 3,
  },
  'home-office-essentials': {
    slug: 'home-office-essentials',
    title: 'Home office essentials',
    brandName: 'DeskUp',
    brandVerified: true,
    category: 'Lifestyle',
    description: 'Help remote workers upgrade their setup. Generous rev share on every desk and chair sold.',
    longDescription: 'DeskUp makes ergonomic desks and chairs for remote workers. We are looking for creators in the productivity, tech, and lifestyle space to promote our products. Every sale through your link earns a 10% revenue share. High-ticket items mean higher earnings per sale.',
    revenueSharePct: 10,
    equityPct: null,
    equityDescription: null,
    attributionMethod: 'Landing page',
    attributionExplainer: 'You receive a unique branded landing page URL. Every purchase originating from that page is tracked through Stripe and attributed to you.',
    spotsTotal: 20,
    spotsLeft: 12,
  },
};

function DetailSkeleton() {
  return (
    <div className="space-y-6 px-5 pt-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14" rounded />
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export default function DealDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [deal, setDeal] = useState<typeof MOCK_DEALS[string] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading from Supabase
    const timer = setTimeout(() => {
      const found = MOCK_DEALS[slug] || null;
      setDeal(found);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DetailSkeleton />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-bold text-gray-900">Deal not found</h2>
        <p className="mt-1 text-sm text-gray-600">This deal may have been removed or the link is incorrect.</p>
        <Link href="/deals" className="mt-6">
          <Button variant="secondary">Browse deals</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Back button */}
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-white border-b border-gray-200 px-5 py-3">
        <Link href="/deals" className="flex items-center gap-1 text-sm font-medium text-purple-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Deals
        </Link>
      </header>

      <main id="main-content" className="px-5 pt-6">
        {/* Brand header */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 font-bold text-xl">
            {deal.brandName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">{deal.brandName}</h2>
              {deal.brandVerified && <Badge variant="verified" />}
            </div>
            <p className="text-xs text-gray-400">{deal.category}</p>
          </div>
        </div>

        {/* Deal title */}
        <h1 className="mt-5 text-2xl font-bold text-gray-900 leading-tight">
          {deal.title}
        </h1>

        {/* Description */}
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {deal.longDescription}
        </p>

        {/* Key metrics */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Card variant="purpleTint" className="text-center">
            <p className="text-2xl font-bold text-purple-600">{deal.revenueSharePct}%</p>
            <p className="text-xs font-medium text-purple-600">Revenue share</p>
          </Card>
          <Card variant="surface" className="text-center">
            <p className="text-2xl font-bold text-gray-900">{deal.spotsLeft}/{deal.spotsTotal}</p>
            <p className="text-xs font-medium text-gray-400">Spots remaining</p>
          </Card>
        </div>

        {/* Equity section */}
        {deal.equityPct != null && deal.equityPct > 0 && (
          <Card variant="surface" className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="equity">{deal.equityPct}% equity</Badge>
            </div>
            <p className="text-sm text-gray-600">{deal.equityDescription}</p>
          </Card>
        )}

        {/* Attribution method */}
        <Card variant="surface" className="mt-4">
          <h3 className="text-sm font-semibold text-gray-900">How attribution works</h3>
          <p className="mt-1 text-xs font-medium text-purple-600">{deal.attributionMethod}</p>
          <p className="mt-2 text-sm text-gray-600">{deal.attributionExplainer}</p>
        </Card>

        {/* CTA */}
        <div className="mt-8 space-y-3">
          <Link href="/signup">
            <Button variant="coral" size="lg" fullWidth>
              Apply to this deal
            </Button>
          </Link>
          <Link href="/signup" className="block">
            <Button variant="ghost" size="md" fullWidth>
              Sign up to apply
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
