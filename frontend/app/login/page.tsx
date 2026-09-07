"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { setAuthSession } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const apiUrl = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Email atau password yang Anda masukkan salah.");
        setIsLoading(false);
        return;
      }

      // Save token and user profile
      if (data.token && data.user) {
        setAuthSession(data.token, data.user);
      }

      // Smart Redirect based on Role
      const role = data.user?.role;
      if (role === "ADMIN") {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        window.location.href = `${backendUrl}/admin`;
      } else if (role === "OWNER") {
        router.push(redirectParam || "/owner/dashboard");
      } else {
        // Customer
        router.push(redirectParam || "/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Gagal terhubung ke server. Pastikan server backend sedang aktif.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Lapangin Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">
              Lapangin
            </span>
          </Link>
          <h1 className="text-xl font-bold text-[#0b1c30]">Selamat Datang Kembali</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Masuk untuk sewa lapangan atau kelola venue Anda
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-3 text-red-700 text-xs sm:text-sm animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-[#0b1c30] mb-1.5"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-3 focus:ring-[#006e2f]/10 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#0b1c30]"
              >
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#006e2f] hover:underline"
              >
                Lupa sandi?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full pl-10 pr-11 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-3 focus:ring-[#006e2f]/10 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-hidden"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#006e2f] focus:ring-[#006e2f] accent-[#006e2f]"
              />
              <span className="text-xs text-gray-600">Ingat saya</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#006e2f] hover:bg-[#005321] active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-bold text-[#006e2f] hover:underline"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>

      </div>

      {/* Security Note */}
      <p className="text-center text-[11px] text-gray-400 mt-6">
        Dilindungi oleh enkripsi standar perbankan &amp; verifikasi data terpadu
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8f9ff] via-white to-white flex items-center justify-center p-4 sm:p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#006e2f]" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
