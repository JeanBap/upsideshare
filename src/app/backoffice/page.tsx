'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  MessageCircle,
  Sparkles,
  PenTool,
  Gem,
  Video,
  Zap,
} from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import { NavBar } from '@/components/ui/NavBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/components/Providers';
import { cn } from '@/lib/utils';

type StreamType =
  | 'merchandise'
  | 'fan_chat'
  | 'experiences'
  | 'handwritten_notes'
  | 'handcrafted_items'
  | 'video_shoutouts'
  | 'custom';

const STREAM_ICON_CLASS = 'h-5 w-5';

const STREAM_TYPE_CONFIG: Record<
  StreamType,
  { label: string; icon: React.ReactNode; color: string; description: string }
> = {
  merchandise: {
    label: 'Merchandise',
    icon: <ShoppingBag className={STREAM_ICON_CLASS} />,
    color: 'bg-purple-100 text-purple-600',
    description: 'Sell branded merch to your audience',
  },
  fan_chat: {
    label: 'Fan chat / DMs',
    icon: <MessageCircle className={STREAM_ICON_CLASS} />,
    color: 'bg-blue-100 text-blue-600',
    description: 'Charge for direct conversations',
  },
  experiences: {
    label: 'Curated experiences',
    icon: <Sparkles className={STREAM_ICON_CLASS} />,
    color: 'bg-amber-100 text-amber-600',
    description: 'Offer exclusive events or meetups',
  },
  handwritten_notes: {
    label: 'Handwritten notes',
    icon: <PenTool className={STREAM_ICON_CLASS} />,
    color: 'bg-rose-100 text-rose-600',
    description: 'Personal notes for your biggest fans',
  },
  handcrafted_items: {
    label: 'Handcrafted items',
    icon: <Gem className={STREAM_ICON_CLASS} />,
    color: 'bg-emerald-100 text-emerald-600',
    description: 'Sell one-of-a-kind creations',
  },
  video_shoutouts: {
    label: 'Video shoutouts',
    icon: <Video className={STREAM_ICON_CLASS} />,
    color: 'bg-indigo-100 text-indigo-600',
    description: 'Personalised video messages',
  },
  custom: {
    label: 'Custom stream',
    icon: <Zap className={STREAM_ICON_CLASS} />,
    color: 'bg-gray-100 text-gray-600',
    description: 'Build your own revenue stream',
  },
};

const ALL_STREAMS: StreamType[] = [
  'merchandise',
  'fan_chat',
  'experiences',
  'handwritten_notes',
  'handcrafted_items',
  'video_shoutouts',
  'custom',
];

export default function BackofficePage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/signup');
    }
    if (!authLoading && user && role === 'brand') {
      router.replace('/dashboard');
    }
  }, [authLoading, user, role, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 pb-24">
        <TopBar title="Back office" />
        <div className="flex-1 px-4 py-5 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <NavBar role="creator" activeTab="home" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-24">
      <TopBar title="Back office" />

      <main id="main-content" className="flex-1 px-4 py-5">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 mb-5">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Turn followers into revenue</h2>
          <p className="mt-2 max-w-xs text-sm text-gray-500">
            Pick a stream below to start earning beyond brand deals. This feature is coming soon.
          </p>
        </div>

        <section className="space-y-3 mt-4">
          <h2 className="text-sm font-semibold text-gray-900">Revenue streams</h2>
          <div className="grid grid-cols-2 gap-3">
            {ALL_STREAMS.map((type) => {
              const config = STREAM_TYPE_CONFIG[type];
              return (
                <Card key={type} variant="surface" className="flex flex-col items-center gap-2 py-5">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', config.color)}>
                    {config.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">{config.label}</span>
                  <span className="text-[10px] text-gray-400 text-center px-2">{config.description}</span>
                </Card>
              );
            })}
          </div>
        </section>

        <div className="mt-8 text-center">
          <Button variant="primary" size="lg" onClick={() => router.push('/dashboard')}>
            Back to dashboard
          </Button>
        </div>
      </main>

      <NavBar
        role="creator"
        activeTab="home"
        onTabChange={(tab) => {
          if (tab === 'deals') router.push('/deals');
          else if (tab === 'home') router.push('/dashboard');
        }}
      />
    </div>
  );
}
