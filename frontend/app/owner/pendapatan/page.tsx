'use client';

import { useState, useEffect } from 'react';
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

const DUMMY_BLURRED_ROWS: BookingItem[] = [
  {
    booking_id: 1,
    booking_code: 'BKG-88219',
    booking_date: '2026-09-08',
    start_time: '18:00:00',
    price: 150000,
    status: 'CONFIRMED',
    customer: { name: 'Ahmad Fauzi' },
  },
  {
    booking_id: 2,
    booking_code: 'BKG-88220',
    booking_date: '2026-09-08',
    start_time: '19:00:00',
    price: 150000,
    status: 'CONFIRMED',
    customer: { name: 'Rian Pratama' },
  },
  {
    booking_id: 3,
    booking_code: 'BKG-88221',
    booking_date: '2026-09-07',
    start_time: '20:00:00',
    price: 200000,
    status: 'CONFIRMED',
    customer: { name: 'Budi Santoso' },
  },
  {
    booking_id: 4,
    booking_code: 'BKG-88222',
    booking_date: '2026-09-07',
    start_time: '16:00:00',
    price: 100000,
    status: 'CONFIRMED',
    customer: { name: 'Dimas Setiawan' },
  },
  {
    booking_id: 5,
    booking_code: 'BKG-88223',
    booking_date: '2026-09-06',
    start_time: '14:00:00',
    price: 120000,
    status: 'CONFIRMED',
    customer: { name: 'Hendra Wijaya' },
  },
];

export default function PendapatanPage() {
  const { token, user } = useAuth();
  
  const isFreePlan = user?.subscription?.plan_name === 'FREE' || !user?.subscription?.plan_name;

  const [stats, setStats] = useState<DashboardStats>({
    total_courts: 0,
    total_bookings: 0,
    today_bookings: 0,
    today_revenue: 0,
    monthly_revenue: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<BookingItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    api.get('/dashboard', token)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setStats(res.data);
        }
      })
      .catch((err) => console.error('Failed to load dashboard stats:', err))
      .finally(() => {
        if (isMounted) setLoadingStats(false);
      });

    api.get('/bookings?status=CONFIRMED&limit=10', token)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          const items = Array.isArray(res.data.data) ? res.data.data : res.data;
          setRecentTransactions(items || []);
        }
      })
      .catch((err) => console.error('Failed to load recent transactions:', err))
      .finally(() => {
        if (isMounted) setLoadingTx(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const displayTransactions = isFreePlan && recentTransactions.length === 0 
    ? DUMMY_BLURRED_ROWS 
    : recentTransactions;

  return (
    <div className="flex flex-col w-full gap-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-[#0b1c30]">Laporan Pendapatan</h1>
        <p className="text-[#3d4a3d] text-sm mt-1">
          Pantau performa finansial dan transaksi terkini di venue Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#e5eeff] rounded-2xl p-6 flex flex-col justify-between h-[190px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-white">
          <div className="absolute -right-4 -top-4 w-28 h-28 bg-[#006e2f]/10 rounded-full blur-xl group-hover:bg-[#006e2f]/20 transition-colors"></div>
          <div>
            <p className="font-bold text-[11px] text-[#3d4a3d] uppercase tracking-wider">
              Pendapatan Hari Ini
            </p>
            {loadingStats ? (
              <div className="h-9 w-40 bg-gray-300/60 animate-pulse rounded-lg mt-3"></div>
            ) : (
              <h2 className="text-3xl font-extrabold text-[#0b1c30] mt-3">
                {formatRupiah(stats.today_revenue)}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-[#22c55e]/15 text-[#006e2f] px-3 py-1.5 rounded-full w-fit">
            <span className="material-symbols-outlined text-[16px]">payments</span>
            <span className="font-bold text-xs">{stats.today_bookings} booking hari ini</span>
          </div>
        </div>

        <div className="bg-[#e5eeff] rounded-2xl p-6 flex flex-col justify-between h-[190px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-white">
          <div className="absolute -right-4 -top-4 w-28 h-28 bg-[#005ac2]/10 rounded-full blur-xl group-hover:bg-[#005ac2]/20 transition-colors"></div>
          <div>
            <p className="font-bold text-[11px] text-[#3d4a3d] uppercase tracking-wider">
              Pendapatan Bulan Ini
            </p>
            {loadingStats ? (
              <div className="h-9 w-40 bg-gray-300/60 animate-pulse rounded-lg mt-3"></div>
            ) : (
              <h2 className="text-3xl font-extrabold text-[#0b1c30] mt-3">
                {formatRupiah(stats.monthly_revenue)}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[#3d4a3d] text-xs font-semibold">
            <span className="material-symbols-outlined text-[18px] text-[#006e2f]">
              account_balance_wallet
            </span>
            <span>Total akumulasi bulan berjalan</span>
          </div>
        </div>

        <div className="bg-[#e5eeff] rounded-2xl p-6 flex flex-col justify-between h-[190px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-white">
          <div className="absolute -right-4 -top-4 w-28 h-28 bg-[#565e74]/10 rounded-full blur-xl group-hover:bg-[#565e74]/20 transition-colors"></div>
          <div>
            <p className="font-bold text-[11px] text-[#3d4a3d] uppercase tracking-wider">
              Total Booking Aktif
            </p>
            {loadingStats ? (
              <div className="h-9 w-32 bg-gray-300/60 animate-pulse rounded-lg mt-3"></div>
            ) : (
              <h2 className="text-3xl font-extrabold text-[#0b1c30] mt-3">
                {stats.total_bookings} Booking
              </h2>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[#3d4a3d] text-xs font-semibold">
            <span className="material-symbols-outlined text-[18px] text-[#006e2f]">check_circle</span>
            <span>{stats.total_courts} Lapangan Aktif</span>
          </div>
        </div>
      </div>

      <div className="relative bg-white border border-[#bccbb9]/30 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[460px]">
        <div className="p-6 flex items-center justify-between border-b border-[#bccbb9]/20 relative z-10 bg-white">
          <div>
            <h3 className="text-lg font-bold text-[#0b1c30]">Transaksi Terkonfirmasi Terakhir</h3>
            <p className="text-xs text-[#3d4a3d]">Daftar pembayaran booking yang telah lunas</p>
          </div>
          {!isFreePlan && (
            <Link
              href="/owner/booking"
              className="font-bold text-xs text-[#006e2f] hover:underline"
            >
              Lihat Semua Booking
            </Link>
          )}
        </div>

        <div className={`p-4 ${isFreePlan ? 'filter blur-[5px] select-none pointer-events-none opacity-40' : ''}`}>
          {loadingTx ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl w-full" />
              ))}
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
                  {displayTransactions.map((tx) => (
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

        {isFreePlan && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-white/30 backdrop-blur-[1px]">
            <div className="bg-white/95 p-8 rounded-2xl shadow-2xl border border-[#bccbb9]/40 max-w-md w-full text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#006e2f] text-white flex items-center justify-center shadow-md mb-1">
                <span className="material-symbols-outlined text-[28px]">lock</span>
              </div>
              <h3 className="text-xl font-bold text-[#0b1c30]">Laporan Detail Terkunci</h3>
              <p className="text-xs text-[#3d4a3d] leading-relaxed mb-3">
                Anda menggunakan <strong>Paket Free</strong>. Akses riwayat laporan transaksi lengkap dan unduh data Excel hanya tersedia untuk akun Pro atau Unlimited.
              </p>
              <Link
                href="/owner/pengaturan"
                className="bg-[#006e2f] hover:bg-[#005321] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">upgrade</span>
                Upgrade Paket Sekarang
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}