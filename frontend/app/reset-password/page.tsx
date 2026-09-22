"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token || !email) {
      setErrorMessage("Tautan reset kata sandi tidak lengkap atau tidak valid. Silakan minta tautan baru.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Kata sandi minimal harus 8 karakter.");
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (res?.success || res?.status === "success") {
        setIsSuccess(true);
      } else {
        setErrorMessage(res?.message || "Gagal mengatur ulang kata sandi. Token mungkin sudah kedaluwarsa.");
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      setErrorMessage(err?.message || "Terjadi kesalahan saat menghubungi server backend.");
    } finally {
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
              <Image src="/logo.png" alt="Lapangin Logo" fill className="object-cover" priority />
            </div>
            <span className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">Lapangin</span>
          </Link>
          <h1 className="text-xl font-bold text-[#0b1c30]">Atur Sandi Baru</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Silakan masukkan kata sandi baru untuk akun {email ? <span className="font-semibold text-gray-700">{email}</span> : "Anda"}
          </p>
        </div>

        {/* Sukses Box */}
        {isSuccess ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Kata Sandi Berhasil Diperbarui!</p>
                <p className="text-emerald-700 leading-relaxed">
                  Kata sandi baru Anda telah tersimpan. Silakan masuk menggunakan kata sandi tersebut.
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full py-3 px-4 rounded-xl bg-[#006e2f] hover:bg-[#005321] text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              Masuk Sekarang
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Input Password Baru */}
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  disabled={isLoading}
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-3 focus:ring-[#006e2f]/10 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-hidden"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Input Konfirmasi Password */}
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  disabled={isLoading}
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-3 focus:ring-[#006e2f]/10 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-hidden"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#006e2f] hover:bg-[#005321] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Sandi...</span>
                </>
              ) : (
                <span>Simpan Kata Sandi Baru</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#006e2f] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Batal dan Kembali ke Login
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4 sm:p-6">
      <Suspense fallback={<div className="min-h-screen bg-[#f8f9ff]" />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}