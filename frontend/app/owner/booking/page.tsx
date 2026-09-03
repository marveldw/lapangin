'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

interface BookingRecord {
  booking_id: number;
  booking_code: string;
  court_id: number;
  customer_id: number;
  user_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | string;
  notes: string | null;
  court?: {
    court_id: number;
    name: string;
    sport_type: string;
  };
  customer?: {
    customer_id: number;
    name: string;
    phone: string;
    email?: string | null;
  };
}

export default function OwnerBookingPage() {
  const { token } = useAuth();

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED'>('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'MONTH'>('ALL');

  // Modal Detail
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  // Updating action state
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchBookings = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/bookings', token);
      if (res.success && res.data) {
        const items = Array.isArray(res.data.data) ? res.data.data : res.data;
        setBookings(items || []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      setError('Gagal memuat data booking dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Update Status
  const handleUpdateStatus = async (bookingId: number, newStatus: 'CONFIRMED' | 'CANCELLED') => {
    if (!token) return;
    setActionLoadingId(bookingId);
    try {
      const res = await api.put(`/bookings/${bookingId}`, { status: newStatus }, token);
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.booking_id === bookingId ? { ...b, status: newStatus } : b))
        );
        if (selectedBooking && selectedBooking.booking_id === bookingId) {
          setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        alert(res.message || 'Gagal mengubah status booking.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert('Tidak ada data booking untuk diekspor.');
      return;
    }

    const headers = ['Booking ID', 'Kode Booking', 'Pelanggan', 'No HP', 'Lapangan', 'Olahraga', 'Tanggal', 'Jam Mulai', 'Jam Selesai', 'Harga', 'Status'];
    const rows = filteredBookings.map((b) => [
      b.booking_id,
      b.booking_code,
      `"${b.customer?.name || '-'}"`,
      `"${b.customer?.phone || '-'}"`,
      `"${b.court?.name || '-'}"`,
      b.court?.sport_type || '-',
      b.booking_date,
      b.start_time,
      b.end_time,
      b.price,
      b.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lapangin-bookings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Search Logic
  const filteredBookings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    return bookings.filter((b) => {
      // 1. Status
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;

      // 2. Timeframe
      if (timeFilter === 'TODAY' && b.booking_date !== today) return false;
      if (timeFilter === 'MONTH') {
        const [year, month] = b.booking_date.split('-');
        if (parseInt(year, 10) !== currentYear || parseInt(month, 10) !== currentMonth) {
          return false;
        }
      }

      // 3. Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const custName = (b.customer?.name || '').toLowerCase();
        const courtName = (b.court?.name || '').toLowerCase();
        const code = (b.booking_code || '').toLowerCase();
        if (!custName.includes(q) && !courtName.includes(q) && !code.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, statusFilter, timeFilter, search]);

  return (
    <div className="flex flex-col w-full h-full pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-end justify-between gap-8 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#0b1c30]">Manajemen Booking</h1>
            <p className="text-[#3d4a3d] max-w-2xl text-base">
              Kelola dan pantau seluruh reservasi lapangan di venue Anda.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-white text-[#006e2f] border border-[#bccbb9]/50 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#eff4ff] transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#bccbb9]/30 flex-1 flex flex-col overflow-hidden">
        {/* Toolbar: Search & Filter */}
        <div className="p-5 bg-white flex flex-wrap items-center gap-4 border-b border-[#bccbb9]/30 sticky top-0 z-10">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[260px]">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d4a3d]/50 text-[20px]">
              search
            </span>
            <input
              className="w-full pl-11 pr-4 py-2.5 bg-[#f8f9ff] rounded-xl text-[#0b1c30] text-xs placeholder:text-[#3d4a3d]/50 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30 border border-[#bccbb9]/30 transition-all"
              placeholder="Cari pelanggan, kode booking, atau lapangan..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Timeframe Filter */}
          <div className="flex gap-2 bg-[#f8f9ff] p-1 rounded-xl border border-[#bccbb9]/30 text-xs">
            <button
              type="button"
              onClick={() => setTimeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                timeFilter === 'ALL' ? 'bg-[#006e2f] text-white shadow-sm' : 'text-[#3d4a3d] hover:text-[#0b1c30]'
              }`}
            >
              Semua Waktu
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('TODAY')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                timeFilter === 'TODAY' ? 'bg-[#006e2f] text-white shadow-sm' : 'text-[#3d4a3d] hover:text-[#0b1c30]'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('MONTH')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                timeFilter === 'MONTH' ? 'bg-[#006e2f] text-white shadow-sm' : 'text-[#3d4a3d] hover:text-[#0b1c30]'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#f8f9ff] px-4 py-2.5 rounded-xl border border-[#bccbb9]/40 text-xs font-semibold text-[#0b1c30] outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="CONFIRMED">Dikonfirmasi (Confirmed)</option>
              <option value="PENDING">Menunggu (Pending)</option>
              <option value="CANCELLED">Dibatalkan (Cancelled)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#006e2f]">
            <span className="material-symbols-outlined animate-spin text-[32px]">
              progress_activity
            </span>
            <span className="text-xs font-semibold">Memuat Data Booking...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-gray-400 text-[40px]">
              inbox
            </span>
            <p className="text-sm font-bold text-[#0b1c30]">Belum Ada Data Booking</p>
            <p className="text-xs text-[#3d4a3d]">
              Belum ada reservasi yang masuk sesuai kriteria filter saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#bccbb9]/30 bg-[#f8f9ff]">
                  <th className="p-4 font-bold text-xs text-[#3d4a3d] whitespace-nowrap pl-6">
                    Kode Booking
                  </th>
                  <th className="p-4 font-bold text-xs text-[#3d4a3d] whitespace-nowrap">
                    Pelanggan
                  </th>
                  <th className="p-4 font-bold text-xs text-[#3d4a3d] whitespace-nowrap">
                    Lapangan
                  </th>
                  <th className="p-4 font-bold text-xs text-[#3d4a3d] whitespace-nowrap">
                    Jadwal Main
                  </th>
                  <th className="p-4 font-bold text-xs text-[#3d4a3d] whitespace-nowrap text-right">
                    Total
                  </th>
                  <th className="p-4 font-bold text-xs text-[#3d4a3d] whitespace-nowrap text-center">
                    Status
                  </th>
                  <th className="p-4 font-bold text-xs text-[#3d4a3d] whitespace-nowrap text-right pr-6">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs text-[#0b1c30] divide-y divide-[#bccbb9]/20">
                {filteredBookings.map((b) => {
                  const isConfirmed = b.status === 'CONFIRMED';
                  const isPending = b.status === 'PENDING';
                  const isCancelled = b.status === 'CANCELLED';

                  return (
                    <tr
                      key={b.booking_id}
                      className="hover:bg-[#f8f9ff]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedBooking(b)}
                    >
                      <td className="p-4 pl-6 font-mono font-bold text-[#006e2f]">
                        #{b.booking_code}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#006e2f] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {b.customer?.name?.charAt(0).toUpperCase() || 'P'}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-[#0b1c30]">
                              {b.customer?.name || 'Pelanggan'}
                            </p>
                            <p className="text-[10px] text-[#3d4a3d]">
                              {b.customer?.phone || '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{b.court?.name || 'Lapangan'}</span>
                          <span className="text-[10px] text-[#3d4a3d]">
                            {b.court?.sport_type || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold">{formatDateIndo(b.booking_date)}</span>
                          <span className="text-[10px] text-[#3d4a3d]">
                            {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-extrabold text-[#006e2f]">
                        {formatRupiah(b.price)}
                      </td>
                      <td className="p-4 text-center">
                        {isConfirmed && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#22c55e]/15 text-[#004b1e] text-[10px] font-bold border border-[#22c55e]/30">
                            Confirmed
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                            Pending
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#ffdad6]/70 text-[#ba1a1a] text-[10px] font-bold border border-[#ffdad6]">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          {isPending && (
                            <button
                              type="button"
                              disabled={actionLoadingId === b.booking_id}
                              onClick={() => handleUpdateStatus(b.booking_id, 'CONFIRMED')}
                              title="Konfirmasi Pembayaran"
                              className="px-2.5 py-1 rounded-lg bg-[#006e2f] text-white hover:bg-[#005321] text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                check_circle
                              </span>
                              <span>Konfirmasi</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            title="Detail"
                            className="w-7 h-7 rounded-lg hover:bg-[#e5eeff] text-[#3d4a3d] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 border-t border-[#bccbb9]/30 bg-[#f8f9ff] flex items-center justify-between text-xs text-[#3d4a3d]">
          <span>
            Menampilkan <b>{filteredBookings.length}</b> booking
          </span>
          <span className="text-[10px] text-gray-500">
            Pembaruan otomatis dari sistem reservasi
          </span>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedBooking(null)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-lg w-full flex flex-col gap-5 animate-in zoom-in-95 duration-200 border border-[#bccbb9]/30">
            <div className="flex justify-between items-start border-b border-[#bccbb9]/30 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0b1c30]">Detail Booking</h3>
                <span className="font-mono text-xs font-bold text-[#006e2f]">
                  #{selectedBooking.booking_code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between border-b border-[#bccbb9]/20 pb-2">
                <span className="text-[#3d4a3d]">Status</span>
                <span className="font-bold">{selectedBooking.status}</span>
              </div>
              <div className="flex justify-between border-b border-[#bccbb9]/20 pb-2">
                <span className="text-[#3d4a3d]">Nama Pelanggan</span>
                <span className="font-bold">{selectedBooking.customer?.name || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-[#bccbb9]/20 pb-2">
                <span className="text-[#3d4a3d]">Kontak WhatsApp</span>
                <span className="font-bold">{selectedBooking.customer?.phone || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-[#bccbb9]/20 pb-2">
                <span className="text-[#3d4a3d]">Lapangan</span>
                <span className="font-bold">{selectedBooking.court?.name || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-[#bccbb9]/20 pb-2">
                <span className="text-[#3d4a3d]">Tanggal & Waktu</span>
                <span className="font-bold">
                  {formatDateIndo(selectedBooking.booking_date)} ({selectedBooking.start_time.slice(0, 5)} - {selectedBooking.end_time.slice(0, 5)})
                </span>
              </div>
              <div className="flex justify-between border-b border-[#bccbb9]/20 pb-2">
                <span className="text-[#3d4a3d]">Total Bayar</span>
                <span className="font-extrabold text-sm text-[#006e2f]">
                  {formatRupiah(selectedBooking.price)}
                </span>
              </div>
              {selectedBooking.notes && (
                <div className="flex flex-col gap-1 bg-[#f8f9ff] p-3 rounded-xl border border-[#bccbb9]/20">
                  <span className="text-[10px] font-bold text-[#3d4a3d] uppercase">Catatan:</span>
                  <p className="italic text-[#0b1c30]">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#bccbb9]/30">
              {selectedBooking.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    disabled={actionLoadingId === selectedBooking.booking_id}
                    onClick={() => handleUpdateStatus(selectedBooking.booking_id, 'CANCELLED')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
                  >
                    Tolak / Batalkan
                  </button>
                  <button
                    type="button"
                    disabled={actionLoadingId === selectedBooking.booking_id}
                    onClick={() => handleUpdateStatus(selectedBooking.booking_id, 'CONFIRMED')}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#006e2f] hover:bg-[#005321] transition-all shadow-md cursor-pointer"
                  >
                    Konfirmasi Pembayaran
                  </button>
                </>
              )}
              {selectedBooking.status === 'CONFIRMED' && (
                <button
                  type="button"
                  disabled={actionLoadingId === selectedBooking.booking_id}
                  onClick={() => handleUpdateStatus(selectedBooking.booking_id, 'CANCELLED')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
                >
                  Batalkan Reservasi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}