'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { JsonLd } from '@/components/JsonLd';

const HOME_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'UpsideShare - Brand-Creator Revenue Share Platform',
  description:
    'Stripe-verified revenue tracking, template equity contracts, and a creator back office. Brands and creators aligned by revenue.',
  url: 'https://upsideshare.com/',
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: 'UpsideShare',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'A platform connecting brands and creators through Stripe-verified revenue share deals with optional equity.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free to join. 5% platform fee on tracked revenue.',
    },
  },
};

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does UpsideShare track revenue?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every sale is verified through Stripe webhooks. Creators get unique coupon codes or landing page links. When a customer uses either, the sale is automatically attributed to the creator.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does UpsideShare cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'UpsideShare is free to join for both brands and creators. The platform charges a 5% fee on tracked revenue only when earnings are generated.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can creators earn equity through UpsideShare?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Brands can offer equity alongside revenue share. UpsideShare provides template equity contracts (simple grant, vesting, and advisory) with automatic PDF generation.',
      },
    },
  ],
};

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Beauty creator, 340K followers',
    quote: 'I earned more in my first month with UpsideShare than six months of flat-rate sponsorships. Seeing real revenue data changes everything.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face',
  },
  {
    name: 'Marcus Johnson',
    role: 'Fitness creator, 120K followers',
    quote: 'The equity component is what got me. I am not just promoting a product, I am building something alongside the brand.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Co-founder, GlowCo',
    quote: 'We replaced our entire affiliate program with UpsideShare. Stripe verification means zero disputes over attribution.',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=96&h=96&fit=crop&crop=face',
  },
];

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
      <JsonLd data={HOME_JSONLD} />
      <JsonLd data={FAQ_JSONLD} />
      {/* ───────────── Hero with video background ───────────── */}
      <section className="relative overflow-hidden px-5 pb-20 pt-16 text-white">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          poster="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80"
        >
          <source
            src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4"
            type="video/mp4"
          />
        </video>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/80 to-purple-950/90" />

        <div className="relative z-10 mx-auto max-w-lg">
          <span className="mb-4 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm">
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

      {/* ───────────── Stats bar ───────────── */}
      <section className="bg-purple-50 px-5 py-10">
        <div className="mx-auto max-w-lg grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-600">$2.4M+</p>
            <p className="mt-1 text-xs text-gray-500">Revenue tracked</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">850+</p>
            <p className="mt-1 text-xs text-gray-500">Active creators</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">120+</p>
            <p className="mt-1 text-xs text-gray-500">Brands onboarded</p>
          </div>
        </div>
      </section>

      {/* ───────────── How it works with images ───────────── */}
      <section className="bg-white px-5 py-16">
        <div className="mx-auto max-w-lg">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            How it works
          </h2>
          <div className="mt-10 grid gap-10">
            {/* Step 1 */}
            <div className="flex flex-col gap-4">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop"
                alt="Brand setting up a deal on a laptop dashboard"
                width={600}
                height={300}
                className="w-full rounded-xl object-cover h-40"
                loading="lazy"
              />
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
            </div>
            {/* Step 2 */}
            <div className="flex flex-col gap-4">
              <img
                src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=300&fit=crop"
                alt="Creator filming content for a brand partnership"
                width={600}
                height={300}
                className="w-full rounded-xl object-cover h-40"
                loading="lazy"
              />
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
            </div>
            {/* Step 3 */}
            <div className="flex flex-col gap-4">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop"
                alt="Revenue analytics dashboard showing Stripe-verified sales data"
                width={600}
                height={300}
                className="w-full rounded-xl object-cover h-40"
                loading="lazy"
              />
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

      {/* ───────────── Why UpsideShare ───────────── */}
      <section className="bg-white px-5 py-16">
        <div className="mx-auto max-w-lg">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Why UpsideShare
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Built for the next generation of brand-creator partnerships.
          </p>
          <div className="mt-10 grid gap-8">
            <div className="flex gap-4 items-start">
              <img
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=120&h=120&fit=crop"
                alt="Stripe payment verification"
                width={80}
                height={80}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
                loading="lazy"
              />
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Stripe-verified attribution
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  No more screenshots or honor systems. Every sale is tracked
                  through Stripe webhooks with unique coupon codes.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <img
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=120&h=120&fit=crop"
                alt="Signing an equity contract"
                width={80}
                height={80}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
                loading="lazy"
              />
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Template equity contracts
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Offer equity alongside revenue share. Generate simple grant,
                  vesting, or advisory contracts as downloadable PDFs.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&h=120&fit=crop"
                alt="Creator working on laptop reviewing dashboard"
                width={80}
                height={80}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
                loading="lazy"
              />
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Creator back office
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Real-time payout ledger, application tracking, and performance
                  metrics. Everything a creator needs in one dashboard.
                </p>
              </div>
            </div>
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

      {/* ───────────── Testimonials ───────────── */}
      <section className="bg-white px-5 py-16">
        <div className="mx-auto max-w-lg">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Creators and brands love UpsideShare
          </h2>
          <div className="mt-10 grid gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} variant="surface" className="flex flex-col gap-4">
                <p className="text-sm leading-relaxed text-gray-700 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Footer ───────────── */}
      <footer className="bg-gray-900 px-5 py-10 text-center">
        <p className="text-sm font-semibold text-white">
          UpsideShare
        </p>
        <p className="mt-2 text-xs text-gray-400">
          All revenue tracked and verified via Stripe
        </p>
        <nav className="mt-4 flex justify-center gap-4 text-xs text-gray-500" aria-label="Footer">
          <Link href="/deals" className="hover:text-gray-300">Deals</Link>
          <Link href="/signup" className="hover:text-gray-300">Sign up</Link>
          <a href="mailto:hello@upsideshare.com" className="hover:text-gray-300">Contact</a>
          <Link href="/privacy" className="hover:text-gray-300">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-300">Terms</Link>
        </nav>
        <p className="mt-4 text-xs text-gray-600">
          &copy; {new Date().getFullYear()} UpsideShare. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
