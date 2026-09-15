'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah } from '@/lib/formatters';
import QrisPaymentModal from '@/components/QrisPaymentModal';

interface PlanData {
  plan_id: number;
  name: string;
  description: string;
  price: number;
  max_courts: number | null;
  max_bookings_per_month: number | null;
  is_active: boolean;
}

export default function PengaturanPage() {
  const { user, token, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'PROFIL' | 'BANK' | 'SECURITY'>('PROFIL');
  const [name, setName] = useState(user?.name || 'Owner Venue');
  const [email, setEmail] = useState(user?.email || 'owner@lapangin.com');
  const [phone, setPhone] = useState(user?.phone || '081234567890');
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Bank Info
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState(user?.name || 'Owner Venue');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);

  // Subscription State
  const [plans, setPlans] = useState<PlanData[]>([
    {
      plan_id: 1,
      name: 'FREE',
      description: 'Paket Percobaan',
      price: 0,
      max_courts: 1,
      max_bookings_per_month: null,
      is_active: true,
    },
    {
      plan_id: 2,
      name: 'BASIC',
      description: 'Paket Standar',
      price: 49000,
      max_courts: 5,
      max_bookings_per_month: null,
      is_active: true,
    },
    {
      plan_id: 3,
      name: 'PRO',
      description: 'Paket Komplit',
      price: 99000,
      max_courts: null,
      max_bookings_per_month: null,
      is_active: true,
    },
  ]);
  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);
  const [qrisData, setQrisData] = useState<{
    orderId: string;
    grossAmount: number;
    qrUrl: string;
    qrString?: string;
    expiresAt?: string;
    planName?: string;
  } | null>(null);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/plans');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setPlans(res.data);
        }
      } catch {
        // Fallback default
      }
    }
    async function loadProfile() {
      if (!token) return;
      try {
        const res = await api.get('/profile', token);
        if (res.success && res.data) {
          setName(res.data.name || '');
          setEmail(res.data.email || '');
          setPhone(res.data.phone || '');
          if (res.data.bank?.bank_name) setBankName(res.data.bank.bank_name);
          if (res.data.bank?.account_number) setAccountNumber(res.data.bank.account_number);
          if (res.data.bank?.account_holder) setAccountHolder(res.data.bank.account_holder);
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      }
    }
    loadPlans();
    loadProfile();
  }, [token]);

  const handleSelectPlan = async (plan: PlanData) => {
    const currentPlanName = (user?.subscription?.plan_name || (user as any)?.plan || 'FREE').toUpperCase();
    if (currentPlanName === plan.name.toUpperCase()) {
      return;
    }

    setSubscriptionError(null);
    setSubscriptionSuccess(null);

    // Beralih ke paket FREE (Rp 0)
    if (plan.price <= 0) {
      if (!confirm('Apakah Anda yakin ingin beralih ke paket FREE? Kapasitas venue akan dibatasi maksimal 1 lapangan.')) {
        return;
      }

      setLoadingPlanId(plan.plan_id);
      try {
        const res = await api.post(`/subscriptions/${plan.plan_id}/pay`, {}, token);
        if (res.success) {
          await refreshUser();
          setSubscriptionSuccess('Berhasil beralih ke paket FREE.');
        } else {
          setSubscriptionError(res.message || 'Gagal beralih paket langganan.');
        }
      } catch {
        setSubscriptionError('Terjadi kendala jaringan saat memproses paket.');
      } finally {
        setLoadingPlanId(null);
      }
      return;
    }

    // Paket berbayar (BASIC / PRO) via Midtrans Dynamic QRIS
    setLoadingPlanId(plan.plan_id);
    try {
      const res = await api.post(`/subscriptions/${plan.plan_id}/pay`, {}, token);
      if (res.success && res.data) {
        setQrisData({
          orderId: res.data.order_id,
          grossAmount: res.data.gross_amount,
          qrUrl: res.data.qr_url,
          qrString: res.data.qr_string,
          expiresAt: res.data.expires_at,
          planName: plan.name,
        });
        setShowQrisModal(true);
      } else {
        setSubscriptionError(res.message || 'Gagal menyiapkan QRIS pembayaran langganan.');
      }
    } catch {
      setSubscriptionError('Terjadi kesalahan jaringan saat menghubungi payment gateway.');
    } finally {
      setLoadingPlanId(null);
    }
  };

  const handleQrisSuccess = async () => {
    setShowQrisModal(false);
    const planName = qrisData?.planName || 'baru';
    setQrisData(null);
    await refreshUser();
    setSubscriptionSuccess(`Selamat! Paket langganan ${planName} Anda telah aktif.`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    try {
      const res = await api.put('/profile', { name, email, phone }, token);
      if (res.success) {
        await refreshUser();
        setSavedSuccess('Profil akun berhasil diperbarui!');
        setTimeout(() => setSavedSuccess(null), 4000);
      } else {
        setProfileError(res.message || 'Gagal memperbarui profil.');
      }
    } catch {
      setProfileError('Terjadi gangguan koneksi saat menyimpan profil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setBankError('Konfirmasi kata sandi wajib diisi demi keamanan rekening pencairan.');
      return;
    }
    setIsSavingBank(true);
    setBankError(null);
    try {
      const res = await api.put(
        '/owner/payout-account',
        {
          current_password: currentPassword,
          bank_name: bankName,
          account_number: accountNumber,
          account_holder: accountHolder,
        },
        token
      );
      if (res.success) {
        setCurrentPassword('');
        setSavedSuccess('Rekening pencairan dana berhasil diperbarui dengan aman.');
        setTimeout(() => setSavedSuccess(null), 4000);
      } else {
        setBankError(res.message || 'Gagal memperbarui rekening pencairan.');
      }
    } catch {
      setBankError('Terjadi kesalahan saat memverifikasi perubahan rekening.');
    } finally {
      setIsSavingBank(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#0b1c30]">Pengaturan Profil Owner</h1>
        <p className="text-sm text-[#3d4a3d]">
          Kelola profil venue, rekening pencairan pendapatan, dan informasi paket langganan.
        </p>
      </div>

      {/* Tab Navigasi */}
      <div className="flex items-center gap-6 border-b border-[#bccbb9]/30 text-xs overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('PROFIL')}
          className={`pb-3 border-b-2 font-bold transition-colors cursor-pointer ${
            activeTab === 'PROFIL'
              ? 'border-[#006e2f] text-[#006e2f]'
              : 'border-transparent text-[#3d4a3d] hover:text-[#0b1c30]'
          }`}
        >
          Profil Venue
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('BANK')}
          className={`pb-3 border-b-2 font-bold transition-colors cursor-pointer ${
            activeTab === 'BANK'
              ? 'border-[#006e2f] text-[#006e2f]'
              : 'border-transparent text-[#3d4a3d] hover:text-[#0b1c30]'
          }`}
        >
          Rekening Pencairan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SECURITY')}
          className={`pb-3 border-b-2 font-bold transition-colors cursor-pointer ${
            activeTab === 'SECURITY'
              ? 'border-[#006e2f] text-[#006e2f]'
              : 'border-transparent text-[#3d4a3d] hover:text-[#0b1c30]'
          }`}
        >
          Paket Langganan
        </button>
      </div>

      {/* Success Banner */}
      {savedSuccess && (
        <div className="p-4 bg-[#22c55e]/20 text-[#004b1e] rounded-2xl text-xs font-bold flex items-center gap-2 border border-[#22c55e]/40 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* Container Utama */}
      <div className="bg-[#e5eeff] rounded-2xl shadow-sm p-6 md:p-8 flex flex-col gap-6 border border-white">
        {activeTab === 'PROFIL' && (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
            {profileError && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{profileError}</span>
              </div>
            )}

            {/* Logo Venue */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm relative group bg-white border-2 border-white shrink-0 flex items-center justify-center">
                <img alt="Logo" className="w-12 h-12 object-contain" src="/logo.png" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-bold text-sm text-[#0b1c30]">{name}</p>
                <p className="text-xs text-[#3d4a3d]">Venue Partner Lapangin</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#3d4a3d] uppercase tracking-wide">
                  Nama Venue / Nama Owner
                </label>
                <input
                  className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006e2f] transition-all shadow-sm font-medium"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#3d4a3d] uppercase tracking-wide">
                  Email Akun
                </label>
                <input
                  className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006e2f] transition-all shadow-sm font-medium"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-[#3d4a3d] uppercase tracking-wide">
                  Nomor WhatsApp / Seluler
                </label>
                <input
                  className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006e2f] transition-all shadow-sm md:w-1/2 font-medium"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 rounded-xl bg-[#006e2f] text-white font-bold text-xs hover:bg-[#005321] transition-colors shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'BANK' && (
          <form onSubmit={handleSaveBank} className="flex flex-col gap-5">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800 text-xs mb-2">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">security</span>
              <div>
                <p className="font-bold mb-0.5">Keamanan Rekening Pencairan Finansial</p>
                <p>
                  Rekening ini digunakan untuk pencairan pendapatan booking venue Anda. Perubahan rekening wajib mengonfirmasi kata sandi akun untuk mencegah pengalihan dana tidak sah.
                </p>
              </div>
            </div>

            {bankError && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{bankError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#3d4a3d] uppercase tracking-wide">
                  Nama Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006e2f] font-medium"
                >
                  <option value="BCA">BCA (Bank Central Asia)</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BNI">BNI</option>
                  <option value="BRI">BRI</option>
                  <option value="BSI">Bank Syariah Indonesia</option>
                  <option value="Jago">Bank Jago</option>
                  <option value="Seabank">SeaBank</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#3d4a3d] uppercase tracking-wide">
                  Nomor Rekening
                </label>
                <input
                  className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006e2f] font-medium tracking-wider"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Contoh: 8830192831"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-[#3d4a3d] uppercase tracking-wide">
                  Nama Lengkap Pemilik Rekening
                </label>
                <input
                  className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006e2f] md:w-1/2 font-medium"
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Sesuai nama di buku tabungan"
                  required
                />
              </div>

              {/* Konfirmasi Kata Sandi Akun untuk Keamanan Finansial */}
              <div className="flex flex-col gap-1.5 md:col-span-2 pt-2 border-t border-slate-200">
                <label className="text-[11px] font-bold text-red-700 uppercase tracking-wide flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">lock</span>
                  Konfirmasi Kata Sandi Saat Ini <span className="text-red-600">*</span>
                </label>
                <input
                  className="px-4 py-2.5 bg-white border border-red-300 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 md:w-1/2 font-medium"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun Anda untuk verifikasi"
                  required
                />
                <p className="text-[11px] text-slate-500">
                  Wajib memasukkan kata sandi akun untuk memvalidasi kepemilikan sebelum data rekening disimpan.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingBank}
                className="px-6 py-2.5 rounded-xl bg-[#006e2f] text-white font-bold text-xs hover:bg-[#005321] transition-colors shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                {isSavingBank ? 'Memverifikasi & Menyimpan...' : 'Verifikasi & Simpan Rekening'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'SECURITY' && (() => {
          const currentPlanName = (
            user?.subscription?.plan_name ||
            (user as any)?.plan ||
            'FREE'
          ).toUpperCase();

          const freePlan = plans.find((p) => p.name.toUpperCase() === 'FREE') || plans[0];
          const basicPlan = plans.find((p) => p.name.toUpperCase() === 'BASIC') || plans[1];
          const proPlan = plans.find((p) => p.name.toUpperCase() === 'PRO') || plans[2];

          // Fungsi dinamis menentukan batas lapangan sesuai paket aktif
          const getCourtsLimitText = () => {
            if (currentPlanName === 'FREE') return '1 Lapangan';
            if (currentPlanName === 'BASIC') return 'Hingga 5 Lapangan';
            if (currentPlanName === 'PRO') return 'Unlimited Lapangan';
            return user?.subscription?.max_courts ? `${user.subscription.max_courts} Lapangan` : 'Unlimited Lapangan';
          };

          return (
            <div className="flex flex-col gap-6">
              {/* Success & Error Banners for Subscription */}
              {subscriptionSuccess && (
                <div className="p-4 bg-[#22c55e]/20 text-[#004b1e] rounded-2xl text-xs font-bold flex items-center justify-between gap-2 border border-[#22c55e]/40 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>{subscriptionSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubscriptionSuccess(null)}
                    className="p-1 hover:bg-[#22c55e]/30 rounded-lg cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              )}

              {subscriptionError && (
                <div className="p-4 bg-[#ffdad6] text-[#ba1a1a] rounded-2xl text-xs font-bold flex items-center justify-between gap-2 border border-[#ba1a1a]/30 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">error</span>
                    <span>{subscriptionError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubscriptionError(null)}
                    className="p-1 hover:bg-[#ffdad6]/50 rounded-lg cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              )}

              {/* Status Info Saat Ini (Kuota Booking Sudah Dihapus, Kapasitas Lapangan Dinamis) */}
              <div className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-[#bccbb9]/30 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#006e2f]/10 text-[#006e2f] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0b1c30]">
                      Paket Anda Saat Ini: {currentPlanName}
                    </h3>
                    <p className="text-xs text-[#3d4a3d]">
                      Status:{' '}
                      <span className="font-bold text-[#006e2f]">
                        {user?.subscription?.status || 'ACTIVE'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#bccbb9]/30 text-xs">
                  <div className="p-3.5 bg-[#f8f9ff] rounded-xl flex items-center justify-between border border-[#bccbb9]/20">
                    <span className="text-[#3d4a3d] font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#006e2f] text-[18px]">stadium</span>
                      Batas Kapasitas Lapangan:
                    </span>
                    <span className="font-extrabold text-[#006e2f] text-sm">
                      {getCourtsLimitText()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Comparison Plan (3 Kolom - Kuota Booking Per Bulan Dihapus) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Free Plan */}
                <div className="bg-white border border-[#bccbb9]/40 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">FREE</p>
                  <h4 className="text-lg font-bold text-[#0b1c30] -mt-2">Paket Percobaan</h4>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-[#0b1c30]">{formatRupiah(freePlan.price)}</span>
                    <span className="text-xs text-[#3d4a3d] mb-1.5">/ bulan</span>
                  </div>
                  
                  <ul className="text-xs text-[#3d4a3d] flex flex-col gap-4 font-medium flex-1 mt-4">
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                      Maksimal 1 Lapangan
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                      Dashboard ringkasan dasar
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                      Validasi jadwal anti-bentrok
                    </li>
                  </ul>

                  {currentPlanName === 'FREE' ? (
                    <button
                      disabled
                      className="w-full mt-6 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Paket Aktif Saat Ini</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={loadingPlanId !== null}
                      onClick={() => handleSelectPlan(freePlan)}
                      className="w-full mt-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs cursor-pointer transition-colors"
                    >
                      {loadingPlanId === freePlan.plan_id ? 'Memproses...' : 'Beralih ke Free'}
                    </button>
                  )}
                </div>

                {/* Basic Plan (Recommended) */}
                <div className="bg-white border-2 border-[#006e2f] rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-lg transform lg:-translate-y-2">
                  <div className="absolute top-0 right-0 left-0 bg-[#006e2f] text-white text-[9px] font-extrabold py-1.5 text-center uppercase tracking-widest">
                    Rekomendasi
                  </div>
                  <p className="text-[10px] font-bold text-[#006e2f] uppercase tracking-widest mt-4">BASIC</p>
                  <h4 className="text-lg font-bold text-[#0b1c30] -mt-2">Paket Standar</h4>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-[#0b1c30]">{formatRupiah(basicPlan.price)}</span>
                    <span className="text-xs text-[#3d4a3d] mb-1.5">/ bulan</span>
                  </div>
                  
                  <ul className="text-xs text-[#3d4a3d] flex flex-col gap-4 font-medium flex-1 mt-4">
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                      Hingga 5 Lapangan
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                      Dashboard performa lengkap
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                      Laporan omzet harian & bulanan
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                      Manajemen status reservasi
                    </li>
                  </ul>

                  {currentPlanName === 'BASIC' ? (
                    <button
                      disabled
                      className="w-full mt-6 py-3 rounded-xl bg-[#006e2f]/10 border border-[#006e2f]/30 text-[#006e2f] font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Paket Aktif Saat Ini</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={loadingPlanId !== null}
                      onClick={() => handleSelectPlan(basicPlan)}
                      className="w-full mt-6 py-3 rounded-xl bg-[#006e2f] hover:bg-[#005321] text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {loadingPlanId === basicPlan.plan_id ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Menyiapkan QRIS...</span>
                        </>
                      ) : (
                        <span>{currentPlanName === 'PRO' ? 'Beralih ke Basic' : 'Pilih Basic'}</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Pro Plan */}
                <div className="bg-white border border-[#bccbb9]/40 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PRO</p>
                  <h4 className="text-lg font-bold text-[#0b1c30] -mt-2">Paket Komplit</h4>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-[#0b1c30]">{formatRupiah(proPlan.price)}</span>
                    <span className="text-xs text-[#3d4a3d] mb-1.5">/ bulan</span>
                  </div>
                  
                  <ul className="text-xs text-[#3d4a3d] flex flex-col gap-4 font-medium flex-1 mt-4">
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                      Unlimited Lapangan
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                      Laporan omzet & rekap data
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                      Customer Management
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                      Advanced Analytics
                    </li>
                  </ul>

                  {currentPlanName === 'PRO' ? (
                    <button
                      disabled
                      className="w-full mt-6 py-3 rounded-xl bg-[#006e2f]/10 border border-[#006e2f]/30 text-[#006e2f] font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Paket Aktif Saat Ini</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={loadingPlanId !== null}
                      onClick={() => handleSelectPlan(proPlan)}
                      className="w-full mt-6 py-3 rounded-xl bg-[#0b1c30] hover:bg-[#132d4b] text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {loadingPlanId === proPlan.plan_id ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Menyiapkan QRIS...</span>
                        </>
                      ) : (
                        <span>Upgrade ke Pro</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Modal QRIS Dinamis Langganan Paket */}
      {qrisData && (
        <QrisPaymentModal
          isOpen={showQrisModal}
          onClose={() => setShowQrisModal(false)}
          orderId={qrisData.orderId}
          grossAmount={qrisData.grossAmount}
          qrUrl={qrisData.qrUrl}
          qrString={qrisData.qrString}
          expiresAt={qrisData.expiresAt}
          title={`Langganan Paket ${qrisData.planName || ''}`}
          onSuccess={handleQrisSuccess}
        />
      )}
    </div>
  );
}