'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

interface Court {
  court_id: number;
  name: string;
  sport_type: string;
  price_per_hour: number;
}

interface BookingRecord {
  booking_id: number;
  booking_code: string;
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: string;
  customer?: {
    name: string;
    phone: string;
  };
}

export default function OwnerJadwalPage() {
  const { token } = useAuth();

  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [loadingCourts, setLoadingCourts] = useState(true);

  // Date state
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Bookings for the venue
  const [venueBookings, setVenueBookings] = useState<BookingRecord[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Popover state
  const [activePopoverBooking, setActivePopoverBooking] = useState<BookingRecord | null>(null);

  // 1. Fetch owner courts
  useEffect(() => {
    if (!token) return;
    async function loadCourts() {
      setLoadingCourts(true);
      try {
        const res = await api.get('/courts', token);
        if (res.success && res.data) {
          const items: Court[] = Array.isArray(res.data.data) ? res.data.data : res.data;
          setCourts(items);
          if (items.length > 0) {
            setSelectedCourtId(items[0].court_id);
          }
        }
      } catch (err) {
        console.error('Failed to load courts:', err);
      } finally {
        setLoadingCourts(false);
      }
    }
    loadCourts();
  }, [token]);

  // 2. Fetch bookings for the owner
  const fetchOwnerBookings = async () => {
    if (!token) return;
    setLoadingBookings(true);
    try {
      const res = await api.get('/bookings', token);
      if (res.success && res.data) {
        const items = Array.isArray(res.data.data) ? res.data.data : res.data;
        setVenueBookings(items || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOwnerBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Selected Court Object
  const selectedCourt = useMemo(() => {
    return courts.find((c) => c.court_id === selectedCourtId) || courts[0] || null;
  }, [courts, selectedCourtId]);

  // Bookings on selectedDate for selectedCourt
  const dayBookings = useMemo(() => {
    if (!selectedCourt) return [];
    return venueBookings.filter(
      (b) =>
        b.court_id === selectedCourt.court_id &&
        b.booking_date === selectedDate &&
        b.status !== 'CANCELLED'
    );
  }, [venueBookings, selectedCourt, selectedDate]);

  // Operating timeline generation: 08:00 - 23:00 (15 hours)
  const timelineHours = useMemo(() => {
    const hours = [];
    for (let h = 8; h <= 22; h++) {
      const start = h.toString().padStart(2, '0') + ':00';
      const end = (h + 1).toString().padStart(2, '0') + ':00';

      // Find booking overlapping with this hour
      const matchedBooking = dayBookings.find((b) => {
        const bStart = b.start_time.slice(0, 5);
        const bEnd = b.end_time.slice(0, 5);
        return start < bEnd && end > bStart;
      });

      hours.push({
        hourStr: start,
        nextHourStr: end,
        booking: matchedBooking || null,
      });
    }
    return hours;
  }, [dayBookings]);

  // Metrics for the day
  const { totalHoursBooked, dayRevenue, pendingCount } = useMemo(() => {
    let hours = 0;
    let rev = 0;
    let pending = 0;

    dayBookings.forEach((b) => {
      const startH = parseInt(b.start_time.split(':')[0], 10);
      const endH = parseInt(b.end_time.split(':')[0], 10);
      hours += Math.max(1, endH - startH);
      if (b.status === 'CONFIRMED') {
        rev += b.price;
      } else if (b.status === 'PENDING') {
        pending += 1;
      }
    });

    return { totalHoursBooked: hours, dayRevenue: rev, pendingCount: pending };
  }, [dayBookings]);

  // Change date helpers
  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  return (
    <div
      className="flex flex-col w-full pb-12"
      onClick={() => setActivePopoverBooking(null)}
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0b1c30] mb-1">Jadwal Lapangan</h1>
          <p className="text-[#3d4a3d] text-sm">
            Pantau ketersediaan slot jam dan jadwal reservasi secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr)}
            className={`px-4 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer border ${
              selectedDate === todayStr
                ? 'bg-[#006e2f] text-white border-[#006e2f] shadow-sm'
                : 'bg-white text-[#3d4a3d] border-[#bccbb9]/40 hover:bg-[#eff4ff]'
            }`}
          >
            Hari Ini
          </button>

          <div className="flex items-center bg-white border border-[#bccbb9]/40 rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={() => handleShiftDate(-1)}
              className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#0b1c30] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="px-3 text-xs font-bold text-[#0b1c30] min-w-[120px] text-center">
              {formatDateIndo(selectedDate)}
            </span>
            <button
              type="button"
              onClick={() => handleShiftDate(1)}
              className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#0b1c30] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          <Link
            href="/owner/booking"
            className="bg-[#006e2f] hover:bg-[#005321] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">list_alt</span>
            <span>Semua Booking</span>
          </Link>
        </div>
      </div>

      {/* Tabs Lapangan Milik Owner */}
      {loadingCourts ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#bccbb9]/30">
          <span className="text-xs font-semibold text-[#006e2f]">Memuat Lapangan...</span>
        </div>
      ) : courts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#bccbb9]/30 p-8 text-center flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-gray-400 text-[36px]">stadium</span>
          <p className="font-bold text-sm text-[#0b1c30]">Belum Ada Lapangan</p>
          <p className="text-xs text-[#3d4a3d]">
            Daftarkan lapangan pertama Anda untuk mulai mengatur jadwal dan menerima booking.
          </p>
          <Link
            href="/owner/lapangan/tambah"
            className="px-5 py-2 rounded-xl bg-[#006e2f] text-white text-xs font-bold hover:bg-[#005321] transition-all shadow-sm"
          >
            Tambah Lapangan
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden border border-[#bccbb9]/30">
            <div className="flex overflow-x-auto scrollbar-none">
              {courts.map((court) => {
                const isSelected = selectedCourt?.court_id === court.court_id;
                return (
                  <button
                    key={court.court_id}
                    type="button"
                    onClick={() => setSelectedCourtId(court.court_id)}
                    className={`py-3 px-6 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 flex items-center gap-2 ${
                      isSelected
                        ? 'border-[#006e2f] text-[#006e2f] bg-[#006e2f]/5'
                        : 'border-transparent text-[#3d4a3d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                    }`}
                  >
                    <span>{court.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 font-semibold">
                      {court.sport_type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#bccbb9]/30 relative">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#bccbb9]/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006e2f]">calendar_today</span>
                <span className="font-bold text-sm text-[#0b1c30]">
                  Timeline Jadwal: {selectedCourt?.name} ({formatDateIndo(selectedDate)})
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-[#006e2f]"></span>
                  <span>Confirmed</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-500"></span>
                  <span>Pending</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md border-2 border-dashed border-gray-300"></span>
                  <span>Tersedia</span>
                </span>
              </div>
            </div>

            {loadingBookings ? (
              <div className="py-20 flex justify-center items-center gap-2 text-[#006e2f]">
                <span className="material-symbols-outlined animate-spin text-[28px]">
                  progress_activity
                </span>
                <span className="text-xs font-bold">Memperbarui jadwal...</span>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#bccbb9]/20">
                {timelineHours.map((slot) => {
                  const b = slot.booking;

                  return (
                    <div
                      key={slot.hourStr}
                      className="py-3 flex items-center gap-4 group hover:bg-[#f8f9ff] px-2 rounded-xl transition-colors relative"
                    >
                      {/* Jam */}
                      <span className="w-16 font-mono text-xs font-bold text-[#3d4a3d] shrink-0">
                        {slot.hourStr}
                      </span>

                      {/* Content Bar */}
                      <div className="flex-1">
                        {b ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePopoverBooking(b);
                            }}
                            className={`p-3 rounded-xl border-l-4 transition-all cursor-pointer shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              b.status === 'CONFIRMED'
                                ? 'bg-[#22c55e]/15 border-[#006e2f] text-[#004b1e]'
                                : 'bg-amber-50 border-amber-500 text-amber-900'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-extrabold bg-white px-2 py-0.5 rounded shadow-xs">
                                #{b.booking_code}
                              </span>
                              <span className="font-bold text-xs">
                                {b.customer?.name || 'Pelanggan'}
                              </span>
                              <span className="text-[11px] opacity-80 hidden sm:inline">
                                ({b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)})
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold">
                                {formatRupiah(b.price)}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  b.status === 'CONFIRMED'
                                    ? 'bg-[#006e2f] text-white'
                                    : 'bg-amber-500 text-white'
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-xs flex items-center justify-between">
                            <span className="font-medium">Slot Jam Tersedia</span>
                            <span className="text-[11px] font-semibold text-[#006e2f]/80">
                              {formatRupiah(selectedCourt?.price_per_hour)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Day Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-2xl p-5 border border-[#bccbb9]/30 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#006e2f]/10 text-[#006e2f] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">schedule</span>
              </div>
              <div>
                <p className="text-xs text-[#3d4a3d] font-semibold">Total Jam Terisi</p>
                <p className="text-2xl font-extrabold text-[#0b1c30] mt-0.5">
                  {totalHoursBooked} Jam
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#bccbb9]/30 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#005ac2]/10 text-[#005ac2] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <div>
                <p className="text-xs text-[#3d4a3d] font-semibold">Pendapatan Hari Ini</p>
                <p className="text-2xl font-extrabold text-[#006e2f] mt-0.5">
                  {formatRupiah(dayRevenue)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#bccbb9]/30 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">pending_actions</span>
              </div>
              <div>
                <p className="text-xs text-[#3d4a3d] font-semibold">Menunggu Konfirmasi</p>
                <p className="text-2xl font-extrabold text-amber-600 mt-0.5">
                  {pendingCount} Booking
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Popover Modal for clicked Booking Slot */}
      {activePopoverBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setActivePopoverBooking(null)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 animate-in zoom-in-95 duration-150 border border-[#bccbb9]/30">
            <div className="flex justify-between items-start border-b border-[#bccbb9]/30 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0b1c30]">
                  {activePopoverBooking.customer?.name || 'Pelanggan'}
                </h3>
                <span className="font-mono text-xs text-[#006e2f] font-bold">
                  #{activePopoverBooking.booking_code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePopoverBooking(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#3d4a3d]">Waktu</span>
                <span className="font-bold">
                  {activePopoverBooking.start_time.slice(0, 5)} -{' '}
                  {activePopoverBooking.end_time.slice(0, 5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3d4a3d]">No. WhatsApp</span>
                <span className="font-bold">
                  {activePopoverBooking.customer?.phone || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3d4a3d]">Tarif Sewa</span>
                <span className="font-extrabold text-[#006e2f]">
                  {formatRupiah(activePopoverBooking.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3d4a3d]">Status</span>
                <span className="font-bold">{activePopoverBooking.status}</span>
              </div>
            </div>

            {activePopoverBooking.customer?.phone && (
              <a
                href={`https://wa.me/${activePopoverBooking.customer.phone.replace(/^0/, '62')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Hubungi via WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}