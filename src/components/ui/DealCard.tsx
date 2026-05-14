'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';

export interface Deal {
  id: string;
  title: string;
  brandName: string;
  brandLogoUrl?: string;
  category: string;
  revenueSharePct: number;
  equityPct?: number | null;
  spotsLeft: number;
  spotsTotal: number;
  verified: boolean;
  status: string;
}

interface DealCardProps {
  deal: Deal;
  onApply?: (dealId: string) => void;
  className?: string;
}

export function DealCard({ deal, onApply, className }: DealCardProps) {
  const spotsRatio = deal.spotsLeft / deal.spotsTotal;

  return (
    <Card variant="surface" className={cn('space-y-3', className)}>
      {/* Header: logo + brand + category */}
      <div className="flex items-center gap-3">
        {deal.brandLogoUrl ? (
          <Image
            src={deal.brandLogoUrl}
            alt={deal.brandName}
            width={40}
            height={40}
            className="h-10 w-10 rounded-[10px] object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border-2 border-dashed border-gray-300 text-xs font-medium text-gray-400">
            {deal.brandName.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">
            {deal.brandName}
          </p>
          <p className="truncate text-xs text-gray-500">{deal.category}</p>
        </div>
        <Badge variant={deal.verified ? 'verified' : 'unverified'} />
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-gray-900">{deal.title}</h3>

      {/* Metrics row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-[10px] bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-600">
          {deal.revenueSharePct}% rev share
        </span>
        {deal.equityPct != null && deal.equityPct > 0 && (
          <Badge variant="equity">{deal.equityPct}% equity</Badge>
        )}
      </div>

      {/* Spots + CTA */}
      <div className="flex items-center justify-between pt-1">
        <span
          className={cn(
            'text-xs font-medium',
            spotsRatio <= 0.2 ? 'text-danger' : 'text-gray-500',
          )}
        >
          {deal.spotsLeft}/{deal.spotsTotal} spots left
        </span>
        <Button
          variant="coral"
          size="sm"
          onClick={() => onApply?.(deal.id)}
        >
          Apply now
        </Button>
      </div>
    </Card>
  );
}
