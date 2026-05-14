'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  trend,
  trendUp,
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-200 bg-purple-50 p-4',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        {icon && <span className="text-purple-600">{icon}</span>}
      </div>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {trend && (
        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-xs font-medium',
            trendUp ? 'text-success' : 'text-danger',
          )}
        >
          {trendUp ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {trend}
        </div>
      )}
    </div>
  );
}
