'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ token: string; reset_url: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.post('/forgot-password', { email });
      if (res?.success) {
        setSuccessData(res.data);
      } else {
        setErrorMessage(res?.message || 'Email tidak ditemukan dalam sistem.');
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setErrorMessage(err?.message || 'Terjadi kendala saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                <Image src="/logo.png" alt="Lapangin Logo" fill className="object-cover" priority />
              </div>
              <span className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">Lapangin</span>
            </Link>
            <h1 className="text-xl font-bold text-[#0b1c30]">Lupa Kata Sandi</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Masukkan email Anda untuk menerima tautan reset kata sandi
            </p>
          </div>

          {/* Success Box */}
          {successData ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs sm:text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Tautan Reset Berhasil Dibuat!</p>
                  <p className="text-emerald-700 leading-relaxed">
                    Token reset sandi telah digenerate untuk akun Anda. Silakan klik tombol di bawah untuk memasukkan kata sandi baru.
                  </p>
                </div>
              </div>

              <Link
                href={`/reset-password?token=${encodeURIComponent(successData.token)}&email=${encodeURIComponent(email)}`}
                className="w-full py-3 px-4 rounded-xl bg-[#006e2f] hover:bg-[#005321] text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                Lanjut Reset Kata Sandi
              </Link>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#006e2f] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Halaman Masuk
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#0b1c30] mb-1.5">
                  Alamat Email Terdaftar
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-3 focus:ring-[#006e2f]/10 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#006e2f] hover:bg-[#005321] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Kirim Tautan Reset</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#006e2f] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Halaman Masuk
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
