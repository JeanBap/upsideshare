'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Profile, UserRole } from '@/lib/types';

interface AuthContextValue {
  user: Profile | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: 'creator',
  setRole: () => {},
  loading: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('creator');
  const [loading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, role, setRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
