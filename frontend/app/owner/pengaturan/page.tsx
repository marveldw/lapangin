'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function PengaturanPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'PROFIL' | 'BANK' | 'SECURITY'>('PROFIL');
  const [name, setName] = useState(user?.name || 'Owner Venue');
  const [email, setEmail] = useState(user?.email || 'owner@lapangin.com');
  const [phone, setPhone] = useState(user?.phone || '081234567890');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Bank Info
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('8830192831');
  const [accountHolder, setAccountHolder] = useState(user?.name || 'Owner Venue');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#0b1c30]">Pengaturan Venue</h1>
        <p className="text-sm text-[#3d4a3d]">
          Kelola profil venue, rekening pencairan pendapatan, dan informasi paket langganan.
        </p>
      </div>

      {/* Tab Navigasi */}
      <div className="flex items-center gap-6 border-b border-[#bccbb9]/30 text-xs">
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
          <span>Pengaturan berhasil disimpan!</span>
        </div>
      )}

      {/* Container Utama */}
      <div className="bg-[#e5eeff] rounded-2xl shadow-sm p-6 md:p-8 flex flex-col gap-6 border border-white">
        {activeTab === 'PROFIL' && (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
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
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-[#3d4a3d] uppercase tracking-wide">
                  Nomor WhatsApp
                </label>
                <input
                  className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006e2f] transition-all shadow-sm md:w-1/2 font-medium"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#006e2f] text-white font-bold text-xs hover:bg-[#005321] transition-colors shadow-md cursor-pointer"
              >
                Simpan Profil
              </button>
            </div>
          </form>
        )}

        {activeTab === 'BANK' && (
          <form onSubmit={handleSave} className="flex flex-col gap-5">
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
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#3d4a3d] uppercase tracking-wide">
                  Nomor Rekening
                </label>
                <input
                  className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006e2f] font-medium"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-[#3d4a3d] uppercase tracking-wide">
                  Nama Pemilik Rekening
                </label>
                <input
                  className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006e2f] md:w-1/2 font-medium"
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#006e2f] text-white font-bold text-xs hover:bg-[#005321] transition-colors shadow-md cursor-pointer"
              >
                Simpan Rekening
              </button>
            </div>
          </form>
        )}

        {activeTab === 'SECURITY' && (
          <div className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-[#bccbb9]/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#006e2f]/10 text-[#006e2f] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#0b1c30]">
                  Paket Langganan: {user?.subscription?.plan_name || 'FREE'}
                </h3>
                <p className="text-xs text-[#3d4a3d]">
                  Status:{' '}
                  <span className="font-bold text-[#006e2f]">
                    {user?.subscription?.status || 'ACTIVE'}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#bccbb9]/30 text-xs">
              <div className="p-3 bg-[#f8f9ff] rounded-xl flex justify-between">
                <span className="text-[#3d4a3d]">Maksimal Lapangan:</span>
                <span className="font-bold text-[#0b1c30]">
                  {user?.subscription?.max_courts ?? 1} Lapangan
                </span>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl flex justify-between">
                <span className="text-[#3d4a3d]">Kuota Booking per Bulan:</span>
                <span className="font-bold text-[#0b1c30]">
                  {user?.subscription?.max_bookings_per_month ?? 30} Booking
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}