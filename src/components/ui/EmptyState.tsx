'use client';

import React from 'react';
import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  headline,
  body,
  ctaLabel,
  ctaHref,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-16 text-center',
        className,
      )}
    >
      <span className="mb-4 text-gray-300">
        {icon ?? <Inbox className="h-12 w-12" />}
      </span>
      <h3 className="text-lg font-bold text-gray-900">{headline}</h3>
      <p className="mt-1 max-w-xs text-sm text-gray-500">{body}</p>
      <Link href={ctaHref} className="mt-6">
        <Button variant="primary">{ctaLabel}</Button>
      </Link>
    </div>
  );
}
