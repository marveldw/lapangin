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
    plan_name: string;
    max_courts: number;
    max_bookings_per_month: number;
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
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; role?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string; errors?: Record<string, string[]>; role?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!token) return;
    try {
      const res = await api.get('/me', token);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('lapangin_user', JSON.stringify(res.user));
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/login', { email, password });
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('lapangin_token', res.token);
        localStorage.setItem('lapangin_user', JSON.stringify(res.user));
        return { success: true, role: res.user.role };
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
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('lapangin_token', res.token);
        localStorage.setItem('lapangin_user', JSON.stringify(res.user));
        return { success: true, role: res.user.role };
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
    if (token) {
      try {
        await api.post('/logout', {}, token);
      } catch {
        // Abaikan error saat logout
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('lapangin_token');
    localStorage.removeItem('lapangin_user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}