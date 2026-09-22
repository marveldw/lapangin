'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah, formatRupiahCompact, formatDateIndo } from '@/lib/formatters';
import Link from 'next/link';

interface DashboardStats {
  total_courts: number;
  total_bookings: number;
  pending_bookings?: number;
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

interface WeeklyTrend {
  label: string;
  amount: number;
  heightPercent: number;
}

export default function Dashboard() {
  const { token, user, isLoading: authLoading } = useAuth();
  const isStaff = user?.role?.toUpperCase() === 'STAFF';

  const [stats, setStats] = useState<DashboardStats>({
    total_courts: 0,
    total_bookings: 0,
    pending_bookings: 0,
    today_bookings: 0,
    today_revenue: 0,
    monthly_revenue: 0,
  });

  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'PENDING'>('ALL');
  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([
    { label: 'Minggu 1', amount: 0, heightPercent: 0 },
    { label: 'Minggu 2', amount: 0, heightPercent: 0 },
    { label: 'Minggu 3', amount: 0, heightPercent: 0 },
    { label: 'Minggu 4', amount: 0, heightPercent: 0 },
  ]);
  const [maxScale, setMaxScale] = useState<number>(1000000);
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

          // Kalkulasi Tren Mingguan (Bulan Ini)
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth();

          let w1 = 0;
          let w2 = 0;
          let w3 = 0;
          let w4 = 0;

          bookingList.forEach((b: BookingItem) => {
            const isConfirmedOrCompleted = b.status === 'CONFIRMED' || b.status === 'COMPLETED';
            if (!isConfirmedOrCompleted || !b.booking_date) return;

            const dateParts = b.booking_date.split('-');
            let bYear: number;
            let bMonth: number;
            let bDay: number;

            if (dateParts.length >= 3) {
              bYear = parseInt(dateParts[0], 10);
              bMonth = parseInt(dateParts[1], 10) - 1;
              bDay = parseInt(dateParts[2], 10);
            } else {
              const d = new Date(b.booking_date);
              bYear = d.getFullYear();
              bMonth = d.getMonth();
              bDay = d.getDate();
            }

            if (bYear === currentYear && bMonth === currentMonth) {
              const amount = Math.abs(Number(b.price) || 0);
              if (bDay >= 1 && bDay <= 7) {
                w1 += amount;
              } else if (bDay >= 8 && bDay <= 14) {
                w2 += amount;
              } else if (bDay >= 15 && bDay <= 21) {
                w3 += amount;
              } else {
                w4 += amount;
              }
            }
          });

          const maxVal = Math.max(w1, w2, w3, w4);
          const scale = maxVal > 0 ? maxVal : 500000;
          setMaxScale(scale);

          setWeeklyTrends([
            {
              label: 'Minggu 1',
              amount: w1,
              heightPercent: maxVal > 0 ? Math.round((w1 / maxVal) * 100) : 0,
            },
            {
              label: 'Minggu 2',
              amount: w2,
              heightPercent: maxVal > 0 ? Math.round((w2 / maxVal) * 100) : 0,
            },
            {
              label: 'Minggu 3',
              amount: w3,
              heightPercent: maxVal > 0 ? Math.round((w3 / maxVal) * 100) : 0,
            },
            {
              label: 'Minggu 4',
              amount: w4,
              heightPercent: maxVal > 0 ? Math.round((w4 / maxVal) * 100) : 0,
            },
          ]);
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
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-emerald-50/50 rounded-xl"></div>)}
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

      {/* 5 Cards Ringkasan Dashboard — Termasuk Status Pending */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

        {/* Card 1: Total Lapangan */}
        <div className="bg-white rounded-2xl p-5 border border-[#bccbb9]/40 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="text-[#3d4a3d] text-xs font-semibold">
            Total Lapangan
          </div>
          <div className="text-[#0b1c30] text-3xl font-extrabold tracking-tight mt-1">
            {stats.total_courts}
          </div>
          <div className="text-emerald-700 text-xs font-medium mt-1">
            {stats.total_courts > 0 ? `${stats.total_courts} Lapangan Aktif` : 'Belum ada'}
          </div>
        </div>

        {/* Card 2: Booking Hari Ini */}
        <div className="bg-white rounded-2xl p-5 border border-[#bccbb9]/40 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="text-[#3d4a3d] text-xs font-semibold">
            Booking Hari Ini
          </div>
          <div className="text-[#0b1c30] text-3xl font-extrabold tracking-tight mt-1">
            {stats.today_bookings}
          </div>
          <div className="text-emerald-700 text-xs font-medium mt-1">
            Total: {stats.total_bookings}
          </div>
        </div>

        {/* Card 3: Status PENDING (Menunggu Pembayaran / Approval) */}
        <div className="bg-white rounded-2xl p-5 border border-[#bccbb9]/40 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="text-[#3d4a3d] text-xs font-semibold">
            Menunggu Konfirmasi
          </div>
          <div className="text-[#0b1c30] text-3xl font-extrabold tracking-tight mt-1">
            {stats.pending_bookings || 0}
          </div>
          <div className={`text-xs font-semibold mt-1 ${(stats.pending_bookings || 0) > 0 ? 'text-amber-600' : 'text-[#3d4a3d]'}`}>
            {(stats.pending_bookings || 0) > 0 ? `${stats.pending_bookings} menunggu pembayaran` : 'Tidak ada antrian'}
          </div>
        </div>

        {/* Card 4 & 5: Finansial untuk Owner / Operasional untuk Staff */}
        {!isStaff ? (
          <>
            {/* Card 4: Pendapatan Hari Ini */}
            <div className="bg-gradient-to-br from-[#006e2f] via-[#005e28] to-[#00451b] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
              <span className="material-symbols-outlined text-white/10 text-5xl absolute -right-2 -bottom-2 pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              <div className="text-white/80 text-xs font-semibold uppercase tracking-wider relative z-10">
                Pendapatan Hari Ini
              </div>
              <div className="text-white text-2xl font-extrabold tracking-tight mt-1.5 relative z-10">
                {formatRupiahCompact(stats.today_revenue || 0)}
              </div>
              <div className="text-white/70 text-[11px] font-medium mt-1 relative z-10">
                {formatRupiah(stats.today_revenue || 0)}
              </div>
            </div>

            {/* Card 5: Pendapatan Bulan Ini */}
            <div className="bg-gradient-to-br from-[#006e2f] via-[#005e28] to-[#00451b] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
              <span className="material-symbols-outlined text-white/10 text-5xl absolute -right-2 -bottom-2 pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              <div className="text-white/80 text-xs font-semibold uppercase tracking-wider relative z-10">
                Pendapatan Bulan Ini
              </div>
              <div className="text-white text-2xl font-extrabold tracking-tight mt-1.5 relative z-10">
                {formatRupiahCompact(stats.monthly_revenue || 0)}
              </div>
              <div className="text-white/70 text-[11px] font-medium mt-1 relative z-10">
                {formatRupiah(stats.monthly_revenue || 0)}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Card 4 (Staff): Kelola Jadwal Operasional */}
            <Link href="/owner/jadwal" className="bg-gradient-to-br from-[#006e2f] via-[#005e28] to-[#00451b] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
              <span className="material-symbols-outlined text-white/10 text-5xl absolute -right-2 -bottom-2 pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
              <div className="text-white/80 text-xs font-semibold uppercase tracking-wider relative z-10 flex items-center justify-between">
                <span>Jadwal Operasional</span>
                <span className="material-symbols-outlined text-sm text-white/70">calendar_month</span>
              </div>
              <div className="text-white text-xl font-extrabold tracking-tight relative z-10 mt-1.5">
                Atur Jadwal
              </div>
              <div className="text-white/70 text-[11px] font-medium mt-1 relative z-10 flex items-center gap-1">
                Buka Kalender Lapangan &rarr;
              </div>
            </Link>

            {/* Card 5 (Staff): Konfirmasi Booking */}
            <Link href="/owner/booking" className="bg-gradient-to-br from-[#006e2f] via-[#005e28] to-[#00451b] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
              <span className="material-symbols-outlined text-white/10 text-5xl absolute -right-2 -bottom-2 pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
              <div className="text-white/80 text-xs font-semibold uppercase tracking-wider relative z-10 flex items-center justify-between">
                <span>Konfirmasi Booking</span>
                <span className="material-symbols-outlined text-sm text-white/70">confirmation_number</span>
              </div>
              <div className="text-white text-xl font-extrabold tracking-tight relative z-10 mt-1.5">
                Kelola Pesanan
              </div>
              <div className="text-white/70 text-[11px] font-medium mt-1 relative z-10 flex items-center gap-1">
                Lihat Semua Booking &rarr;
              </div>
            </Link>
          </>
        )}

      </div>

      {/* Grid Utama: Kiri (Span 2) & Kanan (Span 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Konten Kiri */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Grafik Tren Pendapatan (Owner) / Panel Operasional (Staff) */}
          {!isStaff ? (
            <div className="bg-white rounded-2xl shadow-sm border border-[#bccbb9]/40 flex flex-col h-[320px]">
              <div className="p-5 pb-0 flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#0b1c30]">Tren Pendapatan</h3>
                <span className="bg-emerald-50/60 text-[#006e2f] border border-emerald-200/60 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Bulan Ini
                </span>
              </div>

              <div className="flex-1 px-5 pb-8 pt-4 flex">
                {/* Sumbu Y (Skala Rupiah) */}
                <div className="flex flex-col justify-between text-[10px] font-bold text-[#3d4a3d]/60 pb-1 pr-4 text-right shrink-0 h-full">
                  <span>{formatRupiahCompact(maxScale)}</span>
                  <span>{formatRupiahCompact(maxScale * 0.75)}</span>
                  <span>{formatRupiahCompact(maxScale * 0.5)}</span>
                  <span>{formatRupiahCompact(maxScale * 0.25)}</span>
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
                  {weeklyTrends.map((bar, i) => (
                    <div key={i} className="relative flex flex-col items-center flex-1 h-full justify-end group z-10">

                      {/* Tooltip Angka Detail */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-[#0b1c30] text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-md whitespace-nowrap pointer-events-none z-20">
                        {formatRupiah(bar.amount)}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0b1c30]"></div>
                      </div>

                      {/* Balok Grafik */}
                      <div
                        className="w-10 sm:w-16 md:w-20 bg-[#006e2f]/80 hover:bg-[#006e2f] rounded-t-md transition-all duration-300 cursor-pointer"
                        style={{ height: `${Math.max(bar.heightPercent, bar.amount > 0 ? 8 : 2)}%` }}
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
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-[#bccbb9]/40 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#006e2f] font-bold text-xs uppercase tracking-wider mb-1">
                  <span className="material-symbols-outlined text-base">support_agent</span>
                  Fokus Operasional Harian
                </div>
                <h3 className="text-lg font-bold text-[#0b1c30]">Tugas & Aktivitas Staf</h3>
                <p className="text-xs text-[#3d4a3d] mt-1 leading-relaxed">
                  Pantau ketersediaan slot lapangan, verifikasi konfirmasi reservasi pelanggan, dan kelola jadwal bermain secara real-time.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <Link href="/owner/booking" className="p-4 rounded-xl bg-slate-50/60 border border-[#bccbb9]/30 hover:bg-emerald-50/40 transition-colors flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined">pending_actions</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#0b1c30]">Konfirmasi Booking</p>
                    <p className="text-[11px] text-[#3d4a3d]">{stats.pending_bookings || 0} booking perlu tindakan</p>
                  </div>
                </Link>
                <Link href="/owner/jadwal" className="p-4 rounded-xl bg-slate-50/60 border border-[#bccbb9]/30 hover:bg-emerald-50/40 transition-colors flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#006e2f]/10 text-[#006e2f] flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined">event_available</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#0b1c30]">Jadwal Hari Ini</p>
                    <p className="text-[11px] text-[#3d4a3d]">{stats.today_bookings} jadwal terjadwal</p>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Tabel Booking Terbaru (Dirapikan) */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm border border-[#bccbb9]/30 overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#bccbb9]/20 bg-[#ffffff]">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-semibold text-[#0b1c30]">Booking Terbaru</h3>
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setBookingFilter('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${bookingFilter === 'ALL'
                        ? 'bg-white text-[#006e2f] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Semua ({recentBookings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingFilter('PENDING')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${bookingFilter === 'PENDING'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-amber-800 hover:text-amber-900'
                      }`}
                  >
                    Pending ({stats.pending_bookings || 0})
                  </button>
                </div>
              </div>
              <Link href="/owner/booking" className="text-[#006e2f] text-sm font-semibold tracking-wide hover:text-[#006e2f]/80 transition-colors flex items-center gap-1">
                Lihat Semua <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-[#3d4a3d] text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-4 pl-6 border-b border-[#bccbb9]/20">Kode</th>
                    <th className="p-4 border-b border-[#bccbb9]/20">Pelanggan</th>
                    <th className="p-4 border-b border-[#bccbb9]/20">Lapangan</th>
                    <th className="p-4 border-b border-[#bccbb9]/20">Waktu</th>
                    <th className="p-4 border-b border-[#bccbb9]/20 text-center">Status</th>
                    {!isStaff ? (
                      <th className="p-4 pr-6 border-b border-[#bccbb9]/20 text-right">Harga</th>
                    ) : (
                      <th className="p-4 pr-6 border-b border-[#bccbb9]/20 text-right">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {(() => {
                    const displayed = bookingFilter === 'PENDING'
                      ? recentBookings.filter((b) => b.status === 'PENDING')
                      : recentBookings;
                    if (displayed.length === 0) {
                      return (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[#3d4a3d]">
                            {bookingFilter === 'PENDING' ? 'Tidak ada booking dengan status pending.' : 'Belum ada data booking.'}
                          </td>
                        </tr>
                      );
                    }
                    return displayed.map((b, index) => {
                      const customerName = b.customer?.name || 'Pelanggan';
                      const initial = customerName.charAt(0).toUpperCase();
                      const courtName = b.court ? `${b.court.name} (${b.court.sport_type})` : `Lapangan #${b.court_id}`;
                      const isEven = index % 2 === 0;

                      return (
                        <tr key={b.booking_id} className={`hover:bg-gray-50/70 transition-colors ${isEven ? 'bg-white' : 'bg-slate-50/50'}`}>
                          <td className="p-4 pl-6 text-xs font-bold text-[#3d4a3d] border-b border-[#bccbb9]/10">
                            #{b.booking_code || `BK-${b.booking_id}`}
                          </td>
                          <td className="p-4 border-b border-[#bccbb9]/10">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#006e2f] text-white flex items-center justify-center text-xs font-bold shrink-0">
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
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${b.status === 'CONFIRMED' || b.status === 'COMPLETED'
                                ? 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]' :
                                b.status === 'PENDING'
                                  ? 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]' :
                                  'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]'
                              }`}>
                              {b.status}
                            </span>
                          </td>
                          {!isStaff ? (
                            <td className="p-4 pr-6 border-b border-[#bccbb9]/10 text-right font-bold text-[#006e2f] text-sm">
                              {formatRupiah(b.price)}
                            </td>
                          ) : (
                            <td className="p-4 pr-6 border-b border-[#bccbb9]/10 text-right">
                              <Link href="/owner/booking" className="text-xs font-semibold text-[#006e2f] hover:underline flex items-center justify-end gap-1">
                                Kelola <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                              </Link>
                            </td>
                          )}
                        </tr>
                      );
                    });
                  })()}
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
              {!isStaff && (
                <Link href="/owner/lapangan/tambah" className="text-xs font-semibold text-[#006e2f] hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">add</span> Tambah
                </Link>
              )}
            </div>

            <div className="px-6 pb-4 flex gap-2 overflow-x-auto">
              {courts.length === 0 ? (
                <p className="text-xs text-[#3d4a3d]">Belum ada lapangan terdaftar</p>
              ) : (
                courts.map((court) => (
                  <button
                    key={court.court_id}
                    onClick={() => setSelectedCourtId(court.court_id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${selectedCourtId === court.court_id
                        ? 'bg-[#006e2f] text-white shadow-sm'
                        : 'bg-emerald-50/50 text-[#3d4a3d] hover:bg-emerald-100/60'
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
                  <p className="text-xs text-[#3d4a3d] mt-1 mb-4">
                    {!isStaff
                      ? 'Tambahkan lapangan pertama Anda untuk mulai menerima booking'
                      : 'Belum ada lapangan yang didaftarkan oleh venue owner'}
                  </p>
                  {!isStaff && (
                    <Link
                      href="/owner/lapangan/tambah"
                      className="inline-block bg-[#006e2f] text-white px-4 py-2 rounded-lg text-xs font-semibold"
                    >
                      + Tambah Lapangan
                    </Link>
                  )}
                </div>
              ) : (
                courts.map((c) => (
                  <div key={c.court_id} className="p-4 rounded-xl border border-[#bccbb9]/30 bg-slate-50/60 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm text-[#0b1c30]">{c.name}</p>
                      <p className="text-xs text-[#3d4a3d]">{c.sport_type} • Status: {c.status}</p>
                    </div>
                    <Link
                      href={`/owner/lapangan`}
                      className="p-2 text-[#006e2f] hover:bg-emerald-50/60 rounded-lg transition-colors"
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
              <span className="material-symbols-outlined text-[150px] text-[#006e2f]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
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