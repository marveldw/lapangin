'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah, formatDateIndo, getCourtFallbackImage } from '@/lib/formatters';

interface CourtInfo {
  court_id: number;
  name: string;
  sport_type: string;
  price_per_hour: number;
  address: string;
  city: string | null;
  image_url: string | null;
}

function KonfirmasiBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, isLoading: authLoading } = useAuth();

  const courtId = searchParams.get('court_id');
  const bookingDate = searchParams.get('date');
  const startTime = searchParams.get('start_time');
  const endTime = searchParams.get('end_time');

  const [court, setCourt] = useState<CourtInfo | null>(null);
  const [loadingCourt, setLoadingCourt] = useState(true);
  const [notes, setNotes] = useState('');

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdBookingCode, setCreatedBookingCode] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. Check auth
  useEffect(() => {
    if (!authLoading && !token) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [token, authLoading, router]);

  // 2. Fetch court info
  useEffect(() => {
    if (!courtId) {
      setLoadingCourt(false);
      return;
    }

    async function fetchCourt() {
      setLoadingCourt(true);
      try {
        const res = await api.get(`/public/courts/${courtId}`);
        if (res.success && res.data) {
          setCourt(res.data);
        }
      } catch (err) {
        console.error('Failed to load court:', err);
      } finally {
        setLoadingCourt(false);
      }
    }

    fetchCourt();
  }, [courtId]);

  // 3. Calculate duration & price
  const { durationHours, totalPrice } = useMemo(() => {
    if (!startTime || !endTime || !court) return { durationHours: 1, totalPrice: 0 };
    const startH = parseInt(startTime.split(':')[0], 10);
    const endH = parseInt(endTime.split(':')[0], 10);
    const hours = Math.max(1, endH - startH);
    return {
      durationHours: hours,
      totalPrice: court.price_per_hour * hours,
    };
  }, [startTime, endTime, court]);

  // 4. Handle submit booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtId || !bookingDate || !startTime || !endTime) {
      setErrorMessage('Informasi jadwal atau lapangan tidak lengkap.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        court_id: parseInt(courtId, 10),
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        notes: notes.trim() || undefined,
      };

      const res = await api.post('/bookings', payload, token);

      if (res.success && res.data) {
        setCreatedBookingCode(res.data.booking_code || 'LPG-SUCCESS');
        setShowModal(true);
      } else {
        setErrorMessage(res.message || 'Gagal membuat reservasi. Silakan coba kembali.');
      }
    } catch (err) {
      setErrorMessage('Terjadi kendala jaringan saat menghubungi server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (createdBookingCode) {
      navigator.clipboard.writeText(createdBookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push('/customer/booking');
  };

  if (authLoading || loadingCourt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
        <div className="flex items-center gap-2 text-[#006e2f]">
          <span className="material-symbols-outlined animate-spin text-[28px]">progress_activity</span>
          <span className="text-sm font-bold">Menyiapkan Checkout...</span>
        </div>
      </div>
    );
  }

  if (!court || !bookingDate || !startTime || !endTime) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9ff] p-6 text-center">
        <span className="material-symbols-outlined text-amber-500 text-[48px] mb-2">warning</span>
        <h2 className="text-xl font-bold text-[#0b1c30]">Data Booking Tidak Valid</h2>
        <p className="text-xs text-[#3d4a3d] mt-1 mb-6">
          Informasi lapangan atau jam booking belum lengkap. Silakan pilih kembali dari halaman detail.
        </p>
        <Link
          href="/lapangan"
          className="px-6 py-2.5 rounded-xl bg-[#006e2f] text-white text-xs font-bold hover:bg-[#005321] transition-all shadow-md"
        >
          Cari Lapangan
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] font-sans text-[#0b1c30] min-h-screen flex flex-col relative">
      <Navbar />

      <main className="w-full pt-16 bg-[#f8f9ff] flex-1 flex flex-col relative">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Booking Details Card */}
          <div className="col-span-1 lg:col-span-5 bg-[#e5eeff] rounded-2xl shadow-sm overflow-hidden sticky top-24 border border-[#bccbb9]/30">
            <div className="h-44 w-full relative overflow-hidden bg-slate-900">
              <img
                src={court.image_url || getCourtFallbackImage(court.sport_type)}
                alt={court.name}
                className="w-full h-full object-cover opacity-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getCourtFallbackImage(court.sport_type);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#e5eeff] via-[#e5eeff]/20 to-transparent"></div>
              <div className="absolute bottom-3 left-4">
                <span className="inline-flex items-center px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[#004b1e] font-bold text-xs shadow-sm gap-1 border border-white/50 uppercase">
                  {court.sport_type}
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-[#0b1c30]">{court.name}</h2>
                <p className="text-xs font-medium text-[#3d4a3d] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#006e2f]">location_on</span>
                  <span>
                    {court.address}
                    {court.city ? `, ${court.city}` : ''}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl shadow-sm border border-[#bccbb9]/30">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-[#3d4a3d] uppercase tracking-wider">
                    Tanggal
                  </span>
                  <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#006e2f]">
                      calendar_month
                    </span>
                    {formatDateIndo(bookingDate)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-[#3d4a3d] uppercase tracking-wider">
                    Waktu Main
                  </span>
                  <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#006e2f]">
                      schedule
                    </span>
                    {startTime} - {endTime}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 bg-white p-5 rounded-xl shadow-sm border border-[#bccbb9]/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#3d4a3d]">Durasi Sewa</span>
                  <span className="font-semibold text-[#0b1c30]">{durationHours} Jam</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#3d4a3d]">Tarif per Jam</span>
                  <span className="font-semibold text-[#0b1c30]">
                    {formatRupiah(court.price_per_hour)}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full pt-3 border-t border-[#bccbb9]/30 mt-1">
                  <span className="text-xs font-bold text-[#0b1c30] uppercase tracking-wide">
                    Total Pembayaran
                  </span>
                  <span className="text-xl font-extrabold text-[#006e2f]">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Customer Form */}
          <div className="col-span-1 lg:col-span-7 bg-white rounded-2xl shadow-md p-6 lg:p-10 flex flex-col gap-6 border border-[#bccbb9]/30">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl lg:text-2xl font-bold text-[#0b1c30]">Detail Pemesan & Konfirmasi</h1>
              <p className="text-xs text-[#3d4a3d]">
                Periksa data diri dan konfirmasi reservasi lapangan Anda.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-xs font-medium flex items-center gap-2 border border-[#ba1a1a]/30">
                <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
              {/* Name */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-[#3d4a3d] uppercase tracking-wider">
                  Nama Pemesan
                </label>
                <div className="relative flex items-center w-full">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#3d4a3d]/60 text-[20px]">
                    person
                  </span>
                  <input
                    className="w-full bg-[#f8f9ff] text-xs text-[#0b1c30] border border-[#bccbb9]/50 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] font-medium"
                    defaultValue={user?.name || ''}
                    disabled
                    type="text"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-[#3d4a3d] uppercase tracking-wider">
                  Nomor WhatsApp / Kontak
                </label>
                <div className="relative flex items-center w-full">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#3d4a3d]/60 text-[20px]">
                    call
                  </span>
                  <input
                    className="w-full bg-[#f8f9ff] text-xs text-[#0b1c30] border border-[#bccbb9]/50 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] font-medium"
                    defaultValue={user?.phone || '08123456789'}
                    disabled
                    type="tel"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-[#3d4a3d] uppercase tracking-wider">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Mohon sediakan bola futsal tambahan atau raket sewa."
                  className="w-full bg-[#f8f9ff] text-xs text-[#0b1c30] border border-[#bccbb9]/50 rounded-xl p-3 focus:outline-none focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] font-medium resize-none"
                ></textarea>
              </div>

              {/* Guarantee badge */}
              <div className="p-3 bg-[#e5eeff] rounded-xl flex items-center gap-2.5 text-xs text-[#004b1e] font-medium">
                <span className="material-symbols-outlined text-[20px] text-[#006e2f] shrink-0">
                  verified_user
                </span>
                <span>
                  Sistem otomatis mengunci slot jadwal ini sehingga 100% aman dan anti-bentrok.
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end items-center w-full mt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-[#0b1c30] bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs text-white bg-[#006e2f] hover:bg-[#005321] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">
                        progress_activity
                      </span>
                      <span>Memproses Reservasi...</span>
                    </>
                  ) : (
                    <>
                      <span>Konfirmasi & Buat Booking</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0b1c30]/50 backdrop-blur-sm"></div>

          <div className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col items-center gap-5 max-w-md w-full animate-in zoom-in-95 duration-200 border border-[#bccbb9]/30">
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[#006e2f]">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-[#0b1c30]">Reservasi Berhasil Dibuat!</h3>
              <p className="text-xs text-[#3d4a3d] mt-1 leading-relaxed">
                Slot jadwal Anda di <strong className="text-[#0b1c30]">{court.name}</strong> telah
                berhasil dipesan.
              </p>
            </div>

            <div className="w-full bg-[#f8f9ff] rounded-xl p-4 flex items-center justify-between border-l-4 border-[#006e2f] border border-[#bccbb9]/30">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#3d4a3d] uppercase tracking-wider">
                  Kode Booking
                </span>
                <span className="text-base font-extrabold text-[#0b1c30] font-mono tracking-wider mt-0.5">
                  {createdBookingCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-2 rounded-lg bg-white hover:bg-[#e5eeff] text-[#006e2f] border border-[#bccbb9]/30 transition-colors shadow-sm cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Salin Kode"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copied ? 'done' : 'content_copy'}
                </span>
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-[#006e2f] hover:bg-[#005321] transition-all shadow-md cursor-pointer"
            >
              Lihat Riwayat & E-Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KonfirmasiBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
          <span className="text-sm font-semibold text-[#006e2f]">Memuat Checkout...</span>
        </div>
      }
    >
      <KonfirmasiBookingContent />
    </Suspense>
  );
}