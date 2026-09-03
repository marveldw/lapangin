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
        // Fetch Parallel: Stats, Bookings, dan Courts
        const [statsRes, bookingsRes, courtsRes] = await Promise.all([
          api.get('/dashboard', token),
          api.get('/bookings', token),
          api.get('/courts', token),
        ]);

        if (statsRes?.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (bookingsRes?.success) {
          const bookingList = bookingsRes.data?.data || bookingsRes.data || [];
          setRecentBookings(bookingList.slice(0, 5));
        }

        if (courtsRes?.success) {
          const courtsList = courtsRes.data?.data || courtsRes.data || [];
          setCourts(courtsList);
          if (courtsList.length > 0) {
            setSelectedCourtId(courtsList[0].court_id);
          }
        }
      } catch (err) {
        console.error('Gagal mengambil data dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && token) {
      loadDashboardData();
    }
  }, [token, authLoading]);

  // Loading Skeleton
  if (loading || authLoading) {
    return (
      <div className="flex flex-col w-full gap-8 pb-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#e5eeff]/70 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-white/70 rounded-xl"></div>
          <div className="h-96 bg-white/70 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      
      {/* 4 Cards Atas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Lapangan */}
        <div className="bg-[#e5eeff] rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-[#006e2f]/10 rounded-full blur-xl group-hover:bg-[#006e2f]/20 transition-colors"></div>
          <div className="flex items-center gap-2 text-[#3d4a3d]">
            <span className="material-symbols-outlined text-[20px]">stadium</span>
            <span className="text-sm font-semibold tracking-wide">Total Lapangan</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-[#0b1c30]">
            {stats.total_courts}
          </div>
          <div className="text-xs font-medium text-[#3d4a3d] mt-auto">
            {stats.total_courts > 0 ? `${stats.total_courts} Lapangan Aktif` : 'Belum ada lapangan'}
          </div>
        </div>

        {/* Card 2: Booking Hari Ini */}
        <div className="bg-[#e5eeff] rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-[#565e74]/10 rounded-full blur-xl group-hover:bg-[#565e74]/20 transition-colors"></div>
          <div className="flex items-center gap-2 text-[#3d4a3d]">
            <span className="material-symbols-outlined text-[20px]">event_available</span>
            <span className="text-sm font-semibold tracking-wide">Booking Hari Ini</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-[#0b1c30]">
            {stats.today_bookings}
          </div>
          <div className="text-xs font-medium text-[#006e2f] flex items-center gap-1 mt-auto">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Total: {stats.total_bookings} reservasi</span>
          </div>
        </div>

        {/* Card 3: Pendapatan Hari Ini */}
        <div className="bg-[#e5eeff] rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-[#005ac2]/10 rounded-full blur-xl group-hover:bg-[#005ac2]/20 transition-colors"></div>
          <div className="flex items-center gap-2 text-[#3d4a3d]">
            <span className="material-symbols-outlined text-[20px]">payments</span>
            <span className="text-sm font-semibold tracking-wide">Pendapatan Hari Ini</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-[#0b1c30]">
            {formatRupiahCompact(stats.today_revenue)}
          </div>
          <div className="text-xs font-medium text-[#3d4a3d] mt-auto">
            {formatRupiah(stats.today_revenue)}
          </div>
        </div>

        {/* Card 4: Pendapatan Bulan Ini */}
        <div className="bg-[#006e2f] rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group text-[#ffffff]">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <span className="material-symbols-outlined text-[120px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          </div>
          <div className="flex items-center gap-2 text-[#4ae176]">
            <span className="material-symbols-outlined text-[20px]">monitoring</span>
            <span className="text-sm font-semibold tracking-wide">Pendapatan Bulan Ini</span>
          </div>
          <div className="text-4xl font-bold tracking-tight z-10">
            {formatRupiahCompact(stats.monthly_revenue)}
          </div>
          <div className="text-xs font-medium text-[#4ae176] mt-auto z-10">
            {formatRupiah(stats.monthly_revenue)}
          </div>
        </div>

      </div>

      {/* Grid Utama: Grafik & Tabel (Kiri), Jadwal (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Konten Kiri */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Grafik Tren Pendapatan */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm flex flex-col h-[350px]">
            <div className="p-6 pb-2 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-[#0b1c30]">Tren Pendapatan</h3>
              <span className="bg-[#eff4ff] text-[#006e2f] text-xs font-semibold px-3 py-1 rounded-lg">
                Bulan Ini
              </span>
            </div>
            
            <div className="flex-1 px-6 pb-6 pt-2 flex flex-col">
              <div className="flex-1 relative w-full min-h-[150px]">
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
                  <defs>
                    <linearGradient id="gradientLineDash" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#006e2f" stopOpacity="0.2"></stop>
                      <stop offset="100%" stopColor="#006e2f" stopOpacity="0"></stop>
                    </linearGradient>
                  </defs>
                  <path d="M0,300 L0,250 C100,220 200,280 300,200 C400,120 500,180 600,150 C700,120 800,80 900,100 L1000,60 L1000,300 Z" fill="url(#gradientLineDash)"></path>
                  <path className="text-[#006e2f]" d="M0,250 C100,220 200,280 300,200 C400,120 500,180 600,150 C700,120 800,80 900,100 L1000,60" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                  <circle className="text-[#006e2f]" cx="300" cy="200" fill="#ffffff" r="5" stroke="currentColor" strokeWidth="3"></circle>
                  <circle className="text-[#006e2f]" cx="600" cy="150" fill="#ffffff" r="5" stroke="currentColor" strokeWidth="3"></circle>
                  <circle className="text-[#006e2f]" cx="900" cy="100" fill="#ffffff" r="5" stroke="currentColor" strokeWidth="3"></circle>
                </svg>
              </div>
              <div className="w-full flex justify-between pt-3 mt-2 border-t border-[#bccbb9]/30 font-semibold text-xs text-[#3d4a3d]">
                <span>Minggu 1</span>
                <span>Minggu 2</span>
                <span>Minggu 3</span>
                <span>Minggu 4</span>
              </div>
            </div>
          </div>

          {/* Tabel Booking Terbaru (Dinamis dari /api/bookings) */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 flex justify-between items-center bg-[#ffffff] sticky top-0 z-10">
              <h3 className="text-xl font-semibold text-[#0b1c30]">Booking Terbaru</h3>
              <Link href="/owner/booking" className="text-[#006e2f] text-sm font-semibold tracking-wide hover:text-[#006e2f]/80 transition-colors flex items-center gap-1">
                Lihat Semua <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] text-[#3d4a3d] text-xs font-medium uppercase tracking-wider">
                    <th className="p-4 font-semibold">Kode / ID</th>
                    <th className="p-4 font-semibold">Pelanggan</th>
                    <th className="p-4 font-semibold">Lapangan</th>
                    <th className="p-4 font-semibold">Waktu</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Harga</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-normal text-[#0b1c30]">
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#3d4a3d]">
                        Belum ada data booking.
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((b) => {
                      const customerName = b.customer?.name || 'Pelanggan';
                      const initial = customerName.charAt(0).toUpperCase();
                      const courtName = b.court ? `${b.court.name} (${b.court.sport_type})` : `Lapangan #${b.court_id}`;
                      const startTime = b.start_time?.slice(0, 5);
                      const endTime = b.end_time?.slice(0, 5);

                      return (
                        <tr key={b.booking_id} className="hover:bg-[#eff4ff]/50 transition-colors group cursor-pointer border-b border-[#bccbb9]/10">
                          <td className="p-4 text-sm font-semibold tracking-wide text-[#3d4a3d]">
                            #{b.booking_code || `BK-${b.booking_id}`}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#dae2fd] text-[#5c647a] flex items-center justify-center text-sm font-semibold tracking-wide">
                                {initial}
                              </div>
                              <div>
                                <p className="font-semibold text-[#0b1c30]">{customerName}</p>
                                {b.customer?.phone && (
                                  <p className="text-xs text-[#3d4a3d]">{b.customer.phone}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-medium">{courtName}</td>
                          <td className="p-4">
                            <div>{formatDateIndo(b.booking_date)}</div>
                            <div className="text-[#3d4a3d] text-xs font-medium">{startTime} - {endTime}</div>
                          </td>
                          <td className="p-4">
                            {b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#22c55e]/20 text-[#004b1e] text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f] mr-1.5"></span>{b.status}
                              </span>
                            ) : b.status === 'PENDING' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#d3e4fe] text-[#3d4a3d] text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#565e74] mr-1.5"></span>PENDING
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#ffdad6]/50 text-[#ba1a1a] text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] mr-1.5"></span>CANCELLED
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right font-semibold text-[#0b1c30]">
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
          
          {/* Jadwal & Daftar Lapangan */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 pb-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-[#0b1c30]">Lapangan Anda</h3>
              <Link href="/owner/lapangan/tambah" className="text-xs font-semibold text-[#006e2f] hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">add</span> Tambah
              </Link>
            </div>
            
            {/* Tabs Lapangan */}
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

          {/* Banner Upgrade Plan */}
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