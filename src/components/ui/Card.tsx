'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'surface' | 'elevated' | 'purpleTint' | 'success';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  surface: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white border border-gray-200 shadow-md',
  purpleTint: 'bg-purple-50 border border-purple-200',
  success: 'bg-emerald-50 border border-success',
};

export function Card({
  variant = 'surface',
  className,
  children,
  onClick,
}: CardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'rounded-2xl p-4',
        variantStyles[variant],
        onClick &&
          'cursor-pointer transition-shadow hover:shadow-md active:scale-[0.99]',
        className,
      )}
    >
      {children}
    </div>
  );
}
