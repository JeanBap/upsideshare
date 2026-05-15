'use client';

import React from 'react';
import {
  CheckCircle2,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  PenTool,
  Users,
  BarChart3,
  Tag,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_CREATOR = {
  name: 'Jess Rivera',
  handle: '@jessrivera',
  avatarUrl: null as string | null,
  followers: '142K',
  trackedSales: '1,247',
  activeDeals: 3,
};

const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Glow Serum SPF 30',
    brand: 'Glow Naturals',
    price: '$38.00',
    verified: true,
  },
  {
    id: 'prod-2',
    name: 'Daily Probiotic Blend',
    brand: 'VitalCore',
    price: '$29.99',
    verified: true,
  },
  {
    id: 'prod-3',
    name: 'Resistance Band Set',
    brand: 'FlexFit',
    price: '$24.00',
    verified: true,
  },
];

const MOCK_OFFERINGS = [
  {
    id: 'offer-dm',
    name: 'DM me anything',
    description: 'Get a personal reply within 24 hours',
    price: '$5',
    icon: <MessageCircle className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'offer-merch',
    name: 'Merch store',
    description: 'Hoodies, tees, and accessories',
    price: 'From $25',
    icon: <ShoppingBag className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'offer-exp',
    name: 'Curated experiences',
    description: 'Workout plans and meal guides',
    price: 'From $15',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'offer-note',
    name: 'Handwritten note',
    description: 'A personal note mailed to you',
    price: '$12',
    icon: <PenTool className="h-5 w-5" />,
    color: 'bg-rose-100 text-rose-600',
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CreatorLandingPage() {
  const creator = MOCK_CREATOR;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Creator profile header */}
      <header className="flex flex-col items-center px-4 pt-10 pb-6">
        {/* Avatar */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-2xl font-bold">
          {creator.name.charAt(0)}
        </div>

        <h1 className="mt-3 text-xl font-bold text-gray-900">
          {creator.name}
        </h1>
        <p className="text-sm text-gray-500">{creator.handle}</p>

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="font-semibold">{creator.followers}</span>
            <span className="text-gray-400">followers</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            <span className="font-semibold">{creator.trackedSales}</span>
            <span className="text-gray-400">tracked sales</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="font-semibold">{creator.activeDeals}</span>
            <span className="text-gray-400">active deals</span>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 px-4 pb-10">
        {/* Products section */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-gray-900">
            Shop {creator.name.split(' ')[0]}&apos;s picks
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Products I use and earn from. Every purchase tracked via Stripe.
          </p>

          <div className="mt-4 space-y-3">
            {MOCK_PRODUCTS.map((product) => (
              <Card key={product.id} variant="surface">
                <div className="flex items-center gap-3">
                  {/* Product image placeholder */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    <ShoppingBag className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {product.name}
                      </p>
                      {product.verified && (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                    <p className="mt-0.5 text-sm font-bold text-gray-900">
                      {product.price}
                    </p>
                  </div>

                  <Button
                    variant="coral"
                    size="sm"
                    onClick={() => {}}
                  >
                    Buy now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Back office offerings */}
        <section>
          <h2 className="text-base font-bold text-gray-900">
            Get more from {creator.name.split(' ')[0]}
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {MOCK_OFFERINGS.map((offering) => (
              <Card
                key={offering.id}
                variant="surface"
                onClick={() => {}}
                className="flex flex-col items-center text-center py-5"
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    offering.color,
                  )}
                >
                  {offering.icon}
                </div>
                <p className="mt-2.5 text-sm font-semibold text-gray-900">
                  {offering.name}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-gray-500">
                  {offering.description}
                </p>
                <p className="mt-2 text-sm font-bold text-purple-600">
                  {offering.price}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-6 text-center">
        <p className="text-xs font-medium text-gray-400">
          Powered by UpsideShare
        </p>
        <p className="mt-1 text-[10px] text-gray-300">
          All revenue tracked and verified via Stripe
        </p>
      </footer>
    </div>
  );
}
