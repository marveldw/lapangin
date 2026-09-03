'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password);

    if (res.success) {
      if (res.role === 'OWNER') {
        router.push('/owner/dashboard');
      } else {
        router.push('/lapangan');
      }
    } else {
      setErrorMsg(res.message || 'Email atau password salah.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-[#bccbb9]/20">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center gap-2 mb-2">
            <img src="/logo.png" alt="Lapangin" className="h-9 w-auto object-contain" />
            <span className="text-2xl font-bold text-[#006e2f] tracking-tight">Lapangin</span>
          </div>
          <h1 className="text-xl font-bold text-[#0b1c30]">Masuk ke Akun Anda</h1>
          <p className="text-xs text-[#3d4a3d] mt-1">Platform Manajemen & Reservasi Lapangan</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-sm font-medium flex items-center gap-2 border border-[#ba1a1a]/20">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#3d4a3d] mb-1 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@lapangin.com"
              className="w-full px-4 py-2.5 rounded-xl border border-[#bccbb9]/50 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none text-sm text-[#0b1c30] bg-[#ffffff] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3d4a3d] mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-[#bccbb9]/50 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none text-sm text-[#0b1c30] bg-[#ffffff] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#006e2f] hover:bg-[#006e2f]/90 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#3d4a3d]">
          Belum punya akun?{' '}
          <Link href="/register" className="text-[#006e2f] font-semibold hover:underline">
            Daftar sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}