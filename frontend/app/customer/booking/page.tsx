'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah, formatDateIndo, getCourtFallbackImage } from '@/lib/formatters';

interface BookingItem {
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
    address: string;
    city: string | null;
    image_url: string | null;
  };
}

export default function CustomerBookingPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab filter
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('ALL');

  // E-Ticket modal state
  const [ticketModalBooking, setTicketModalBooking] = useState<BookingItem | null>(null);

  // Cancellation state
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login?redirect=/customer/booking');
    }
  }, [authLoading, token, router]);

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
      setError('Gagal memuat riwayat booking.');
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

  // Cancel Booking
  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan booking ini?')) return;

    setCancellingId(bookingId);
    try {
      const res = await api.put(`/bookings/${bookingId}`, { status: 'CANCELLED' }, token);
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.booking_id === bookingId ? { ...b, status: 'CANCELLED' } : b))
        );
      } else {
        alert(res.message || 'Gagal membatalkan booking.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setCancellingId(null);
    }
  };

  // Filtered list based on activeTab
  const filteredBookings = useMemo(() => {
    if (activeTab === 'ALL') return bookings;
    return bookings.filter((b) => b.status === activeTab);
  }, [bookings, activeTab]);

  return (
    <div className="bg-[#f8f9ff] font-sans text-[#0b1c30] min-h-screen flex flex-col">
      <Navbar />

      <main className="w-full pt-20 pb-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full flex flex-col">
          {/* Header Section */}
          <div className="pt-6 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#bccbb9]/40">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b1c30] mb-1">
                Booking Saya
              </h1>
              <p className="text-xs md:text-sm text-[#3d4a3d]">
                Pantau status jadwal dan e-ticket reservasi lapangan Anda.
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'CONFIRMED', label: 'Dikonfirmasi' },
                { id: 'PENDING', label: 'Menunggu Konfirmasi' },
                { id: 'CANCELLED', label: 'Dibatalkan' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#006e2f] text-white shadow-sm'
                        : 'bg-white text-[#3d4a3d] hover:bg-[#e5eeff] border border-[#bccbb9]/30'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Booking Cards List */}
          <div className="flex flex-col gap-5 pt-8">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#006e2f]">
                <span className="material-symbols-outlined animate-spin text-[32px]">
                  progress_activity
                </span>
                <span className="text-xs font-bold">Memuat Daftar Reservasi...</span>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#bccbb9]/30 p-12 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#f8f9ff] flex items-center justify-center text-[#3d4a3d]">
                  <span className="material-symbols-outlined text-[32px]">event_busy</span>
                </div>
                <h3 className="text-base font-bold text-[#0b1c30]">Belum Ada Reservasi</h3>
                <p className="text-xs text-[#3d4a3d] max-w-sm">
                  {activeTab === 'ALL'
                    ? 'Anda belum pernah melakukan pemesanan lapangan. Yuk cari dan sewa lapangan sekarang!'
                    : `Tidak ada booking dengan status "${activeTab}".`}
                </p>
                <Link
                  href="/lapangan"
                  className="px-6 py-2.5 rounded-xl bg-[#006e2f] text-white text-xs font-bold hover:bg-[#005321] transition-all shadow-md mt-2"
                >
                  Cari Lapangan Sekarang
                </Link>
              </div>
            ) : (
              filteredBookings.map((b) => {
                const isConfirmed = b.status === 'CONFIRMED';
                const isPending = b.status === 'PENDING';
                const isCancelled = b.status === 'CANCELLED';

                const sport = b.court?.sport_type || 'Olahraga';
                const courtImg = b.court?.image_url || getCourtFallbackImage(sport);

                return (
                  <div
                    key={b.booking_id}
                    className="w-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden border border-[#bccbb9]/30"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        isConfirmed
                          ? 'bg-[#006e2f]'
                          : isPending
                          ? 'bg-amber-500'
                          : 'bg-[#ba1a1a]'
                      }`}
                    ></div>

                    {/* Thumbnail */}
                    <div className="w-full md:w-52 h-32 flex-shrink-0 relative rounded-xl overflow-hidden bg-slate-800">
                      <img
                        alt={b.court?.name || 'Lapangan'}
                        className="w-full h-full object-cover"
                        src={courtImg}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getCourtFallbackImage(sport);
                        }}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold uppercase backdrop-blur-sm">
                        {sport}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-grow w-full flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#006e2f] bg-[#e5eeff] px-2.5 py-0.5 rounded-md tracking-wider">
                          #{b.booking_code}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#bccbb9]"></span>
                        <h3 className="text-lg font-bold text-[#0b1c30] truncate">
                          {b.court?.name || 'Lapangan Olahraga'}
                        </h3>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-1 text-xs">
                        <div className="flex items-center gap-1.5 text-[#3d4a3d]">
                          <span className="material-symbols-outlined text-[#006e2f] text-[18px]">
                            calendar_month
                          </span>
                          <span className="font-semibold">
                            {formatDateIndo(b.booking_date)}, {b.start_time.slice(0, 5)} -{' '}
                            {b.end_time.slice(0, 5)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#006e2f] text-[18px]">
                            payments
                          </span>
                          <span className="font-bold text-[#0b1c30]">
                            {formatRupiah(b.price)}
                          </span>
                        </div>
                      </div>

                      {b.notes && (
                        <p className="text-[11px] text-[#3d4a3d]/80 italic mt-0.5">
                          Catatan: &ldquo;{b.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Actions & Status Badge */}
                    <div className="w-full md:w-auto flex flex-col items-end gap-2.5 flex-shrink-0 border-t md:border-t-0 md:border-l border-[#bccbb9]/40 pt-4 md:pt-0 md:pl-6">
                      {isConfirmed && (
                        <div className="bg-[#22c55e]/15 text-[#004b1e] px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-[#22c55e]/30">
                          <span className="w-2 h-2 rounded-full bg-[#006e2f]"></span>
                          <span className="text-xs font-bold">Dikonfirmasi</span>
                        </div>
                      )}

                      {isPending && (
                        <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-amber-200">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          <span className="text-xs font-bold">Menunggu Konfirmasi</span>
                        </div>
                      )}

                      {isCancelled && (
                        <div className="bg-[#ffdad6]/60 text-[#ba1a1a] px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-[#ffdad6]">
                          <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                          <span className="text-xs font-bold">Dibatalkan</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setTicketModalBooking(b)}
                        className="w-full md:w-36 px-4 py-2 rounded-xl border-2 border-[#006e2f] text-[#006e2f] font-bold text-xs hover:bg-[#006e2f]/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          confirmation_number
                        </span>
                        <span>Lihat E-Ticket</span>
                      </button>

                      {isPending && (
                        <button
                          type="button"
                          disabled={cancellingId === b.booking_id}
                          onClick={() => handleCancelBooking(b.booking_id)}
                          className="w-full md:w-36 px-4 py-2 rounded-xl border border-[#ba1a1a] text-[#ba1a1a] font-bold text-xs hover:bg-[#ffdad6]/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[16px]">cancel</span>
                          <span>{cancellingId === b.booking_id ? 'Membatalkan...' : 'Batalkan'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* E-Ticket Modal */}
      {ticketModalBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0b1c30]/50 backdrop-blur-sm"
            onClick={() => setTicketModalBooking(null)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 max-w-md w-full animate-in zoom-in-95 duration-200 border border-[#bccbb9]/30">
            <div className="flex justify-between items-start border-b border-[#bccbb9]/30 pb-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Lapangin" className="w-7 h-7 object-contain" />
                <div>
                  <h3 className="text-base font-extrabold text-[#006e2f]">E-TICKET LAPANGIN</h3>
                  <p className="text-[10px] text-[#3d4a3d]">Tunjukkan tiket ini kepada pengelola venue</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTicketModalBooking(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#bccbb9]/30 flex flex-col gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#3d4a3d]">Kode Booking</span>
                <span className="font-mono font-extrabold text-[#006e2f] text-sm">
                  #{ticketModalBooking.booking_code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3d4a3d]">Status</span>
                <span className="font-bold text-[#0b1c30]">{ticketModalBooking.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3d4a3d]">Nama Venue</span>
                <span className="font-bold text-[#0b1c30]">
                  {ticketModalBooking.court?.name || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3d4a3d]">Tanggal Main</span>
                <span className="font-bold text-[#0b1c30]">
                  {formatDateIndo(ticketModalBooking.booking_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3d4a3d]">Waktu Main</span>
                <span className="font-bold text-[#0b1c30]">
                  {ticketModalBooking.start_time.slice(0, 5)} -{' '}
                  {ticketModalBooking.end_time.slice(0, 5)}
                </span>
              </div>
              <div className="border-t border-[#bccbb9]/30 pt-2 flex justify-between">
                <span className="text-[#3d4a3d]">Total Bayar</span>
                <span className="font-extrabold text-[#006e2f] text-sm">
                  {formatRupiah(ticketModalBooking.price)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#006e2f] text-white hover:bg-[#005321] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Cetak Tiket</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}