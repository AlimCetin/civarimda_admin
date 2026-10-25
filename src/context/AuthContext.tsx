'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '../lib/types';
import api from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('civarimda_admin_user');
        const token = localStorage.getItem('civarimda_admin_token');

        if (token && storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);

          // Verify token silently
          try {
            const freshUser = await api.getMe();
            setUser(freshUser);
            localStorage.setItem('civarimda_admin_user', JSON.stringify(freshUser));
          } catch (e) {
            console.warn('Silent token verification failed, using cached session');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    if (!['admin', 'super_admin', 'moderator'].includes(res.user.role)) {
      api.removeToken();
      throw new Error('Erişim reddedildi: Bu panele sadece yöneticiler giriş yapabilir.');
    }
    setUser(res.user);
    router.push('/');
  };

  const logout = () => {
    api.removeToken();
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = !!user;
  const isAdmin = ['admin', 'super_admin'].includes(user?.role || '');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
