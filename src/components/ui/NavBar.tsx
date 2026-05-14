'use client';

import React from 'react';
import {
  Home,
  Tag,
  DollarSign,
  User,
  BarChart3,
  Diamond,
  Settings,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'brand' | 'creator' | 'backoffice';

interface Tab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface NavBarProps {
  role: Role;
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

const iconClass = 'h-5 w-5';

const tabsByRole: Record<Role, Tab[]> = {
  creator: [
    { key: 'home', label: 'Home', icon: <Home className={iconClass} /> },
    { key: 'deals', label: 'Deals', icon: <Tag className={iconClass} /> },
    {
      key: 'earnings',
      label: 'Earnings',
      icon: <DollarSign className={iconClass} />,
    },
    { key: 'profile', label: 'Profile', icon: <User className={iconClass} /> },
  ],
  brand: [
    {
      key: 'revenue',
      label: 'Revenue',
      icon: <BarChart3 className={iconClass} />,
    },
    { key: 'deals', label: 'Deals', icon: <Tag className={iconClass} /> },
    {
      key: 'equity',
      label: 'Equity',
      icon: <Diamond className={iconClass} />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings className={iconClass} />,
    },
  ],
  backoffice: [
    { key: 'home', label: 'Home', icon: <Home className={iconClass} /> },
    { key: 'deals', label: 'Deals', icon: <Tag className={iconClass} /> },
    {
      key: 'store',
      label: 'Store',
      icon: <ShoppingBag className={iconClass} />,
    },
    { key: 'profile', label: 'Profile', icon: <User className={iconClass} /> },
  ],
};

export function NavBar({ role, activeTab, onTabChange }: NavBarProps) {
  const tabs = tabsByRole[role];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange?.(tab.key)}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-purple-600' : 'text-gray-400',
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
