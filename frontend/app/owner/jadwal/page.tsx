'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

const BookingDetailModal = dynamic(() => import('./BookingDetailModal'), {
  ssr: false,
});

interface Court {
  court_id: number;
  name: string;
  sport_type: string;
  price_per_hour: number;
  description?: string;
}

export interface BookingRecord {
  booking_id: number;
  booking_code: string;
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number;
  payment_method?: string;
  status: string;
  customer?: {
    name: string;
    phone: string;
  };
}

function JadwalContent() {
  const { token } = useAuth();

  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>('ALL');

  const availableSports = useMemo(() => {
    const sports = Array.from(
      new Set(courts.map((c) => c.sport_type).filter(Boolean))
    );
    return sports.sort();
  }, [courts]);

  const filteredCourts = useMemo(() => {
    if (selectedSportFilter === 'ALL') return courts;
    return courts.filter(
      (c) => (c.sport_type || '').toLowerCase() === selectedSportFilter.toLowerCase()
    );
  }, [courts, selectedSportFilter]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [scheduleCache, setScheduleCache] = useState<Record<string, BookingRecord[]>>({});
  const [dayBookings, setDayBookings] = useState<BookingRecord[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [activePopoverBooking, setActivePopoverBooking] = useState<BookingRecord | null>(null);

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

  const loadSchedule = useCallback(
    async (courtId: number, date: string, force = false) => {
      if (!token) return;
      const cacheKey = `${courtId}_${date}`;

      if (!force && scheduleCache[cacheKey]) {
        setDayBookings(scheduleCache[cacheKey]);
        return;
      }

      setLoadingBookings(true);
      try {
        const res = await api.get(
          `/bookings?court_id=${courtId}&booking_date=${date}&limit=100`,
          token
        );
        if (res.success && res.data) {
          const items: BookingRecord[] = Array.isArray(res.data.data) ? res.data.data : res.data;
          const active = (items || []).filter((b) => b.status !== 'CANCELLED');
          setScheduleCache((prev) => ({ ...prev, [cacheKey]: active }));
          setDayBookings(active);
        }
      } catch (err) {
        console.error('Failed to load schedule:', err);
      } finally {
        setLoadingBookings(false);
      }
    },
    [token, scheduleCache]
  );

  useEffect(() => {
    if (filteredCourts.length > 0) {
      const isCurrentStillVisible = filteredCourts.some(
        (c) => c.court_id === selectedCourtId
      );
      if (!isCurrentStillVisible) {
        setSelectedCourtId(filteredCourts[0].court_id);
      }
    } else if (courts.length > 0) {
      setSelectedCourtId(null);
    }
  }, [filteredCourts, selectedCourtId, courts.length]);

  useEffect(() => {
    if (selectedCourtId && selectedDate) {
      loadSchedule(selectedCourtId, selectedDate);
    }
  }, [selectedCourtId, selectedDate, loadSchedule]);

  const selectedCourt = useMemo(() => {
    return filteredCourts.find((c) => c.court_id === selectedCourtId) || filteredCourts[0] || null;
  }, [filteredCourts, selectedCourtId]);

  const timelineHours = useMemo(() => {
    if (!selectedCourt) return [];
    
    let openHour = 8;
    let closeHour = 22;

    if (selectedCourt.description) {
      const timeMatch = selectedCourt.description.match(/Jam Operasional:\s*(\d{2}):\d{2}\s*-\s*(\d{2}):\d{2}/);
      if (timeMatch) {
        openHour = parseInt(timeMatch[1], 10);
        const rawClose = parseInt(timeMatch[2], 10);
        // Midnight closing (00:00) represents 24:00 (end of day)
        const endHour = (rawClose === 0 || timeMatch[2] === '00') ? 24 : rawClose;
        closeHour = endHour - 1; 
      }
    }

    const opHours = (selectedCourt as any).operating_hours || (selectedCourt as any).operatingHours;
    if (Array.isArray(opHours) && opHours.length > 0) {
      const firstOp = opHours[0];
      if (firstOp.open_time && firstOp.close_time) {
        const parsedOpen = parseInt(firstOp.open_time.split(':')[0], 10);
        const rawClose = parseInt(firstOp.close_time.split(':')[0], 10);
        const endHour = (rawClose === 0 || firstOp.close_time.startsWith('00:')) ? 24 : rawClose;
        if (!isNaN(parsedOpen)) openHour = parsedOpen;
        if (!isNaN(endHour)) closeHour = endHour - 1;
      }
    }

    const hours = [];
    for (let h = openHour; h <= closeHour; h++) {
      const start = h.toString().padStart(2, '0') + ':00';
      const nextH = h + 1;
      const end = nextH === 24 ? '00:00' : nextH.toString().padStart(2, '0') + ':00';

      const matchedBooking = dayBookings.find((b) => {
        const bStart = b.start_time.slice(0, 5);
        const bEnd = b.end_time.slice(0, 5);
        const normSlotEnd = (end === '00:00' || end === '24:00') ? '24:00' : end;
        const normBEnd = (bEnd === '00:00' || bEnd === '23:59' || bEnd === '24:00') ? '24:00' : bEnd;
        return start < normBEnd && normSlotEnd > bStart;
      });

      hours.push({
        hourStr: start,
        nextHourStr: end,
        booking: matchedBooking || null,
      });
    }
    return hours;
  }, [dayBookings, selectedCourt]);

  const { totalHoursBooked, dayRevenue, pendingCount } = useMemo(() => {
    let hours = 0;
    let rev = 0;
    let pending = 0;

    dayBookings.forEach((b) => {
      const startH = parseInt(b.start_time.split(':')[0], 10);
      let endH = parseInt(b.end_time.split(':')[0], 10);
      if (endH === 0 || b.end_time.startsWith('00:') || b.end_time.startsWith('23:59')) {
        endH = 24;
      }
      hours += Math.max(1, endH - startH);
      if (b.status === 'CONFIRMED') {
        rev += b.price;
      } else if (b.status === 'PENDING') {
        pending += 1;
      }
    });

    return { totalHoursBooked: hours, dayRevenue: rev, pendingCount: pending };
  }, [dayBookings]);

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
          {/* 3 Cards Ringkasan Jadwal — Operasional (Kiri) & Finansial Emerald (Kanan) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mb-6">

            {/* Card 1: Total Jam Terisi (Operasional) */}
            <div className="bg-white rounded-2xl p-5 border border-[#bccbb9]/40 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="text-[#3d4a3d] text-xs font-semibold">
                Total Jam Terisi
              </div>
              <div className="text-[#0b1c30] text-3xl font-extrabold tracking-tight mt-1">
                {totalHoursBooked || 0} Jam
              </div>
              <div className="text-emerald-700 text-xs font-medium mt-1">
                Slot Terjadwal Hari Ini
              </div>
            </div>

            {/* Card 2: Menunggu Konfirmasi (Operasional) */}
            <div className="bg-white rounded-2xl p-5 border border-[#bccbb9]/40 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="text-[#3d4a3d] text-xs font-semibold">
                Menunggu Konfirmasi
              </div>
              <div className="text-[#0b1c30] text-3xl font-extrabold tracking-tight mt-1">
                {pendingCount || 0}
              </div>
              <div className={`text-xs font-semibold mt-1 ${(pendingCount || 0) > 0 ? 'text-amber-600' : 'text-[#3d4a3d]'}`}>
                {(pendingCount || 0) > 0 ? `${pendingCount} booking pending` : 'Tidak ada antrian'}
              </div>
            </div>

            {/* Card 3: Pendapatan Hari Ini (Finansial - Gradasi Emerald) */}
            <div className="bg-gradient-to-br from-[#006e2f] via-[#005e28] to-[#00451b] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-white/10 text-5xl absolute -right-2 -bottom-2 pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                payments
              </span>
              <div className="text-white/80 text-xs font-semibold uppercase tracking-wider relative z-10">
                Pendapatan Hari Ini
              </div>
              <div className="text-white text-2xl font-extrabold tracking-tight mt-1.5 relative z-10">
                {formatRupiah(dayRevenue || 0)}
              </div>
              <div className="text-white/70 text-[11px] font-medium mt-1 relative z-10">
                Terkonfirmasi Lunas
              </div>
            </div>

          </div>

          <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden border border-[#bccbb9]/30">
            {/* Filter Bar */}
            <div className="p-3.5 sm:px-5 sm:py-3 border-b border-[#bccbb9]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8f9ff]/70">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px] text-[#006e2f]">stadium</span>
                <span>Pilih Unit Lapangan:</span>
                <span className="text-[11px] font-medium text-[#3d4a3d] bg-white px-2.5 py-0.5 rounded-md border border-[#bccbb9]/30 shadow-2xs">
                  {filteredCourts.length} {selectedSportFilter !== 'ALL' ? `dari ${courts.length}` : ''} unit
                </span>
              </div>

              {availableSports.length > 0 && (
                <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
                  <label htmlFor="sportFilterSelect" className="text-xs font-semibold text-[#3d4a3d] shrink-0">
                    Filter Olahraga:
                  </label>
                  <div className="relative flex-1 sm:flex-initial">
                    <select
                      id="sportFilterSelect"
                      value={selectedSportFilter}
                      onChange={(e) => setSelectedSportFilter(e.target.value)}
                      className="w-full sm:w-auto bg-white border border-[#bccbb9]/40 text-xs font-bold text-[#0b1c30] rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#006e2f] cursor-pointer shadow-2xs appearance-none transition-all"
                    >
                      <option value="ALL">Semua Olahraga ({courts.length})</option>
                      {availableSports.map((sport) => {
                        const count = courts.filter(
                          (c) => (c.sport_type || '').toLowerCase() === sport.toLowerCase()
                        ).length;
                        return (
                          <option key={sport} value={sport}>
                            {sport} ({count})
                          </option>
                        );
                      })}
                    </select>
                    <span className="material-symbols-outlined text-[18px] text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Horizontal Court Tabs */}
            {filteredCourts.length === 0 ? (
              <div className="p-6 text-center text-xs font-medium text-[#3d4a3d]">
                Tidak ada unit lapangan untuk jenis olahraga "{selectedSportFilter}".
              </div>
            ) : (
              <div className="flex overflow-x-auto scrollbar-none">
                {filteredCourts.map((court) => {
                  const isSelected = selectedCourt?.court_id === court.court_id;
                  return (
                    <button
                      key={court.court_id}
                      type="button"
                      onClick={() => setSelectedCourtId(court.court_id)}
                      className={`py-3 px-5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 flex items-center gap-2 shrink-0 ${
                        isSelected
                          ? 'border-[#006e2f] text-[#006e2f] bg-[#006e2f]/5 font-extrabold'
                          : 'border-transparent text-[#3d4a3d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                      }`}
                    >
                      <span>{court.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 font-semibold text-gray-700">
                        {court.sport_type}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

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
              <div className="py-12 space-y-3 px-6 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl w-full" />
                ))}
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
                      <span className="w-16 font-mono text-xs font-bold text-[#3d4a3d] shrink-0">
                        {slot.hourStr}
                      </span>

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
        </>
      )}

      {activePopoverBooking && (
        <BookingDetailModal
          booking={activePopoverBooking}
          onClose={() => setActivePopoverBooking(null)}
        />
      )}
    </div>
  );
}

const OwnerJadwalPage = dynamic(() => Promise.resolve(JadwalContent), {
  ssr: false,
  loading: () => <div className="min-h-[60vh] w-full" />,
});

export default OwnerJadwalPage;