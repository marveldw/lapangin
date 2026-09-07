'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah, formatRupiahCompact, formatDateIndo } from '@/lib/formatters';
import Link from 'next/link';

interface DashboardStats {
  total_courts: number;
  total_bookings: number;
  today_bookings: number;
  today_revenue: number;
  monthly_revenue: number;
}

interface BookingItem {
  booking_id: number;
  booking_code?: string;
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | string;
  court?: {
    court_id: number;
    name: string;
    sport_type: string;
  };
  customer?: {
    customer_id: number;
    name: string;
    phone?: string;
  };
}

interface CourtItem {
  court_id: number;
  name: string;
  sport_type: string;
  status: string;
}

export default function Dashboard() {
  const { token, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    total_courts: 0,
    total_bookings: 0,
    today_bookings: 0,
    today_revenue: 0,
    monthly_revenue: 0,
  });

  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!token) return;
      setLoading(true);

      try {
        const [statsRes, bookingsRes, courtsRes] = await Promise.all([
          api.get('/dashboard', token),
          api.get('/bookings', token),
          api.get('/courts', token),
        ]);

        if (statsRes?.success && statsRes.data) setStats(statsRes.data);

        if (bookingsRes?.success) {
          const bookingList = bookingsRes.data?.data || bookingsRes.data || [];
          setRecentBookings(bookingList.slice(0, 5));
        }

        if (courtsRes?.success) {
          const courtsList = courtsRes.data?.data || courtsRes.data || [];
          setCourts(courtsList);
          if (courtsList.length > 0) setSelectedCourtId(courtsList[0].court_id);
        }
      } catch (err) {
        console.error('Gagal mengambil data dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && token) loadDashboardData();
  }, [token, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col w-full max-w-6xl mx-auto gap-8 pb-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-[#e5eeff]/70 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-white/70 rounded-xl"></div>
          <div className="h-96 bg-white/70 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto gap-8 pb-12">
      
      {/* 4 Cards Atas - Warna Original dengan Ukuran Proporsional */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Lapangan */}
        <div className="bg-[#e5eeff] rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-[#006e2f]/10 rounded-full blur-xl group-hover:bg-[#006e2f]/20 transition-colors"></div>
          <div className="flex items-center gap-2 text-[#3d4a3d] relative z-10">
            <span className="material-symbols-outlined text-[20px]">stadium</span>
            <span className="text-sm font-semibold tracking-wide">Total Lapangan</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-[#0b1c30] relative z-10">
            {stats.total_courts}
          </div>
          <div className="text-xs font-medium text-[#3d4a3d] mt-auto relative z-10">
            {stats.total_courts > 0 ? `${stats.total_courts} Lapangan Aktif` : 'Belum ada lapangan'}
          </div>
        </div>

        {/* Card 2: Booking Hari Ini */}
        <div className="bg-[#e5eeff] rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-[#565e74]/10 rounded-full blur-xl group-hover:bg-[#565e74]/20 transition-colors"></div>
          <div className="flex items-center gap-2 text-[#3d4a3d] relative z-10">
            <span className="material-symbols-outlined text-[20px]">event_available</span>
            <span className="text-sm font-semibold tracking-wide">Booking Hari Ini</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-[#0b1c30] relative z-10">
            {stats.today_bookings}
          </div>
          <div className="text-xs font-medium text-[#006e2f] flex items-center gap-1 mt-auto relative z-10">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Total: {stats.total_bookings} reservasi</span>
          </div>
        </div>

        {/* Card 3: Pendapatan Hari Ini */}
        <div className="bg-[#e5eeff] rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-[#005ac2]/10 rounded-full blur-xl group-hover:bg-[#005ac2]/20 transition-colors"></div>
          <div className="flex items-center gap-2 text-[#3d4a3d] relative z-10">
            <span className="material-symbols-outlined text-[20px]">payments</span>
            <span className="text-sm font-semibold tracking-wide">Pendapatan Hari Ini</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-[#0b1c30] relative z-10">
            {formatRupiahCompact(stats.today_revenue)}
          </div>
          <div className="text-xs font-medium text-[#3d4a3d] mt-auto relative z-10">
            {formatRupiah(stats.today_revenue)}
          </div>
        </div>

        {/* Card 4: Pendapatan Bulan Ini */}
        <div className="bg-[#006e2f] rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group text-[#ffffff]">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <span className="material-symbols-outlined text-[120px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          </div>
          <div className="flex items-center gap-2 text-[#4ae176] relative z-10">
            <span className="material-symbols-outlined text-[20px]">monitoring</span>
            <span className="text-sm font-semibold tracking-wide">Pendapatan Bulan Ini</span>
          </div>
          <div className="text-4xl font-bold tracking-tight z-10 relative">
            {formatRupiahCompact(stats.monthly_revenue)}
          </div>
          <div className="text-xs font-medium text-[#4ae176] mt-auto z-10 relative">
            {formatRupiah(stats.monthly_revenue)}
          </div>
        </div>

      </div>

      {/* Grid Utama: Kiri (Span 2) & Kanan (Span 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Konten Kiri */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Grafik Tren Pendapatan (Desain Baru: Bar Chart) */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#bccbb9]/40 flex flex-col h-[320px]">
            <div className="p-5 pb-0 flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#0b1c30]">Tren Pendapatan</h3>
              <span className="bg-[#f8f9ff] text-[#006e2f] border border-[#bccbb9]/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Bulan Ini
              </span>
            </div>
            
            <div className="flex-1 px-5 pb-8 pt-4 flex">
              {/* Sumbu Y (Skala Rupiah) */}
              <div className="flex flex-col justify-between text-[10px] font-bold text-[#3d4a3d]/60 pb-1 pr-4 text-right shrink-0 h-full">
                <span>Rp 10Jt</span>
                <span>Rp 7.5Jt</span>
                <span>Rp 5Jt</span>
                <span>Rp 2.5Jt</span>
                <span>Rp 0</span>
              </div>
              
              {/* Area Grafik Utama */}
              <div className="flex-1 relative flex items-end justify-between gap-2 border-b-2 border-[#bccbb9]/40 h-full">
                
                {/* Garis Bantu (Grid Lines) */}
                <div className="absolute inset-0 flex flex-col justify-between z-0">
                  <div className="w-full border-t border-dashed border-[#bccbb9]/60 h-0"></div>
                  <div className="w-full border-t border-dashed border-[#bccbb9]/60 h-0"></div>
                  <div className="w-full border-t border-dashed border-[#bccbb9]/60 h-0"></div>
                  <div className="w-full border-t border-dashed border-[#bccbb9]/60 h-0"></div>
                  <div className="w-full h-0"></div>
                </div>

                {/* Data Batang (Bars) */}
                {[
                  { label: 'Minggu 1', value: 'Rp 2.400.000', height: '24%' },
                  { label: 'Minggu 2', value: 'Rp 4.800.000', height: '48%' },
                  { label: 'Minggu 3', value: 'Rp 6.200.000', height: '62%' },
                  { label: 'Minggu 4', value: 'Rp 9.500.000', height: '95%' },
                ].map((bar, i) => (
                  <div key={i} className="relative flex flex-col items-center flex-1 h-full justify-end group z-10">
                    
                    {/* Tooltip Angka Detail */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-[#0b1c30] text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-md whitespace-nowrap pointer-events-none z-20">
                      {bar.value}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0b1c30]"></div>
                    </div>
                    
                    {/* Balok Grafik */}
                    <div 
                      className="w-10 sm:w-16 md:w-20 bg-[#006e2f]/80 hover:bg-[#006e2f] rounded-t-md transition-all duration-300 cursor-pointer"
                      style={{ height: bar.height }}
                    ></div>
                    
                    {/* Label Sumbu X */}
                    <div className="absolute -bottom-7 text-[11px] font-bold text-[#3d4a3d] whitespace-nowrap">
                      {bar.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabel Booking Terbaru (Dirapikan) */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm border border-[#bccbb9]/30 overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-[#bccbb9]/20 bg-[#ffffff]">
              <h3 className="text-xl font-semibold text-[#0b1c30]">Booking Terbaru</h3>
              <Link href="/owner/booking" className="text-[#006e2f] text-sm font-semibold tracking-wide hover:text-[#006e2f]/80 transition-colors flex items-center gap-1">
                Lihat Semua <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#f8f9ff] text-[#3d4a3d] text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-4 pl-6 border-b border-[#bccbb9]/20">Kode</th>
                    <th className="p-4 border-b border-[#bccbb9]/20">Pelanggan</th>
                    <th className="p-4 border-b border-[#bccbb9]/20">Lapangan</th>
                    <th className="p-4 border-b border-[#bccbb9]/20">Waktu</th>
                    <th className="p-4 border-b border-[#bccbb9]/20 text-center">Status</th>
                    <th className="p-4 pr-6 border-b border-[#bccbb9]/20 text-right">Harga</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#3d4a3d]">
                        Belum ada data booking.
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((b, index) => {
                      const customerName = b.customer?.name || 'Pelanggan';
                      const initial = customerName.charAt(0).toUpperCase();
                      const courtName = b.court ? `${b.court.name} (${b.court.sport_type})` : `Lapangan #${b.court_id}`;
                      const isEven = index % 2 === 0;

                      return (
                        <tr key={b.booking_id} className={`hover:bg-[#eff4ff]/60 transition-colors ${isEven ? 'bg-white' : 'bg-[#f8f9ff]/50'}`}>
                          <td className="p-4 pl-6 text-xs font-bold text-[#3d4a3d] border-b border-[#bccbb9]/10">
                            #{b.booking_code || `BK-${b.booking_id}`}
                          </td>
                          <td className="p-4 border-b border-[#bccbb9]/10">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#dae2fd] text-[#0b1c30] flex items-center justify-center text-xs font-bold shrink-0">
                                {initial}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-[#0b1c30] text-sm">{customerName}</span>
                                {b.customer?.phone && (
                                  <span className="text-[11px] text-[#3d4a3d]">{b.customer.phone}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 border-b border-[#bccbb9]/10 font-medium text-[#0b1c30] text-xs">
                            {courtName}
                          </td>
                          <td className="p-4 border-b border-[#bccbb9]/10">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#0b1c30] text-xs">{formatDateIndo(b.booking_date)}</span>
                              <span className="text-[#3d4a3d] text-[11px]">{b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)}</span>
                            </div>
                          </td>
                          <td className="p-4 border-b border-[#bccbb9]/10 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                              b.status === 'CONFIRMED' || b.status === 'COMPLETED' 
                                ? 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]' : 
                              b.status === 'PENDING' 
                                ? 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]' : 
                              'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 border-b border-[#bccbb9]/10 text-right font-bold text-[#006e2f] text-sm">
                            {formatRupiah(b.price)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Konten Kanan (Jadwal & Lapangan) */}
        <div className="flex flex-col gap-6">
          
          {/* Daftar Lapangan */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm border border-[#bccbb9]/30 overflow-hidden flex flex-col">
            <div className="p-6 pb-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-[#0b1c30]">Lapangan Anda</h3>
              <Link href="/owner/lapangan/tambah" className="text-xs font-semibold text-[#006e2f] hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">add</span> Tambah
              </Link>
            </div>
            
            <div className="px-6 pb-4 flex gap-2 overflow-x-auto">
              {courts.length === 0 ? (
                <p className="text-xs text-[#3d4a3d]">Belum ada lapangan terdaftar</p>
              ) : (
                courts.map((court) => (
                  <button
                    key={court.court_id}
                    onClick={() => setSelectedCourtId(court.court_id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      selectedCourtId === court.court_id
                        ? 'bg-[#006e2f] text-white shadow-sm'
                        : 'bg-[#eff4ff] text-[#3d4a3d] hover:bg-[#e5eeff]'
                    }`}
                  >
                    {court.name}
                  </button>
                ))
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[400px] px-6 pb-6 flex flex-col gap-3">
              {courts.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-[#3d4a3d]/40 mb-2">stadium</span>
                  <p className="text-sm font-semibold text-[#0b1c30]">Belum Ada Lapangan</p>
                  <p className="text-xs text-[#3d4a3d] mt-1 mb-4">Tambahkan lapangan pertama Anda untuk mulai menerima booking</p>
                  <Link 
                    href="/owner/lapangan/tambah"
                    className="inline-block bg-[#006e2f] text-white px-4 py-2 rounded-lg text-xs font-semibold"
                  >
                    + Tambah Lapangan
                  </Link>
                </div>
              ) : (
                courts.map((c) => (
                  <div key={c.court_id} className="p-4 rounded-xl border border-[#bccbb9]/30 bg-[#f8f9ff] flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm text-[#0b1c30]">{c.name}</p>
                      <p className="text-xs text-[#3d4a3d]">{c.sport_type} • Status: {c.status}</p>
                    </div>
                    <Link 
                      href={`/owner/lapangan`}
                      className="p-2 text-[#006e2f] hover:bg-[#e5eeff] rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Banner Promo / Akses Cepat */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm p-6 relative overflow-hidden flex flex-col justify-center border border-[#bccbb9]/20">
            <div className="absolute right-[-40px] bottom-[-40px] opacity-10">
              <span className="material-symbols-outlined text-[150px] text-[#005ac2]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
            </div>
            <h4 className="text-lg font-bold text-[#0b1c30] relative z-10 w-4/5">Kelola Jadwal & Booking Lebih Efisien</h4>
            <p className="text-xs text-[#3d4a3d] mt-1 relative z-10">Pantau operasional lapangan secara real-time dari satu dashboard.</p>
            <Link 
              href="/owner/jadwal" 
              className="mt-4 bg-[#006e2f] text-[#ffffff] px-5 py-2 rounded-lg text-xs font-semibold self-start relative z-10 hover:bg-[#006e2f]/90 transition-colors shadow-sm"
            >
              Buka Jadwal Lengkap
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}