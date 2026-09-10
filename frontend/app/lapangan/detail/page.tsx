'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatRupiah, formatDateIndo, getCourtFallbackImage } from '@/lib/formatters';

interface CourtDetail {
  court_id: number;
  name: string;
  sport_type: string;
  description: string | null;
  price_per_hour: number;
  address: string;
  city: string | null;
  district: string | null;
  image_url: string | null;
  operating_hours?: any[];
}

interface BookedSlot {
  start_time: string;
  end_time: string;
  status: string;
}

interface SlotInfo {
  hourStr: string;
  nextHourStr: string;
  label: string;
  isBooked: boolean;
  isPast: boolean;
}

function DetailLapanganContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courtId = searchParams.get('id');

  const [court, setCourt] = useState<CourtDetail | null>(null);
  const [loadingCourt, setLoadingCourt] = useState(true);
  const [errorCourt, setErrorCourt] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('23:00');

  const [selectedHours, setSelectedHours] = useState<string[]>([]);

  useEffect(() => {
    if (!courtId) {
      setErrorCourt('ID lapangan tidak ditentukan.');
      setLoadingCourt(false);
      return;
    }

    async function fetchCourt() {
      setLoadingCourt(true);
      setErrorCourt(null);
      try {
        const res = await api.get(`/public/courts/${courtId}`);
        if (res.success && res.data) {
          const courtData = res.data;
          setCourt(courtData);

          if (courtData.description) {
            const timeMatch = courtData.description.match(/Jam Operasional:\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
            if (timeMatch) {
              setOpenTime(timeMatch[1]);
              setCloseTime(timeMatch[2]);
            }
          }
        } else {
          setErrorCourt(res.message || 'Lapangan tidak ditemukan.');
        }
      } catch (err) {
        setErrorCourt('Gagal memuat detail lapangan.');
      } finally {
        setLoadingCourt(false);
      }
    }

    fetchCourt();
  }, [courtId]);

  useEffect(() => {
    if (!courtId || !selectedDate) return;

    async function fetchSlots() {
      setSlotsLoading(true);
      setSelectedHours([]);
      try {
        const res = await api.get(`/public/courts/${courtId}/slots?date=${selectedDate}`);
        if (res.success && res.data) {
          setIsClosed(res.data.is_closed || false);
          setBookedSlots(res.data.booked_slots || []);
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
      } finally {
        setSlotsLoading(false);
      }
    }

    fetchSlots();
  }, [courtId, selectedDate]);

  const availableDates = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);
      const dayNum = d.getDate();
      const monthName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(d);
      list.push({ iso, dayName, dayNum, monthName });
    }
    return list;
  }, []);

  const allHourlySlots: SlotInfo[] = useMemo(() => {
    const startHour = parseInt(openTime.split(':')[0], 10) || 8;
    const endHour = parseInt(closeTime.split(':')[0], 10) || 23;
    const list: SlotInfo[] = [];

    const now = new Date();
    const isToday = selectedDate === todayStr;
    const currentHour = now.getHours();

    for (let h = startHour; h < endHour; h++) {
      const hStr = h.toString().padStart(2, '0') + ':00';
      const nextHStr = (h + 1).toString().padStart(2, '0') + ':00';

      const isPast = isToday && h <= currentHour;

      const isBooked = bookedSlots.some((b) => {
        const bStart = b.start_time.slice(0, 5);
        const bEnd = b.end_time.slice(0, 5);
        return hStr < bEnd && nextHStr > bStart && b.status !== 'CANCELLED';
      });

      list.push({
        hourStr: hStr,
        nextHourStr: nextHStr,
        label: `${hStr} - ${nextHStr}`,
        isBooked,
        isPast,
      });
    }

    return list;
  }, [openTime, closeTime, bookedSlots, selectedDate, todayStr]);

  const handleToggleHour = (hour: string) => {
    if (selectedHours.includes(hour)) {
      setSelectedHours(selectedHours.filter((h) => h !== hour));
    } else {
      setSelectedHours([...selectedHours, hour].sort());
    }
  };

  const durationHours = selectedHours.length;
  const totalPrice = (court?.price_per_hour || 0) * durationHours;

  const { startTime, endTime } = useMemo(() => {
    if (selectedHours.length === 0) return { startTime: '', endTime: '' };
    const sorted = [...selectedHours].sort();
    const start = sorted[0];
    const lastHour = parseInt(sorted[sorted.length - 1].split(':')[0], 10);
    const end = (lastHour + 1).toString().padStart(2, '0') + ':00';
    return { startTime: start, endTime: end };
  }, [selectedHours]);

  const handleProceedToCheckout = () => {
    if (!court || selectedHours.length === 0) return;
    const params = new URLSearchParams({
      court_id: court.court_id.toString(),
      date: selectedDate,
      start_time: startTime,
      end_time: endTime,
    });
    router.push(`/customer/checkout?${params.toString()}`);
  };

  if (loadingCourt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9ff]">
        <div className="flex items-center gap-3 text-[#006e2f]">
          <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
          <span className="text-base font-bold">Memuat Detail Lapangan...</span>
        </div>
      </div>
    );
  }

  if (errorCourt || !court) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9ff] px-6 text-center">
        <span className="material-symbols-outlined text-red-500 text-[48px] mb-2">error</span>
        <h2 className="text-xl font-bold text-[#0b1c30]">{errorCourt || 'Lapangan tidak ditemukan'}</h2>
        <p className="text-xs text-[#3d4a3d] mt-1 mb-6">
          Silakan kembali ke halaman pencarian dan pilih lapangan yang tersedia.
        </p>
        <Link
          href="/lapangan"
          className="px-6 py-2.5 rounded-xl bg-[#006e2f] text-white text-xs font-bold hover:bg-[#005321] transition-all shadow-md"
        >
          Kembali ke Cari Lapangan
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] font-sans text-[#0b1c30] min-h-screen flex flex-col">
      {/* HEADER HARDCODE - SESUAI PERMINTAAN TANPA IMPORT NAVBAR KOMPONEN */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#f4f6fa]/95 backdrop-blur-md border-b border-gray-200/50 shadow-xs">
        <div className="h-16 max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-gray-200 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
              <img src="/logo.png" alt="Lapangin Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-[19px] font-extrabold text-[#0b1c30] tracking-tight">
              Lapangin
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-9">
            <Link href="/" className="text-[14px] font-medium text-slate-600 hover:text-[#0b1c30] transition-colors">
              Beranda
            </Link>
            <Link href="/lapangan" className="text-[14px] font-bold text-[#0b1c30] transition-colors">
              Sewa Lapangan
            </Link>
            <Link href="/partner" className="text-[14px] font-medium text-slate-600 hover:text-[#0b1c30] transition-colors">
              Partner With Us
            </Link>
          </nav>

          {/* Desktop Auth Section (Masuk & Daftar) */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/login"
              className="text-[14px] font-semibold text-slate-700 hover:text-[#0b1c30] transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-[#0b1c30] hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-full text-[14px] transition-all shadow-sm"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 bg-[#f8f9ff] flex-1 pb-20">
        <div className="w-full h-[280px] md:h-[380px] relative overflow-hidden bg-slate-900">
          <img
            src={court.image_url || getCourtFallbackImage(court.sport_type)}
            alt={court.name}
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getCourtFallbackImage(court.sport_type);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9ff] via-transparent to-black/40"></div>
          <div className="absolute top-6 left-6 md:left-12">
            <Link
              href="/lapangan"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-xs font-bold text-[#0b1c30] shadow-md hover:bg-white transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Kembali</span>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 -mt-16 relative z-10 flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 flex flex-col gap-6 w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-[#bccbb9]/30 p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between">
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="bg-[#006e2f] text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm">
                    {court.sport_type}
                  </span>
                  <span className="bg-[#e5eeff] text-[#004b1e] px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Terverifikasi
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b1c30]">{court.name}</h1>
                  <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-[#3d4a3d] mt-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#006e2f]">location_on</span>
                    <span>
                      {court.address}
                      {court.district ? `, Kec. ${court.district}` : ''}
                      {court.city ? `, ${court.city}` : ''}
                    </span>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-[#3d4a3d] leading-relaxed mt-2 whitespace-pre-wrap">
                  {court.description ||
                    'Fasilitas olahraga standar dengan pencahayaan optimal dan sirkulasi udara yang baik untuk kenyamanan bermain.'}
                </p>
              </div>

              <div className="bg-[#f8f9ff] border border-[#bccbb9]/40 rounded-2xl p-5 md:w-56 shrink-0 flex flex-col justify-center items-center md:items-end text-center md:text-right gap-1 h-fit">
                <span className="text-[10px] font-bold tracking-widest text-[#3d4a3d] uppercase">
                  Harga Sewa
                </span>
                <span className="text-2xl font-extrabold text-[#006e2f]">
                  {formatRupiah(court.price_per_hour)}
                </span>
                <span className="text-xs text-[#3d4a3d]">per jam</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#bccbb9]/30 p-6 md:p-8 flex flex-col gap-6">
              
              {/* HEADER BAGIAN BOOKING DAN KALENDER */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-lg text-[#0b1c30]">Pilih Tanggal & Jam Main</h3>
                  <p className="text-xs text-[#3d4a3d] mt-0.5">
                    Pilih slot waktu yang tersedia untuk melakukan booking
                  </p>
                </div>

                {/* TAMBAHAN FITUR KALENDER BEBAS PILIH BULAN */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#006e2f] text-[18px] pointer-events-none">
                    calendar_month
                  </span>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedDate(e.target.value);
                      }
                    }}
                    className="pl-9 pr-4 py-2 bg-white border border-[#bccbb9]/60 rounded-xl text-sm font-bold text-[#0b1c30] outline-none focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] transition-all cursor-pointer shadow-sm hover:border-[#006e2f]"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {availableDates.map((item) => {
                  const isSelected = selectedDate === item.iso;
                  return (
                    <button
                      type="button"
                      key={item.iso}
                      onClick={() => setSelectedDate(item.iso)}
                      className={`w-[70px] h-[82px] shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#006e2f] text-white border-[#006e2f] shadow-md font-bold'
                          : 'bg-white border-[#bccbb9]/40 text-[#3d4a3d] hover:border-[#006e2f] hover:text-[#006e2f]'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-semibold">{item.dayName}</span>
                      <span className="text-xl font-extrabold leading-none">{item.dayNum}</span>
                      <span className="text-[10px] opacity-80">{item.monthName}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap justify-between items-center border-t border-[#bccbb9]/30 pt-4 gap-3 text-xs">
                <span className="font-bold text-[#3d4a3d] uppercase tracking-wider text-[11px]">
                  Jam Operasional ({openTime} - {closeTime})
                </span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border-2 border-[#006e2f] bg-white"></span>
                    <span>Tersedia</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#006e2f]"></span>
                    <span>Dipilih</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                    <span>Penuh</span>
                  </span>
                </div>
              </div>

              {isClosed ? (
                <div className="p-8 text-center bg-[#ffdad6]/20 rounded-xl border border-[#ffdad6] text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[32px] mb-1">event_busy</span>
                  <p className="font-bold text-sm">Lapangan Tutup pada Tanggal Ini</p>
                  <p className="text-xs mt-1">Silakan pilih tanggal lain yang tersedia.</p>
                </div>
              ) : slotsLoading ? (
                <div className="py-12 flex justify-center items-center gap-2 text-[#006e2f]">
                  <span className="material-symbols-outlined animate-spin text-[24px]">
                    progress_activity
                  </span>
                  <span className="text-xs font-semibold">Memeriksa ketersediaan jam...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {allHourlySlots.map((slot) => {
                    const isSelected = selectedHours.includes(slot.hourStr);
                    const isUnavailable = slot.isBooked || slot.isPast;

                    if (isUnavailable) {
                      return (
                        <div
                          key={slot.hourStr}
                          className="h-16 bg-[#f8f9ff] border border-[#bccbb9]/30 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-not-allowed select-none"
                        >
                          <span className="font-bold text-xs">{slot.hourStr}</span>
                          <span className="text-[10px]">
                            {slot.isPast ? 'Sudah Lewat' : 'Penuh'}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        type="button"
                        key={slot.hourStr}
                        onClick={() => handleToggleHour(slot.hourStr)}
                        className={`h-16 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#006e2f] border-[#006e2f] text-white shadow-md font-bold'
                            : 'bg-white border-[#006e2f]/40 text-[#006e2f] hover:bg-[#006e2f]/5 hover:border-[#006e2f]'
                        }`}
                      >
                        <span className="font-extrabold text-sm">{slot.hourStr}</span>
                        <span className="text-[10px] font-semibold opacity-90">
                          {isSelected ? 'Dipilih' : 'Tersedia'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <aside className="w-full lg:w-[350px] shrink-0 h-fit sticky top-24">
            <div className="bg-white rounded-2xl shadow-xl border border-[#bccbb9]/30 p-6 flex flex-col gap-5">
              <div>
                <h3 className="font-bold text-lg text-[#0b1c30]">Ringkasan Booking</h3>
                <p className="text-xs text-[#3d4a3d] mt-1 font-semibold">{court.name}</p>
              </div>

              <div className="border-t border-[#bccbb9]/30"></div>

              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#3d4a3d] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#006e2f]">
                      calendar_month
                    </span>
                    Tanggal
                  </span>
                  <span className="font-bold text-[#0b1c30]">{formatDateIndo(selectedDate)}</span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-[#3d4a3d] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#006e2f]">
                      schedule
                    </span>
                    Waktu Main
                  </span>
                  <div className="text-right">
                    {selectedHours.length > 0 ? (
                      <span className="font-bold text-[#006e2f]">
                        {startTime} - {endTime}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Belum pilih jam</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#3d4a3d] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#006e2f]">
                      timer
                    </span>
                    Durasi
                  </span>
                  <span className="font-bold text-[#0b1c30]">{durationHours} Jam</span>
                </div>
              </div>

              <div className="bg-[#f8f9ff] rounded-xl p-4 flex flex-col gap-2 border border-[#bccbb9]/20">
                <div className="flex justify-between text-xs">
                  <span className="text-[#3d4a3d]">Harga per jam</span>
                  <span className="font-semibold text-[#0b1c30]">
                    {formatRupiah(court.price_per_hour)}
                  </span>
                </div>
                <div className="border-t border-[#bccbb9]/30 pt-2 flex justify-between items-center">
                  <span className="font-extrabold text-xs text-[#0b1c30]">Total Biaya</span>
                  <span className="text-xl font-extrabold text-[#006e2f]">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={selectedHours.length === 0}
                onClick={handleProceedToCheckout}
                className="w-full bg-[#006e2f] hover:bg-[#005321] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                <span>Lanjut ke Pembayaran</span>
              </button>

              <p className="text-[10px] text-center text-[#3d4a3d]/70">
                🔒 Pembayaran aman & jadwal terverifikasi anti-bentrok.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function DetailLapanganPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
          <span className="text-sm font-semibold text-[#006e2f]">Memuat Detail...</span>
        </div>
      }
    >
      <DetailLapanganContent />
    </Suspense>
  );
}