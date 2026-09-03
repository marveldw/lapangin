'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const POPULAR_SPORTS = [
  { name: 'Badminton', icon: 'sports_tennis', sport: 'Badminton', color: 'bg-emerald-500' },
  { name: 'Futsal', icon: 'sports_soccer', sport: 'Futsal', color: 'bg-blue-600' },
  { name: 'Basket', icon: 'sports_basketball', sport: 'Basket', color: 'bg-amber-500' },
  { name: 'Tenis', icon: 'sports_tennis', sport: 'Tenis', color: 'bg-lime-600' },
  { name: 'Mini Soccer', icon: 'sports_soccer', sport: 'Mini Soccer', color: 'bg-teal-600' },
  { name: 'Padel', icon: 'sports_tennis', sport: 'Padel', color: 'bg-cyan-600' },
  { name: 'Voli', icon: 'sports_volleyball', sport: 'Voli', color: 'bg-orange-500' },
];

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedSport) params.append('sport_type', selectedSport);
    router.push(`/lapangan?${params.toString()}`);
  };

  return (
    <div className="bg-[#f8f9ff] font-sans text-[#0b1c30] min-h-screen flex flex-col">
      <Navbar />

      <main className="w-full pt-16 flex-1">
        {/* Hero Section */}
        <section className="relative w-full min-h-[500px] flex items-center justify-center overflow-hidden py-16">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=1920&q=80')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1c30]/80 via-[#0b1c30]/60 to-[#f8f9ff]"></div>

          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
            <span className="px-4 py-1.5 rounded-full bg-[#006e2f]/80 text-white font-semibold text-xs mb-4 backdrop-blur-md border border-white/20">
              ⚡ Platform Booking Lapangan Olahraga #1 di Indonesia
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg leading-tight">
              Cari, Jadwalkan, & <br className="hidden sm:block" /> Main Tanpa Ribet
            </h1>
            <p className="text-base md:text-xl text-white/90 drop-shadow-md max-w-2xl mb-8">
              Pesan lapangan olahraga favoritmu secara real-time dengan garansi jadwal anti-bentrok.
            </p>

            {/* Quick Search Box */}
            <form
              onSubmit={handleSearch}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#bccbb9]/30 p-3 flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#3d4a3d]/60 text-[22px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari lapangan atau kota..."
                  className="w-full pl-11 pr-4 py-3 bg-[#f8f9ff] rounded-xl text-sm text-[#0b1c30] placeholder:text-[#3d4a3d]/60 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
                />
              </div>

              <div className="w-full sm:w-48 relative flex items-center">
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full py-3 pl-4 pr-10 bg-[#f8f9ff] rounded-xl text-sm text-[#0b1c30] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
                >
                  <option value="">Semua Olahraga</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Futsal">Futsal</option>
                  <option value="Basket">Basket</option>
                  <option value="Tenis">Tenis</option>
                  <option value="Mini Soccer">Mini Soccer</option>
                  <option value="Padel">Padel</option>
                  <option value="Voli">Voli</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 pointer-events-none text-[#3d4a3d]/60 text-[20px]">
                  expand_more
                </span>
              </div>

              <button
                type="submit"
                className="px-8 py-3 bg-[#006e2f] hover:bg-[#005321] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Cari</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          </div>
        </section>

        {/* Categories Section */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#0b1c30]">Cabang Olahraga Populer</h2>
              <p className="text-sm text-[#3d4a3d] mt-1">Pilih jenis olahraga favorit Anda</p>
            </div>
            <Link
              href="/lapangan"
              className="text-sm font-bold text-[#006e2f] hover:underline flex items-center gap-1"
            >
              <span>Jelajahi Semua Lapangan</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {POPULAR_SPORTS.map((s) => (
              <Link
                key={s.name}
                href={`/lapangan?sport_type=${encodeURIComponent(s.sport)}`}
                className="group bg-white rounded-2xl p-5 border border-[#bccbb9]/30 hover:border-[#006e2f] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-3 cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${s.color} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
                >
                  <span className="material-symbols-outlined text-[28px]">{s.icon}</span>
                </div>
                <span className="text-sm font-bold text-[#0b1c30] group-hover:text-[#006e2f] transition-colors">
                  {s.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Features / Why Lapangin */}
        <section className="bg-white border-y border-[#bccbb9]/30 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-[#0b1c30]">Mengapa Memilih Lapangin?</h2>
              <p className="text-sm text-[#3d4a3d] mt-2">
                Solusi terlengkap untuk para pemain dan pemilik venue olahraga di Indonesia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-[#f8f9ff] border border-[#bccbb9]/30 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#006e2f]/10 text-[#006e2f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">schedule</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b1c30]">Jadwal Real-Time</h3>
                <p className="text-sm text-[#3d4a3d] leading-relaxed">
                  Cek langsung ketersediaan slot jam per tanggal tanpa perlu chat admin berkali-kali.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#f8f9ff] border border-[#bccbb9]/30 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#005ac2]/10 text-[#005ac2] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">lock</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b1c30]">Anti-Bentrok Bergaransi</h3>
                <p className="text-sm text-[#3d4a3d] leading-relaxed">
                  Sistem database dengan row-level lock memastikan tidak akan terjadi double-booking pada slot yang sama.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#f8f9ff] border border-[#bccbb9]/30 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 text-[#004b1e] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">confirmation_number</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b1c30]">E-Ticket Instan</h3>
                <p className="text-sm text-[#3d4a3d] leading-relaxed">
                  Dapatkan kode booking instan dan bukti tiket digital untuk check-in langsung di lokasi venue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Owner Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="bg-gradient-to-r from-[#006e2f] to-[#005321] rounded-3xl p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="px-3.5 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-md">
                Khusus Pemilik Venue Olahraga
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3 mb-4 leading-tight">
                Punya Lapangan? Digitalkan Bisnismu Sekarang Gratis!
              </h2>
              <p className="text-sm md:text-base text-white/90 leading-relaxed">
                Daftarkan fasilitas olahraga Anda, atur jadwal, pantau pendapatan harian, dan jangkau ribuan pelanggan baru di kota Anda.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-[#006e2f] font-bold text-sm rounded-xl shadow-lg hover:bg-gray-100 transition-all text-center"
              >
                Daftar Sebagai Owner
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-sm rounded-xl transition-all text-center backdrop-blur-md"
              >
                Masuk Owner Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#bccbb9]/30 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Lapangin" className="w-6 h-6 object-contain" />
            <span className="text-sm font-bold text-[#006e2f]">Lapangin Indonesia</span>
            <span className="text-xs text-[#3d4a3d]">• Platform Sewa Lapangan Modern</span>
          </div>
          <p className="text-xs text-[#3d4a3d]">© 2026 Lapangin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}