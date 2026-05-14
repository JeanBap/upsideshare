'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Diamond,
  Sparkles,
  Clock,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'verified'
  | 'unverified'
  | 'equity'
  | 'new'
  | 'pending'
  | 'approved'
  | 'rejected';

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

const config: Record<
  BadgeVariant,
  { bg: string; text: string; icon: React.ReactNode; defaultLabel: string }
> = {
  verified: {
    bg: 'bg-emerald-50',
    text: 'text-success',
    icon: <CheckCircle2 className="h-3 w-3" />,
    defaultLabel: 'Verified',
  },
  unverified: {
    bg: 'bg-amber-50',
    text: 'text-warning',
    icon: <AlertTriangle className="h-3 w-3" />,
    defaultLabel: 'Unverified',
  },
  equity: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: <Diamond className="h-3 w-3" />,
    defaultLabel: 'Equity',
  },
  new: {
    bg: 'bg-orange-50',
    text: 'text-coral-400',
    icon: <Sparkles className="h-3 w-3" />,
    defaultLabel: 'New',
  },
  pending: {
    bg: 'bg-amber-50',
    text: 'text-warning',
    icon: <Clock className="h-3 w-3" />,
    defaultLabel: 'Pending',
  },
  approved: {
    bg: 'bg-emerald-50',
    text: 'text-success',
    icon: <CheckCircle2 className="h-3 w-3" />,
    defaultLabel: 'Approved',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-danger',
    icon: <XCircle className="h-3 w-3" />,
    defaultLabel: 'Rejected',
  },
};

export function Badge({ variant, children, className }: BadgeProps) {
  const { bg, text, icon, defaultLabel } = config[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
        bg,
        text,
        className,
      )}
    >
      {icon}
      {children ?? defaultLabel}
    </span>
  );
}
