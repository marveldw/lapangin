'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { User, Mail, Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function CustomerProfilePage() {
  const { user, isLoading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ambil data profil terbaru dari database backend saat halaman dibuka
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await api.get('/profile');
        if (res?.success && res?.data) {
          setName(res.data.name || '');
          setEmail(res.data.email || '');
          setPhone(res.data.phone || '');
        } else if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
        }
      } catch (err) {
        // Fallback ke data session jika fetch gagal
        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
        }
      } finally {
        setIsFetching(false);
      }
    };

    if (!authLoading) {
      fetchLatestProfile();
    }
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    try {
      const res = await api.put('/profile', {
        name,
        email,
        phone,
      });

      if (res?.success) {
        setFeedback({ type: 'success', text: res.message || 'Profil berhasil diperbarui!' });

        // 1. Update ke key yang benar di localStorage
        if (typeof window !== 'undefined') {
          const currentStored = localStorage.getItem('lapangin_user');
          const parsed = currentStored ? JSON.parse(currentStored) : {};
          const merged = { ...parsed, ...res.data };
          localStorage.setItem('lapangin_user', JSON.stringify(merged));
          localStorage.setItem('user', JSON.stringify(merged));
        }

        // 2. Beri jeda 800ms agar user melihat notifikasi sukses, lalu reload otomatis untuk sinkronisasi Navbar
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setFeedback({ type: 'error', text: res?.message || 'Gagal memperbarui profil.' });
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Terjadi kesalahan saat menyimpan data.';
      setFeedback({ type: 'error', text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isFetching) {
    return <div className="min-h-screen bg-[#f8f9ff]" />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <Navbar />

      <main className="max-w-xl mx-auto pt-28 pb-16 px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
          
          {/* Header Profil */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-[#006e2f] text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-[#006e2f]/20">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0b1c30]">Profil Saya</h1>
              <p className="text-xs sm:text-sm text-gray-500">Kelola identitas akun dan kontak Anda</p>
            </div>
          </div>

          {/* Notifikasi Alert */}
          {feedback && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm animate-in fade-in duration-200 ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input Nama */}
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-3 focus:ring-[#006e2f]/10 transition-all"
                />
              </div>
            </div>

            {/* Input Email */}
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-3 focus:ring-[#006e2f]/10 transition-all"
                />
              </div>
            </div>

            {/* Input No HP (Wajib format Indonesia sesuai validasi backend) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#0b1c30]">
                  Nomor HP / WhatsApp
                </label>
                <span className="text-[11px] text-gray-400">Contoh: 08123456789</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-3 focus:ring-[#006e2f]/10 transition-all"
                />
              </div>
            </div>

            {/* Tombol Simpan */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 px-4 rounded-xl bg-[#006e2f] hover:bg-[#005321] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}