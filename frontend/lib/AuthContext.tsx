'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

export interface User {
  user_id: number;
  name: string;
  email: string;
  role: 'OWNER' | 'CUSTOMER' | string;
  phone?: string;
  status?: string;
  subscription?: {
    plan_id?: number;
    plan_name: string;
    max_courts: number | null;
    max_bookings_per_month: number | null;
    status: string;
  } | null;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  role: 'OWNER' | 'CUSTOMER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; role?: string; user?: User }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string; errors?: Record<string, string[]>; role?: string; user?: User }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  setAuth: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuth = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lapangin_token', newToken);
      localStorage.setItem('lapangin_user', JSON.stringify(newUser));
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `lapangin_token=${encodeURIComponent(newToken)}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    }
  };

  // Ambil user dan token dari localStorage saat pertama kali aplikasi dimuat
  useEffect(() => {
    const savedToken = localStorage.getItem('lapangin_token');
    const savedUser = localStorage.getItem('lapangin_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('lapangin_token');
        localStorage.removeItem('lapangin_user');
      }
    }
    setIsLoading(false);
  }, []);

  const refreshUser = async () => {
    const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapangin_token') : null);
    if (!currentToken) return;
    try {
      const res = await api.get('/me', currentToken);
      if (res.success && res.user) {
        setAuth(currentToken, res.user);
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/login', { email, password });
      if (res.success && res.token && res.user) {
        setAuth(res.token, res.user);
        return { success: true, role: res.user.role, user: res.user };
      }
      return { success: false, message: res.message || 'Email atau password salah.' };
    } catch {
      return { success: false, message: 'Terjadi kesalahan jaringan atau server.' };
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const res = await api.post('/register', payload);
      if (res.success && res.token && res.user) {
        setAuth(res.token, res.user);
        return { success: true, role: res.user.role, user: res.user };
      }
      return {
        success: false,
        message: res.message || 'Gagal melakukan registrasi.',
        errors: res.errors,
      };
    } catch {
      return { success: false, message: 'Terjadi kesalahan jaringan atau server.' };
    }
  };

  const logout = async () => {
    const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapangin_token') : null);
    if (currentToken) {
      try {
        await api.post('/logout', {}, currentToken);
      } catch {
        // Abaikan error saat logout
      }
    }
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lapangin_token');
      localStorage.removeItem('lapangin_user');
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `lapangin_token=; path=/; max-age=0; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, refreshUser, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}