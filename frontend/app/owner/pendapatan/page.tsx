'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

interface DashboardStats {
  total_courts: number;
  total_bookings: number;
  today_bookings: number;
  today_revenue: number;
  monthly_revenue: number;
}

interface BookingItem {
  booking_id: number;
  booking_code: string;
  booking_date: string;
  start_time: string;
  price: number;
  status: string;
  customer?: {
    name: string;
  };
}

export default function PendapatanPage() {
  const { token } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    total_courts: 0,
    total_bookings: 0,
    today_bookings: 0,
    today_revenue: 0,
    monthly_revenue: 0,
  });
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function loadData() {
      setLoading(true);
      try {
        const [dashRes, bookRes] = await Promise.all([
          api.get('/dashboard', token),
          api.get('/bookings', token),
        ]);

        if (dashRes.success && dashRes.data) {
          setStats(dashRes.data);
        }
        if (bookRes.success && bookRes.data) {
          const items = Array.isArray(bookRes.data.data) ? bookRes.data.data : bookRes.data;
          setBookings(items || []);
        }
      } catch (err) {
        console.error('Failed to load income data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token]);

  // Recent confirmed transactions
  const recentTransactions = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'CONFIRMED')
      .slice(0, 10);
  }, [bookings]);

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0b1c30]">Laporan Pendapatan</h1>
          <p className="text-[#3d4a3d] text-sm mt-1">
            Pantau performa finansial dan transaksi terkini di venue Anda.
          </p>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Today */}
        <div className="bg-[#e5eeff] rounded-2xl p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-white">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#006e2f]/10 rounded-full blur-xl group-hover:bg-[#006e2f]/20 transition-colors"></div>
          <div>
            <p className="font-bold text-[11px] text-[#3d4a3d] uppercase tracking-wider">
              Pendapatan Hari Ini
            </p>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0b1c30] mt-2">
              {formatRupiah(stats.today_revenue)}
            </h2>
          </div>
          <div className="flex items-center gap-1 mt-4 bg-[#22c55e]/15 text-[#006e2f] px-2.5 py-1 rounded-full w-fit">
            <span className="material-symbols-outlined text-[16px]">payments</span>
            <span className="font-bold text-xs">{stats.today_bookings} booking hari ini</span>
          </div>
        </div>

        {/* Card 2: Monthly */}
        <div className="bg-[#e5eeff] rounded-2xl p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-white">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#005ac2]/10 rounded-full blur-xl group-hover:bg-[#005ac2]/20 transition-colors"></div>
          <div>
            <p className="font-bold text-[11px] text-[#3d4a3d] uppercase tracking-wider">
              Pendapatan Bulan Ini
            </p>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0b1c30] mt-2">
              {formatRupiah(stats.monthly_revenue)}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[#3d4a3d] text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px] text-[#006e2f]">
              account_balance_wallet
            </span>
            <span>Total akumulasi bulan berjalan</span>
          </div>
        </div>

        {/* Card 3: Total Bookings */}
        <div className="bg-[#e5eeff] rounded-2xl p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-white">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#565e74]/10 rounded-full blur-xl group-hover:bg-[#565e74]/20 transition-colors"></div>
          <div>
            <p className="font-bold text-[11px] text-[#3d4a3d] uppercase tracking-wider">
              Total Booking Aktif
            </p>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0b1c30] mt-2">
              {stats.total_bookings} Booking
            </h2>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[#3d4a3d] text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px] text-[#006e2f]">check_circle</span>
            <span>{stats.total_courts} Lapangan Aktif</span>
          </div>
        </div>
      </div>

      {/* Tabel Transaksi Terakhir */}
      <div className="bg-white border border-[#bccbb9]/30 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 flex items-center justify-between border-b border-[#bccbb9]/20">
          <div>
            <h3 className="text-lg font-bold text-[#0b1c30]">Transaksi Terkonfirmasi Terakhir</h3>
            <p className="text-xs text-[#3d4a3d]">Daftar pembayaran booking yang telah lunas</p>
          </div>
          <Link
            href="/owner/booking"
            className="font-bold text-xs text-[#006e2f] hover:underline"
          >
            Lihat Semua Booking
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-[#006e2f]">
            Memuat transaksi...
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-gray-400 text-[36px]">receipt_long</span>
            <p className="text-xs font-bold text-[#0b1c30]">Belum Ada Transaksi</p>
            <p className="text-[11px] text-[#3d4a3d]">
              Transaksi akan muncul setelah pelanggan melakukan booking.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs text-[#0b1c30]">
              <thead className="bg-[#f8f9ff] font-bold text-[#3d4a3d] border-b border-[#bccbb9]/30">
                <tr>
                  <th className="py-3 px-6">ID Booking</th>
                  <th className="py-3 px-6">Tanggal Main</th>
                  <th className="py-3 px-6">Nama Pelanggan</th>
                  <th className="py-3 px-6 text-right pr-6">Total Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#bccbb9]/20">
                {recentTransactions.map((tx) => (
                  <tr key={tx.booking_id} className="hover:bg-[#f8f9ff]/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#006e2f]">
                      #{tx.booking_code}
                    </td>
                    <td className="py-4 px-6">
                      {formatDateIndo(tx.booking_date)}, {tx.start_time.slice(0, 5)}
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      {tx.customer?.name || 'Pelanggan'}
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-[#006e2f] pr-6">
                      {formatRupiah(tx.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}