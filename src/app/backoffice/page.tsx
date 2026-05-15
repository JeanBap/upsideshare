'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  MessageCircle,
  Sparkles,
  PenTool,
  Gem,
  Video,
  Plus,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import { NavBar } from '@/components/ui/NavBar';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/components/Providers';
import { createClient } from '@/lib/supabase';
import { cn, formatCurrency } from '@/lib/utils';
import type { BackOfficeStream } from '@/lib/types';

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
  { label: string; icon: React.ReactNode; color: string }
> = {
  merchandise: {
    label: 'Merchandise',
    icon: <ShoppingBag className={STREAM_ICON_CLASS} />,
    color: 'bg-purple-100 text-purple-600',
  },
  fan_chat: {
    label: 'Fan chat / DMs',
    icon: <MessageCircle className={STREAM_ICON_CLASS} />,
    color: 'bg-blue-100 text-blue-600',
  },
  experiences: {
    label: 'Curated experiences',
    icon: <Sparkles className={STREAM_ICON_CLASS} />,
    color: 'bg-amber-100 text-amber-600',
  },
  handwritten_notes: {
    label: 'Handwritten notes',
    icon: <PenTool className={STREAM_ICON_CLASS} />,
    color: 'bg-rose-100 text-rose-600',
  },
  handcrafted_items: {
    label: 'Handcrafted items',
    icon: <Gem className={STREAM_ICON_CLASS} />,
    color: 'bg-emerald-100 text-emerald-600',
  },
  video_shoutouts: {
    label: 'Video shoutouts',
    icon: <Video className={STREAM_ICON_CLASS} />,
    color: 'bg-indigo-100 text-indigo-600',
  },
  custom: {
    label: 'Custom stream',
    icon: <Zap className={STREAM_ICON_CLASS} />,
    color: 'bg-gray-100 text-gray-600',
  },
};

const AVAILABLE_STREAMS: StreamType[] = [
  'experiences',
  'handwritten_notes',
  'handcrafted_items',
  'video_shoutouts',
  'custom',
];

export default function BackofficePage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [streams, setStreams] = useState<BackOfficeStream[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not creator
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/signup');
    }
    if (!authLoading && user && role === 'brand') {
      router.replace('/dashboard');
    }
  }, [authLoading, user, role, router]);

  // Fetch streams
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    supabase
      .from('back_office_streams')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setStreams(data || []);
        setLoading(false);
      });
  }, [user]);

  if (authLoading || loading) {
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

  const activeStreams = streams.filter(s => s.is_active);
  const totalRevenue = streams.reduce((sum, s) => sum + (s.price_cents || 0), 0);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-24">
      <TopBar
        title="Back office"
        rightAction={
          activeStreams.length > 0 ? (
            <Badge variant="verified">
              {activeStreams.length} active
            </Badge>
          ) : undefined
        }
      />

      <main id="main-content" className="flex-1 px-4 py-5">
        {streams.length > 0 ? (
          <div className="space-y-6">
            <StatCard
              label="Active revenue streams"
              value={String(activeStreams.length)}
              icon={<TrendingUp className="h-4 w-4" />}
            />

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Your revenue streams
              </h2>

              <div className="space-y-3">
                {streams.map((stream) => {
                  const config = STREAM_TYPE_CONFIG[stream.stream_type as StreamType] || STREAM_TYPE_CONFIG.custom;
                  return (
                    <Card key={stream.id} variant="surface">
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', config.color)}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{stream.title}</p>
                          <p className="text-xs text-gray-500">{stream.description || config.label}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(stream.price_cents)}</p>
                          <Badge variant={stream.is_active ? 'approved' : 'pending'}>
                            {stream.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Add new stream */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">Add new stream</h2>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_STREAMS.filter(type => !streams.some(s => s.stream_type === type)).map((type) => {
                  const config = STREAM_TYPE_CONFIG[type];
                  return (
                    <Card key={type} variant="surface" className="flex flex-col items-center gap-2 py-5">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', config.color)}>
                        {config.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center">{config.label}</span>
                    </Card>
                  );
                })}
              </div>
            </section>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 mb-5">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Turn followers into revenue</h2>
            <p className="mt-2 max-w-xs text-sm text-gray-500">
              Pick a stream, set your price, and start earning beyond brand deals.
            </p>
            <Button variant="primary" size="lg" className="mt-6">
              Add your first stream
            </Button>
          </div>
        )}
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
