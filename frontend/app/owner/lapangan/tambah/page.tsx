'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah } from '@/lib/formatters';
import { getCourtFallbackImage } from '../page';

// Preset Olahraga Populer
const SPORT_OPTIONS = [
  { label: 'Bulutangkis / Badminton', value: 'Badminton', icon: 'sports_tennis' },
  { label: 'Futsal', value: 'Futsal', icon: 'sports_soccer' },
  { label: 'Bola Basket', value: 'Basket', icon: 'sports_basketball' },
  { label: 'Tenis Lapangan', value: 'Tenis', icon: 'sports_tennis' },
  { label: 'Mini Soccer', value: 'Mini Soccer', icon: 'sports_soccer' },
  { label: 'Bola Voli', value: 'Voli', icon: 'sports_volleyball' },
  { label: 'Tenis Meja / Pingpong', value: 'Tenis Meja', icon: 'sports_baseball' },
  { label: 'Padel', value: 'Padel', icon: 'sports_tennis' },
];

// Preset Gambar Berkualitas Tinggi untuk Dipilih
const PRESET_IMAGES = [
  {
    name: 'Badminton Indoor',
    sport: 'Badminton',
    url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Futsal Rumput Sintetis',
    sport: 'Futsal',
    url: 'https://images.unsplash.com/photo-1529900240051-06c3960f703f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Lapangan Basket Kayu',
    sport: 'Basket',
    url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tenis Lapangan Keras',
    sport: 'Tenis',
    url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Mini Soccer Arena',
    sport: 'Mini Soccer',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
  },
];

// Kota Populer Indonesia
const POPULAR_CITIES = [
  'Jakarta Selatan',
  'Jakarta Barat',
  'Jakarta Pusat',
  'Jakarta Timur',
  'Jakarta Utara',
  'Bandung',
  'Surabaya',
  'Semarang',
  'Tangerang',
  'Tangerang Selatan',
  'Bekasi',
  'Depok',
  'Bogor',
  'Yogyakarta',
  'Surakarta (Solo)',
  'Malang',
  'Denpasar (Bali)',
  'Medan',
  'Makassar',
];

