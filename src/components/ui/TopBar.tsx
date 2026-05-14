'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function TopBar({
  title,
  showBack = false,
  onBack,
  rightAction,
  className,
}: TopBarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center border-b border-gray-200 bg-white px-4',
        className,
      )}
    >
      <div className="flex w-10 justify-start">
        {showBack && (
          <button
            onClick={onBack}
            className="rounded-[10px] p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      <h1 className="flex-1 text-center text-base font-semibold text-gray-900">
        {title}
      </h1>

      <div className="flex w-10 justify-end">{rightAction}</div>
    </header>
  );
}
