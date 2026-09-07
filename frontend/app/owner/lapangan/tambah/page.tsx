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

// Preset Gambar Berkualitas Tinggi
const PRESET_IMAGES = [
  { name: 'Badminton Indoor', sport: 'Badminton', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80' },
  { name: 'Futsal Rumput Sintetis', sport: 'Futsal', url: 'https://images.unsplash.com/photo-1529900240051-06c3960f703f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lapangan Basket Kayu', sport: 'Basket', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tenis Lapangan Keras', sport: 'Tenis', url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mini Soccer Arena', sport: 'Mini Soccer', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80' },
];

// Data Kota & Kecamatan Berjenjang
const CITY_DISTRICTS: Record<string, string[]> = {
  'Jakarta Selatan': ['Cilandak', 'Jagakarsa', 'Kebayoran Baru', 'Kebayoran Lama', 'Mampang Prapatan', 'Pancoran', 'Pasar Minggu', 'Pesanggrahan', 'Setiabudi', 'Tebet'],
  'Jakarta Barat': ['Cengkareng', 'Grogol Petamburan', 'Taman Sari', 'Tambora', 'Kebon Jeruk', 'Kalideres', 'Palmerah', 'Kembangan'],
  'Jakarta Pusat': ['Cempaka Putih', 'Gambir', 'Johar Baru', 'Kemayoran', 'Menteng', 'Sawah Besar', 'Senen', 'Tanah Abang'],
  'Jakarta Timur': ['Cakung', 'Cipayung', 'Ciracas', 'Duren Sawit', 'Jatinegara', 'Kramat Jati', 'Makasar', 'Matraman', 'Pasar Rebo', 'Pulo Gadung'],
  'Jakarta Utara': ['Cilincing', 'Kelapa Gading', 'Koja', 'Pademangan', 'Penjaringan', 'Tanjung Priok'],
  'Semarang': ['Banyumanik', 'Candisari', 'Gajahmungkur', 'Gayamsari', 'Genuk', 'Gunungpati', 'Mijen', 'Ngaliyan', 'Pedurungan', 'Semarang Barat', 'Semarang Selatan', 'Semarang Tengah', 'Semarang Timur', 'Semarang Utara', 'Tembalang', 'Tugu'],
  'Bandung': ['Andir', 'Antapani', 'Arcamanik', 'Astanaanyar', 'Babakan Ciparay', 'Bandung Kidul', 'Bandung Kulon', 'Bandung Wetan', 'Batununggal', 'Bojongloa Kaler', 'Bojongloa Kidul', 'Buahbatu', 'Cibeunying Kaler', 'Cibeunying Kidul', 'Cibiru', 'Cicendo', 'Cidadap', 'Cinambo', 'Coblong', 'Gedebage', 'Kiaracondong', 'Lengkong', 'Mandalajati', 'Panyileukan', 'Rancasari', 'Regol', 'Sukajadi', 'Sukasari', 'Sumur Bandung', 'Ujungberung'],
  'Surabaya': ['Asemrowo', 'Benowo', 'Bubutan', 'Bulak', 'Dukuh Pakis', 'Gayungan', 'Genteng', 'Gubeng', 'Gunung Anyar', 'Jambangan', 'Karang Pilang', 'Kenjeran', 'Krembangan', 'Lakarsantri', 'Mulyorejo', 'Pabean Cantian', 'Pakal', 'Rungkut', 'Sambikerep', 'Sawahan', 'Semampir', 'Simokerto', 'Sukolilo', 'Sukomanunggal', 'Tambaksari', 'Tandes', 'Tegalsari', 'Tenggilis Mejoyo', 'Wiyung', 'Wonocolo', 'Wonokromo']
};

// Data Fasilitas Opsional
const AMENITIES = [
  { id: 'parking', label: 'Area Parkir Luas', icon: 'local_parking' },
  { id: 'shower', label: 'Kamar Mandi / Shower', icon: 'shower' },
  { id: 'toilet', label: 'Toilet Umum', icon: 'wc' },
  { id: 'canteen', label: 'Kantin / Cafe', icon: 'restaurant' },
  { id: 'locker', label: 'Loker Barang', icon: 'lock' },
  { id: 'waiting_room', label: 'Ruang Tunggu / Tribun', icon: 'chair' },
];

export default function TambahLapangan() {
  const router = useRouter();
  const { token, refreshUser, user } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('');
  const [customSport, setCustomSport] = useState('');
  const [pricePerHour, setPricePerHour] = useState<number | ''>('');
  
  // Location State
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  
  // Detail State
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
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
  const availableDistricts = CITY_DISTRICTS[city] || [];

  // Toggle Fasilitas
  const handleToggleAmenity = (id: string) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // Handle City Change
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(e.target.value);
    setDistrict(''); // Reset kecamatan jika kota berubah
  };

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
    
    // Validasi Limit Tarif
    if (!pricePerHour || Number(pricePerHour) < 10000) {
      errors.price_per_hour = 'Tarif sewa minimal Rp 10.000 / jam';
    } else if (Number(pricePerHour) > 5000000) {
      errors.price_per_hour = 'Tarif maksimal Rp 5.000.000 / jam. Periksa kembali input Anda.';
    }

    if (!city.trim()) errors.city = 'Kota/Kabupaten wajib dipilih';
    if (!address.trim()) errors.address = 'Alamat lengkap wajib diisi';

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

    // Gabungkan fasilitas ke dalam deskripsi agar terbaca di backend
    const compiledDescription = selectedAmenities.length > 0
      ? `Fasilitas Tersedia: ${selectedAmenities.map(a => AMENITIES.find(x => x.id === a)?.label).join(', ')}.\n\n${description.trim()}`
      : description.trim();

    try {
      const payload = {
        name: name.trim(),
        sport_type: finalSportType.trim(),
        price_per_hour: Number(pricePerHour),
        address: address.trim(),
        city: city.trim(),
        district: district.trim() ? district.trim() : null,
        description: compiledDescription ? compiledDescription : null,
        image_url: imageUrl.trim() ? imageUrl.trim() : null,
        status: status,
      };

      const res = await api.post('/courts', payload, token);

      if (res?.success) {
        setShowSuccessToast(true);
        if (refreshUser) refreshUser();

        setTimeout(() => {
          router.push('/owner/lapangan');
        }, 1200);
      } else {
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
              <span className="material-symbols-outlined text-[#006e2f] text-[22px] shrink-0 mt-0.5">stars</span>
              <div>
                <p className="text-xs font-bold text-[#0b1c30]">Upgrade ke Paket Pro / Unlimited</p>
                <p className="text-xs text-[#3d4a3d] mt-0.5">Dapatkan kuota lapangan tanpa batas, fitur analitik lanjutan, dan sistem booking multi-cabang.</p>
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
        <Link href="/owner/lapangan" className="flex items-center text-[#3d4a3d] hover:text-[#006e2f] transition-colors text-sm font-semibold w-fit group cursor-pointer">
          <span className="material-symbols-outlined mr-1 text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Kembali ke Manajemen Lapangan
        </Link>
        <h1 className="text-3xl font-bold text-[#0b1c30] tracking-tight mt-2">Tambah Lapangan Baru</h1>
        <p className="text-base text-[#3d4a3d] max-w-2xl">
          Lengkapi formulir di bawah untuk mendaftarkan fasilitas lapangan olahraga baru ke dalam sistem Lapangin.
        </p>
      </div>

      {generalError && (
        <div className="bg-[#ffdad6]/60 border border-[#ba1a1a]/30 p-4 rounded-xl text-[#ba1a1a] flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px] shrink-0">error</span>
          <p className="text-sm font-semibold">{generalError}</p>
        </div>
      )}

      {/* Form Tambah Lapangan */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Card 1: Informasi Umum */}
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
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#0b1c30]" htmlFor="nama_lapangan">
                Nama Lapangan <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="nama_lapangan"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border ${fieldErrors.name ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'} focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12`}
                placeholder="Contoh: Lapangan Bulutangkis Alpha - Court 1"
              />
              {fieldErrors.name && <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.name}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#0b1c30]" htmlFor="jenis_olahraga">
                Jenis Olahraga <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  id="jenis_olahraga"
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value)}
                  className={`appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border ${fieldErrors.sport_type ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'} focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12 cursor-pointer`}
                >
                  <option value="" disabled>Pilih Jenis Olahraga</option>
                  {SPORT_OPTIONS.map((sport) => (
                    <option key={sport.value} value={sport.value}>{sport.label}</option>
                  ))}
                  <option value="OTHER">Lainnya (Tulis Sendiri)...</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
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
              {fieldErrors.sport_type && <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.sport_type}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-1/2 md:pr-3">
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
              <span className="absolute left-4 text-[#3d4a3d] font-bold text-sm select-none">Rp</span>
              <input
                id="harga"
                type="number"
                min="10000"
                step="5000"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                className={`w-full bg-[#f8f9ff] text-[#0b1c30] pl-12 pr-4 py-3 rounded-xl border ${fieldErrors.price_per_hour ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'} focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12 font-medium`}
                placeholder="100000"
              />
            </div>
            {fieldErrors.price_per_hour ? (
              <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.price_per_hour}</span>
            ) : (
              <p className="text-xs font-medium text-[#3d4a3d]">Batas maksimal pengisian adalah Rp 5.000.000/jam.</p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-xl border border-[#bccbb9]/30 mt-2">
            <div>
              <p className="text-sm font-bold text-[#0b1c30]">Status Awal Lapangan</p>
              <p className="text-xs text-[#3d4a3d]">{status === 'ACTIVE' ? 'Langsung aktif dan dapat dipesan oleh pemain setelah disimpan.' : 'Non-aktif (lapangan tersimpan namun disembunyikan sementara).'}</p>
            </div>
            <button
              type="button"
              onClick={() => setStatus(status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 ${status === 'ACTIVE' ? 'bg-[#006e2f] text-white hover:bg-[#006e2f]/90' : 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-red-200'}`}
            >
              <span className="material-symbols-outlined text-[16px]">{status === 'ACTIVE' ? 'check_circle' : 'pause_circle'}</span>
              <span>{status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}</span>
            </button>
          </div>
        </section>

        {/* Card 2: Lokasi & Alamat (Dropdown Berjenjang Presisi) */}
        <section className="bg-[#ffffff] rounded-2xl shadow-sm border border-[#bccbb9]/30 p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#bccbb9]/20">
            <div className="w-9 h-9 rounded-xl bg-[#005ac2]/15 flex items-center justify-center text-[#005ac2]">
              <span className="material-symbols-outlined text-[22px]">location_on</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0b1c30]">2. Lokasi Lapangan</h2>
              <p className="text-xs text-[#3d4a3d]">Pilih kota dan kecamatan agar lapangan mudah ditemukan di peta pencarian.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kota / Kabupaten (Dropdown) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#0b1c30]" htmlFor="kota">
                Kota / Kabupaten <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select
                  id="kota"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setDistrict(''); // Reset kecamatan saat kota diganti
                  }}
                  className={`appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border ${fieldErrors.city ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'} focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12 cursor-pointer`}
                >
                  <option value="" disabled>Pilih Kota / Kabupaten...</option>
                  {Object.keys(CITY_DISTRICTS).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
              </div>
              {fieldErrors.city && <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.city}</span>}
            </div>

            {/* Kecamatan (Dropdown Berjenjang) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#0b1c30]" htmlFor="kecamatan">
                Kecamatan
              </label>
              <div className="relative">
                <select
                  id="kecamatan"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!city}
                  className="appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] disabled:bg-gray-100 disabled:text-gray-400 px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12 cursor-pointer"
                >
                  <option value="">{!city ? 'Pilih Kota terlebih dahulu...' : 'Pilih Kecamatan...'}</option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#0b1c30]" htmlFor="alamat">
              Alamat Lengkap Venue <span className="text-[#ba1a1a]">*</span>
            </label>
            <textarea
              id="alamat"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border ${fieldErrors.address ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'} focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm resize-y`}
              placeholder="Masukkan nama jalan, nomor kavling, nama gedung/gor, patokan terdekat."
            />
            {fieldErrors.address && <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.address}</span>}
          </div>
        </section>

        {/* Card 3: Fasilitas Tambahan & Media Visual */}
        <section className="bg-[#ffffff] rounded-2xl shadow-sm border border-[#bccbb9]/30 p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#bccbb9]/20">
            <div className="w-9 h-9 rounded-xl bg-[#82abff]/25 flex items-center justify-center text-[#005ac2]">
              <span className="material-symbols-outlined text-[22px]">add_photo_alternate</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0b1c30]">3. Fasilitas & Media Visual</h2>
              <p className="text-xs text-[#3d4a3d]">Pilih fasilitas tambahan dan atur foto untuk menarik perhatian pelanggan.</p>
            </div>
          </div>

          {/* Fasilitas Checkboxes */}
          <div className="flex flex-col gap-2 mb-2">
            <label className="text-sm font-bold text-[#0b1c30]">Fasilitas yang Tersedia</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
              {AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.id);
                return (
                  <button
                    type="button"
                    key={amenity.id}
                    onClick={() => handleToggleAmenity(amenity.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                      isSelected 
                        ? 'bg-[#22c55e]/10 border-[#006e2f]/50 text-[#006e2f]' 
                        : 'bg-white border-[#bccbb9]/40 text-[#3d4a3d] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{amenity.icon}</span>
                    <span className="text-[11px] font-bold leading-tight">{amenity.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#0b1c30]" htmlFor="deskripsi">
              Deskripsi Tambahan (Opsional)
            </label>
            <textarea
              id="deskripsi"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm resize-y"
              placeholder="Tuliskan keunggulan lain: jenis lantai (vinyl/karpet), penerangan (lux), aturan penggunaan..."
            />
          </div>

          <div className="flex flex-col gap-1.5 mt-2 border-t border-[#bccbb9]/20 pt-4">
            <label className="text-sm font-bold text-[#0b1c30]" htmlFor="image_url">URL Foto Lapangan</label>
            <div className="flex gap-2">
              <input
                id="image_url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12"
                placeholder="https://images.unsplash.com/..."
              />
              {imageUrl && (
                <button type="button" onClick={() => setImageUrl('')} className="px-4 h-12 rounded-xl bg-[#ffdad6] text-[#ba1a1a] hover:bg-red-200 text-xs font-bold transition-colors cursor-pointer">
                  Hapus
                </button>
              )}
            </div>
          </div>

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
                  className={`group relative h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left ${imageUrl === preset.url ? 'border-[#006e2f] ring-2 ring-[#006e2f]/30 shadow-md' : 'border-transparent hover:border-[#006e2f]/50'}`}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-white leading-tight">{preset.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-6 z-30 flex items-center justify-between gap-4 bg-[#ffffff]/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#bccbb9]/30">
          <Link href="/owner/lapangan" className="px-6 py-3 rounded-xl font-semibold text-xs text-[#3d4a3d] hover:bg-[#eff4ff] transition-colors flex items-center justify-center cursor-pointer">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl font-bold text-xs bg-[#006e2f] text-[#ffffff] hover:bg-[#006e2f]/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
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
      </form>
    </div>
  );
}