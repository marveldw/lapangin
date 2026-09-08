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
                  className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006e2f] transition-all shadow-sm font-medium opacity-70 cursor-not-allowed"
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
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800 text-xs mb-2">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
              <p>
                Rekening ini akan digunakan oleh Lapangin untuk mentransfer dana pembayaran booking (pencairan otomatis setiap hari Senin).
              </p>
            </div>

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
          <div className="flex flex-col gap-6">
            {/* Status Info Saat Ini */}
            <div className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-[#bccbb9]/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#006e2f]/10 text-[#006e2f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0b1c30]">
                    Paket Anda Saat Ini: {user?.subscription?.plan_name || 'FREE'}
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

            {/* Price Comparison Plan (3 Kolom) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              {/* Free Plan */}
              <div className="bg-white border border-[#bccbb9]/40 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">FREE</p>
                <h4 className="text-lg font-bold text-[#0b1c30] -mt-2">Paket Percobaan</h4>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-[#0b1c30]">Rp 0</span>
                  <span className="text-xs text-[#3d4a3d] mb-1.5">/ bulan</span>
                </div>
                
                <ul className="text-xs text-[#3d4a3d] flex flex-col gap-4 font-medium flex-1 mt-4">
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                    Maksimal 1 Lapangan
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                    Hingga 30 booking/bulan
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
                <button
                  disabled
                  className="w-full mt-6 py-3 rounded-xl border-2 border-gray-200 text-gray-400 font-bold text-xs cursor-not-allowed"
                >
                  Mulai Free
                </button>
              </div>

              {/* Basic Plan (Recommended) */}
              <div className="bg-white border-2 border-[#006e2f] rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-lg transform lg:-translate-y-2">
                <div className="absolute top-0 right-0 left-0 bg-[#006e2f] text-white text-[9px] font-extrabold py-1.5 text-center uppercase tracking-widest">
                  Rekomendasi
                </div>
                <p className="text-[10px] font-bold text-[#006e2f] uppercase tracking-widest mt-4">BASIC</p>
                <h4 className="text-lg font-bold text-[#0b1c30] -mt-2">Paket Standar</h4>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-[#0b1c30]">Rp 49.000</span>
                  <span className="text-xs text-[#3d4a3d] mb-1.5">/ bulan</span>
                </div>
                
                <ul className="text-xs text-[#3d4a3d] flex flex-col gap-4 font-medium flex-1 mt-4">
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                    Hingga 5 Lapangan
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                    Unlimited Booking
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
                <button
                  className="w-full mt-6 py-3 rounded-xl bg-[#006e2f] hover:bg-[#005321] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Pilih Basic
                </button>
              </div>

              {/* Pro Plan */}
              <div className="bg-white border border-[#bccbb9]/40 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PRO</p>
                <h4 className="text-lg font-bold text-[#0b1c30] -mt-2">Paket Komplit</h4>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-[#0b1c30]">Rp 99.000</span>
                  <span className="text-xs text-[#3d4a3d] mb-1.5">/ bulan</span>
                </div>
                
                <ul className="text-xs text-[#3d4a3d] flex flex-col gap-4 font-medium flex-1 mt-4">
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                    Unlimited Lapangan
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#006e2f] text-[18px]">check</span>
                    Unlimited Booking
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
                <button
                  className="w-full mt-6 py-3 rounded-xl bg-white border border-[#bccbb9] hover:bg-gray-50 text-[#0b1c30] font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Pilih Pro
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}