'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { userAPI, tokenManager } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface UserContextType {
  user: any | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/login', '/signup', '/forgot-password', '/', '/auth/callback'];

  const refreshUser = async () => {
    const token = tokenManager.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await userAPI.getMe();
      if (response.success) {
        setUser(response.data);
      } else {
        tokenManager.removeToken();
        tokenManager.removeUserId();
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenManager.removeToken();
    tokenManager.removeUserId();
    setUser(null);
    router.push('/');
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Protection logic
  useEffect(() => {
    if (!loading && !user && !publicPaths.includes(pathname)) {
      router.push('/login');
    }
  }, [user, loading, pathname]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
