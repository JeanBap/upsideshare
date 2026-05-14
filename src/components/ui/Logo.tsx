'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

const dimensions: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 120, height: 24 },
  md: { width: 160, height: 32 },
  lg: { width: 220, height: 44 },
};

export function Logo({ size = 'md', className }: LogoProps) {
  const { width, height } = dimensions[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="UpsideShare"
    >
      {/* U - bolder */}
      <text
        x="0"
        y="34"
        fill="#534AB7"
        fontFamily="Inter, sans-serif"
        fontSize="32"
        fontWeight="800"
        letterSpacing="-0.02em"
      >
        U
      </text>
      {/* pside */}
      <text
        x="22"
        y="34"
        fill="#534AB7"
        fontFamily="Inter, sans-serif"
        fontSize="32"
        fontWeight="600"
        letterSpacing="-0.02em"
      >
        pside
      </text>
      {/* S - bolder */}
      <text
        x="118"
        y="34"
        fill="#534AB7"
        fontFamily="Inter, sans-serif"
        fontSize="32"
        fontWeight="800"
        letterSpacing="-0.02em"
      >
        S
      </text>
      {/* hare */}
      <text
        x="138"
        y="34"
        fill="#534AB7"
        fontFamily="Inter, sans-serif"
        fontSize="32"
        fontWeight="600"
        letterSpacing="-0.02em"
      >
        hare
      </text>
    </svg>
  );
}
