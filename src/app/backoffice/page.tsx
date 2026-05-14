'use client';

import React, { useState } from 'react';
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
import { cn } from '@/lib/utils';

interface RevenueStream {
  id: string;
  name: string;
  type: StreamType;
  revenue: number;
  activeDetail: string;
  icon: React.ReactNode;
}

type StreamType =
  | 'merchandise'
  | 'fan-chat'
  | 'experiences'
  | 'handwritten-notes'
  | 'handcrafted-items'
  | 'video-shoutouts'
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
  'fan-chat': {
    label: 'Fan chat / DMs',
    icon: <MessageCircle className={STREAM_ICON_CLASS} />,
    color: 'bg-blue-100 text-blue-600',
  },
  experiences: {
    label: 'Curated experiences',
    icon: <Sparkles className={STREAM_ICON_CLASS} />,
    color: 'bg-amber-100 text-amber-600',
  },
  'handwritten-notes': {
    label: 'Handwritten notes',
    icon: <PenTool className={STREAM_ICON_CLASS} />,
    color: 'bg-rose-100 text-rose-600',
  },
  'handcrafted-items': {
    label: 'Handcrafted items',
    icon: <Gem className={STREAM_ICON_CLASS} />,
    color: 'bg-emerald-100 text-emerald-600',
  },
  'video-shoutouts': {
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

const MOCK_STREAMS: RevenueStream[] = [
  {
    id: 'stream-1',
    name: 'Merch Store',
    type: 'merchandise',
    revenue: 2340,
    activeDetail: '12 products listed',
    icon: <ShoppingBag className={STREAM_ICON_CLASS} />,
  },
  {
    id: 'stream-2',
    name: 'Fan DMs',
    type: 'fan-chat',
    revenue: 890,
    activeDetail: '47 conversations',
    icon: <MessageCircle className={STREAM_ICON_CLASS} />,
  },
];

const AVAILABLE_STREAMS: StreamType[] = [
  'experiences',
  'handwritten-notes',
  'handcrafted-items',
  'video-shoutouts',
  'custom',
];

function formatCurrency(cents: number): string {
  return `$${cents.toLocaleString('en-US')}`;
}

export default function BackofficePage() {
  const [streams] = useState<RevenueStream[]>(MOCK_STREAMS);
  const hasStreams = streams.length > 0;
  const totalRevenue = streams.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-24">
      <TopBar
        title="Back office"
        rightAction={
          hasStreams ? (
            <Badge variant="verified">
              {streams.length} active
            </Badge>
          ) : undefined
        }
      />

      <main className="flex-1 px-4 py-5">
        {hasStreams ? (
          <div className="space-y-6">
            {/* Revenue summary */}
            <StatCard
              label="This month's back office revenue"
              value={formatCurrency(totalRevenue)}
              trend="+18% vs last month"
              trendUp
              icon={<TrendingUp className="h-4 w-4" />}
            />

            {/* Active streams */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Your revenue streams
              </h2>

              <div className="space-y-3">
                {streams.map((stream) => {
                  const config = STREAM_TYPE_CONFIG[stream.type];
                  return (
                    <Card
                      key={stream.id}
                      variant="surface"
                      onClick={() => {}}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl',
                            config.color,
                          )}
                        >
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {stream.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {stream.activeDetail}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(stream.revenue)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            this month
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Add new stream */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Add new stream
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_STREAMS.map((type) => {
                  const config = STREAM_TYPE_CONFIG[type];
                  return (
                    <Card
                      key={type}
                      variant="surface"
                      onClick={() => {}}
                      className="flex flex-col items-center gap-2 py-5"
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl',
                          config.color,
                        )}
                      >
                        {config.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center">
                        {config.label}
                      </span>
                    </Card>
                  );
                })}

                <Card
                  variant="surface"
                  onClick={() => {}}
                  className="flex flex-col items-center justify-center gap-2 border-dashed py-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                    <Plus className={STREAM_ICON_CLASS} />
                  </div>
                  <span className="text-xs font-medium text-gray-500 text-center">
                    Custom stream
                  </span>
                </Card>
              </div>
            </section>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 mb-5">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Turn followers into revenue
            </h2>
            <p className="mt-2 max-w-xs text-sm text-gray-500">
              Pick a stream, set your price, and start earning beyond brand
              deals.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="mt-6"
              onClick={() => {}}
            >
              Add your first stream
            </Button>
          </div>
        )}
      </main>

      <NavBar role="creator" activeTab="home" />
    </div>
  );
}