export default function TambahLapangan() {
  const router = useRouter();
  const { token, refreshUser, user } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('');
  const [customSport, setCustomSport] = useState('');
  const [pricePerHour, setPricePerHour] = useState<number | ''>('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // UI & Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [planLimitError, setPlanLimitError] = useState<{ message: string; planName?: string } | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const finalSportType = sportType === 'OTHER' ? customSport : sportType;

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setPlanLimitError(null);

    // Client-side validation
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Nama lapangan wajib diisi';
    if (!finalSportType.trim()) errors.sport_type = 'Pilih atau masukkan jenis olahraga';
    if (!pricePerHour || Number(pricePerHour) <= 0) errors.price_per_hour = 'Harga per jam harus lebih dari 0';
    if (!address.trim()) errors.address = 'Alamat lengkap wajib diisi';
    if (!city.trim()) errors.city = 'Kota/Kabupaten wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!token) {
      setGeneralError('Sesi Anda telah berakhir. Silakan login kembali.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        sport_type: finalSportType.trim(),
        price_per_hour: Number(pricePerHour),
        address: address.trim(),
        city: city.trim(),
        district: district.trim() ? district.trim() : null,
        description: description.trim() ? description.trim() : null,
        image_url: imageUrl.trim() ? imageUrl.trim() : null,
        status: status,
      };

      const res = await api.post('/courts', payload, token);

      if (res?.success) {
        setShowSuccessToast(true);
        if (refreshUser) refreshUser();

        // Redirect to /owner/lapangan after 1.2 seconds
        setTimeout(() => {
          router.push('/owner/lapangan');
        }, 1200);
      } else {
        // Check if 403 plan limit error or validation error
        if (res?.message && (res.message.includes('Batas maksimal') || res.message.includes('upgrade'))) {
          setPlanLimitError({
            message: res.message,
            planName: user?.subscription?.plan_name || 'FREE',
          });
        } else if (res?.errors) {
          const backendErrors: Record<string, string> = {};
          Object.keys(res.errors).forEach((k) => {
            backendErrors[k] = Array.isArray(res.errors[k]) ? res.errors[k][0] : res.errors[k];
          });
          setFieldErrors(backendErrors);
          setGeneralError('Harap periksa kembali isian formulir di bawah.');
        } else {
          setGeneralError(res?.message || 'Gagal menambahkan lapangan baru.');
        }
      }
    } catch (err) {
      console.error('Error submitting court:', err);
      setGeneralError('Terjadi gangguan jaringan saat mengirim data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-8 max-w-5xl mx-auto pb-24">
      {/* Success Notification */}
      {showSuccessToast && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl bg-[#006e2f] text-white border border-[#22c55e]/40 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          <div>
            <p className="font-bold text-sm">Berhasil Menambahkan Lapangan!</p>
            <p className="text-xs text-white/90">Mengalihkan ke daftar lapangan...</p>
          </div>
        </div>
      )}

      {/* Plan Limit Error Modal (403) */}
      {planLimitError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-[#bccbb9]/30 flex flex-col gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">lock_reset</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0b1c30]">Batas Kuota Lapangan Tercapai</h3>
              <p className="text-sm text-[#3d4a3d] mt-2 leading-relaxed">
                {planLimitError.message}
              </p>
            </div>
            <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#bccbb9]/30 text-left flex items-start gap-3">
              <span className="material-symbols-outlined text-[#006e2f] text-[22px] shrink-0 mt-0.5">
                stars
              </span>
              <div>
                <p className="text-xs font-bold text-[#0b1c30]">Upgrade ke Paket Pro / Unlimited</p>
                <p className="text-xs text-[#3d4a3d] mt-0.5">
                  Dapatkan kuota lapangan tanpa batas, fitur analitik lanjutan, dan sistem booking multi-cabang.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setPlanLimitError(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#3d4a3d] hover:bg-[#eff4ff] transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <Link
                href="/owner/pengaturan"
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#006e2f] text-white hover:bg-[#006e2f]/90 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">upgrade</span>
                Upgrade Paket Sekarang
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <Link
          href="/owner/lapangan"
          className="flex items-center text-[#3d4a3d] hover:text-[#006e2f] transition-colors text-sm font-semibold w-fit group cursor-pointer"
        >
          <span className="material-symbols-outlined mr-1 text-[18px] group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          Kembali ke Manajemen Lapangan
        </Link>
        <h1 className="text-3xl font-bold text-[#0b1c30] tracking-tight mt-2">Tambah Lapangan Baru</h1>
        <p className="text-base text-[#3d4a3d] max-w-2xl">
          Lengkapi formulir di bawah untuk mendaftarkan fasilitas lapangan olahraga baru. Data akan langsung terhubung ke marketplace dan sistem reservasi Lapangin.
        </p>
      </div>

      {/* Error Banner */}
      {generalError && (
        <div className="bg-[#ffdad6]/60 border border-[#ba1a1a]/30 p-4 rounded-xl text-[#ba1a1a] flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px] shrink-0">error</span>
          <p className="text-sm font-semibold">{generalError}</p>
        </div>
      )}

      {/* Form Tambah Lapangan */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Card 1: Informasi Umum Lapangan */}
        <section className="bg-[#ffffff] rounded-2xl shadow-sm border border-[#bccbb9]/30 p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#bccbb9]/20">
            <div className="w-9 h-9 rounded-xl bg-[#22c55e]/20 flex items-center justify-center text-[#006e2f]">
              <span className="material-symbols-outlined text-[22px]">info</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0b1c30]">1. Informasi Umum</h2>
              <p className="text-xs text-[#3d4a3d]">Nama lapangan, tipe olahraga, dan tarif sewa per jam.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Lapangan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#0b1c30]" htmlFor="nama_lapangan">
                Nama Lapangan <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="nama_lapangan"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full bg-[#f8f9ff] text-[#0b1c30] placeholder:text-[#3d4a3d]/50 px-4 py-3 rounded-xl border ${
                  fieldErrors.name ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'
                } focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12`}
                placeholder="Contoh: Lapangan Bulutangkis Alpha - Court 1"
              />
              {fieldErrors.name && (
                <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.name}</span>
              )}
            </div>

            {/* Jenis Olahraga */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#0b1c30]" htmlFor="jenis_olahraga">
                Jenis Olahraga <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  id="jenis_olahraga"
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value)}
                  className={`appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border ${
                    fieldErrors.sport_type ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'
                  } focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12 cursor-pointer`}
                >
                  <option value="" disabled>Pilih Jenis Olahraga</option>
                  {SPORT_OPTIONS.map((sport) => (
                    <option key={sport.value} value={sport.value}>
                      {sport.label}
                    </option>
                  ))}
                  <option value="OTHER">Lainnya (Tulis Sendiri)...</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">
                  expand_more
                </span>
              </div>
              {sportType === 'OTHER' && (
                <input
                  type="text"
                  value={customSport}
                  onChange={(e) => setCustomSport(e.target.value)}
                  placeholder="Ketik jenis olahraga (cth: Squash, Pickleball)"
                  className="mt-2 w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-2 rounded-xl border border-[#bccbb9]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]"
                />
              )}
              {fieldErrors.sport_type && (
                <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.sport_type}</span>
              )}
            </div>
          </div>

          {/* Harga per Jam */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[#0b1c30]" htmlFor="harga">
                Tarif Sewa per Jam <span className="text-[#ba1a1a]">*</span>
              </label>
              {pricePerHour && Number(pricePerHour) > 0 && (
                <span className="text-xs font-bold text-[#006e2f] bg-[#22c55e]/15 px-2.5 py-0.5 rounded-md">
                  Preview: {formatRupiah(pricePerHour)} / jam
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#3d4a3d] font-bold text-sm select-none">
                Rp
              </span>
              <input
                id="harga"
                type="number"
                min="1"
                step="1000"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                className={`w-full bg-[#f8f9ff] text-[#0b1c30] placeholder:text-[#3d4a3d]/50 pl-12 pr-4 py-3 rounded-xl border ${
                  fieldErrors.price_per_hour ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'
                } focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12 font-medium`}
                placeholder="100000"
              />
            </div>
            {fieldErrors.price_per_hour && (
              <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.price_per_hour}</span>
            )}
            <p className="text-xs font-medium text-[#3d4a3d]">
              Harga dasar sewa reguler. Anda dapat mengaktifkan jadwal dinamis di menu Jadwal.
            </p>
          </div>

          {/* Deskripsi Fasilitas */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#0b1c30]" htmlFor="deskripsi">
              Deskripsi Fasilitas & Keunggulan
            </label>
            <textarea
              id="deskripsi"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#f8f9ff] text-[#0b1c30] placeholder:text-[#3d4a3d]/50 px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm resize-y"
              placeholder="Jelaskan jenis lantai (vinyl/karpet/kayu), penerangan (lux), fasilitas AC, shower air hangat, loker, area parkir, kantin..."
            />
          </div>

          {/* Toggle Status Aktif */}
          <div className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-xl border border-[#bccbb9]/30 mt-1">
            <div>
              <p className="text-sm font-bold text-[#0b1c30]">Status Awal Lapangan</p>
              <p className="text-xs text-[#3d4a3d]">
                {status === 'ACTIVE'
                  ? 'Langsung aktif dan dapat dipesan oleh pemain setelah disimpan.'
                  : 'Non-aktif (lapangan tersimpan namun disembunyikan sementara dari booking).'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStatus(status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 ${
                status === 'ACTIVE'
                  ? 'bg-[#006e2f] text-white hover:bg-[#006e2f]/90'
                  : 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-red-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {status === 'ACTIVE' ? 'check_circle' : 'pause_circle'}
              </span>
              <span>{status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}</span>
            </button>
          </div>
        </section>

        {/* Card 2: Lokasi & Alamat */}
        <section className="bg-[#ffffff] rounded-2xl shadow-sm border border-[#bccbb9]/30 p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#bccbb9]/20">
            <div className="w-9 h-9 rounded-xl bg-[#005ac2]/15 flex items-center justify-center text-[#005ac2]">
              <span className="material-symbols-outlined text-[22px]">location_on</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0b1c30]">2. Lokasi Lapangan</h2>
              <p className="text-xs text-[#3d4a3d]">Alamat venue agar mudah ditemukan oleh pelanggan di peta.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kota / Kabupaten */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#0b1c30]" htmlFor="kota">
                Kota / Kabupaten <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <input
                  id="kota"
                  type="text"
                  list="city-options"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full bg-[#f8f9ff] text-[#0b1c30] placeholder:text-[#3d4a3d]/50 px-4 py-3 rounded-xl border ${
                    fieldErrors.city ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'
                  } focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12`}
                  placeholder="Ketik atau pilih kota (cth: Jakarta Selatan)"
                />
                <datalist id="city-options">
                  {POPULAR_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              {fieldErrors.city && (
                <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.city}</span>
              )}
            </div>

            {/* Kecamatan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#0b1c30]" htmlFor="kecamatan">
                Kecamatan (Opsional)
              </label>
              <input
                id="kecamatan"
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#f8f9ff] text-[#0b1c30] placeholder:text-[#3d4a3d]/50 px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12"
                placeholder="Contoh: Kebayoran Baru / Cilandak"
              />
            </div>
          </div>

          {/* Alamat Lengkap */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#0b1c30]" htmlFor="alamat">
              Alamat Lengkap Venue <span className="text-[#ba1a1a]">*</span>
            </label>
            <textarea
              id="alamat"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`w-full bg-[#f8f9ff] text-[#0b1c30] placeholder:text-[#3d4a3d]/50 px-4 py-3 rounded-xl border ${
                fieldErrors.address ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'
              } focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm resize-y`}
              placeholder="Masukkan nama jalan, nomor kavling, nama gedung/gor, patokan terdekat."
            />
            {fieldErrors.address && (
              <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.address}</span>
            )}
          </div>
        </section>

        {/* Card 3: Foto & Media Visual */}
        <section className="bg-[#ffffff] rounded-2xl shadow-sm border border-[#bccbb9]/30 p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#bccbb9]/20">
            <div className="w-9 h-9 rounded-xl bg-[#82abff]/25 flex items-center justify-center text-[#005ac2]">
              <span className="material-symbols-outlined text-[22px]">add_photo_alternate</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0b1c30]">3. Foto Lapangan</h2>
              <p className="text-xs text-[#3d4a3d]">Pilih foto preset siap pakai atau masukkan link URL foto fasilitas Anda.</p>
            </div>
          </div>

          {/* URL Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#0b1c30]" htmlFor="image_url">
              URL Foto Lapangan (Opsional)
            </label>
            <div className="flex gap-2">
              <input
                id="image_url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 bg-[#f8f9ff] text-[#0b1c30] placeholder:text-[#3d4a3d]/50 px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12"
                placeholder="https://images.unsplash.com/..."
              />
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="px-4 h-12 rounded-xl bg-[#ffdad6] text-[#ba1a1a] hover:bg-red-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>

          {/* Pilihan Foto Cepat (Preset Images) */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-[#3d4a3d]">Atau Pilih Foto Berkualitas Tinggi (1-Klik):</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {PRESET_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => {
                    setImageUrl(preset.url);
                    if (!sportType) setSportType(preset.sport);
                  }}
                  className={`group relative h-28 rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left ${
                    imageUrl === preset.url
                      ? 'border-[#006e2f] ring-2 ring-[#006e2f]/30 shadow-md'
                      : 'border-transparent hover:border-[#006e2f]/50'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                    <span className="text-[11px] font-bold text-white leading-tight">
                      {preset.name}
                    </span>
                    <span className="text-[9px] text-emerald-300 font-semibold uppercase">
                      {preset.sport}
                    </span>
                  </div>
                  {imageUrl === preset.url && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#006e2f] text-white flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Image Card */}
          <div className="mt-2 p-4 rounded-xl bg-[#f8f9ff] border border-[#bccbb9]/30 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-32 h-20 rounded-lg overflow-hidden bg-[#e5eeff] shrink-0 border border-[#bccbb9]/30">
              <img
                src={imageUrl || getCourtFallbackImage(finalSportType)}
                alt="Preview Lapangan"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getCourtFallbackImage(finalSportType);
                }}
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-[#0b1c30]">Pratinjau Tampilan Visual</p>
              <p className="text-[11px] text-[#3d4a3d] mt-0.5">
                {imageUrl
                  ? 'Foto terpilih akan ditampilkan di kartu lapangan dan halaman booking pelanggan.'
                  : 'Jika tidak memilih foto, gambar ilustrasi olahraga akan otomatis digunakan sebagai cadangan.'}
              </p>
            </div>
          </div>
        </section>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-6 z-30 flex items-center justify-between gap-4 bg-[#ffffff]/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#bccbb9]/30">
          <Link
            href="/owner/lapangan"
            className="px-6 py-3 rounded-xl font-semibold text-xs text-[#3d4a3d] hover:bg-[#eff4ff] transition-colors flex items-center justify-center cursor-pointer"
          >
            Batal
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl font-bold text-xs bg-[#006e2f] text-[#ffffff] hover:bg-[#006e2f]/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  <span>Menyimpan Lapangan...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Simpan & Daftarkan Lapangan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
