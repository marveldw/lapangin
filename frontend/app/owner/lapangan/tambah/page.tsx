'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah } from '@/lib/formatters';
import { getMaxCourtsAllowed, isCourtQuotaExceeded } from '@/lib/planLimits';

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

const PRESET_IMAGES = [
  { name: 'Badminton Indoor', sport: 'Badminton', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80' },
  { name: 'Futsal Rumput Sintetis', sport: 'Futsal', url: 'https://images.unsplash.com/photo-1529900240051-06c3960f703f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lapangan Basket Kayu', sport: 'Basket', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tenis Lapangan Keras', sport: 'Tenis', url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mini Soccer Arena', sport: 'Mini Soccer', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80' },
];

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

const AMENITIES = [
  { id: 'parking', label: 'Area Parkir Luas', icon: 'local_parking' },
  { id: 'shower', label: 'Kamar Mandi / Shower', icon: 'shower' },
  { id: 'toilet', label: 'Toilet Umum', icon: 'wc' },
  { id: 'canteen', label: 'Kantin / Cafe', icon: 'restaurant' },
  { id: 'locker', label: 'Loker Barang', icon: 'lock' },
  { id: 'waiting_room', label: 'Ruang Tunggu / Tribun', icon: 'chair' },
];

export function getCourtFallbackImage(sportType?: string): string {
  const sport = (sportType || '').toLowerCase();
  if (sport.includes('badminton') || sport.includes('bulutangkis')) {
    return 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80';
  }
  if (sport.includes('futsal')) {
    return 'https://images.unsplash.com/photo-1529900240051-06c3960f703f?auto=format&fit=crop&w=800&q=80';
  }
  if (sport.includes('basket')) {
    return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80';
  }
  if (sport.includes('tenis') || sport.includes('tennis')) {
    return 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80';
  }
  if (sport.includes('soccer') || sport.includes('sepak bola') || sport.includes('mini soccer')) {
    return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80';
  }
  if (sport.includes('padel')) {
    return 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80';
  }
  if (sport.includes('voli') || sport.includes('volleyball')) {
    return 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80';
}

export default function TambahLapangan() {
  const router = useRouter();
  const { token, refreshUser, user } = useAuth();

  // State Pengecekan Kuota Awal
  const [checkingQuota, setCheckingQuota] = useState(true);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [currentCourtsCount, setCurrentCourtsCount] = useState(0);
  const [maxCourtsAllowed, setMaxCourtsAllowed] = useState<number | null>(1);

  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('');
  const [customSport, setCustomSport] = useState('');
  const [pricePerHour, setPricePerHour] = useState<number | ''>('');
  
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('23:00');
  
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  
  const [rules, setRules] = useState('- Wajib menggunakan sepatu olahraga khusus indoor.\n- Dilarang membawa makanan berat ke dalam area lapangan.\n- Dilarang merokok di area GOR.');
  const [refundPolicy, setRefundPolicy] = useState('Booking yang sudah dibayar tidak dapat dibatalkan (Non-refundable). Jika ada kendala cuaca pada lapangan outdoor, jadwal bisa di-reschedule.');

  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [planLimitError, setPlanLimitError] = useState<{ message: string; planName?: string } | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const finalSportType = sportType === 'OTHER' ? customSport : sportType;

  const [cityList, setCityList] = useState<string[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // 1. Validasi Kuota Lapangan Langsung Saat Halaman Dibuka
  useEffect(() => {
    async function checkOwnerQuota() {
      if (!token) return;
      setCheckingQuota(true);
      try {
        const res = await api.get('/owner/courts', token);
        const courts = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const totalCourts = courts.length;
        setCurrentCourtsCount(totalCourts);

        const maxLimit = getMaxCourtsAllowed(user?.subscription);
        setMaxCourtsAllowed(maxLimit);
        setQuotaExceeded(isCourtQuotaExceeded(totalCourts, maxLimit));
      } catch (err) {
        console.error('Gagal mengecek kuota lapangan:', err);
      } finally {
        setCheckingQuota(false);
      }
    }
    checkOwnerQuota();
  }, [token, user]);

  // 2. Fetch cities on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCities() {
      try {
        const res = await api.get('/public/cities');
        if (isMounted && res.success && Array.isArray(res.data)) {
          setCityList(res.data.filter(Boolean));
        }
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    }
    loadCities();
    return () => { isMounted = false; };
  }, []);

  // 3. Fetch districts when city changes
  useEffect(() => {
    if (!city) {
      setAvailableDistricts([]);
      setDistrict('');
      return;
    }
    let isMounted = true;
    async function loadDistricts() {
      setLoadingDistricts(true);
      try {
        const res = await api.get(`/public/cities/${encodeURIComponent(city)}/districts`);
        if (isMounted && res.success && Array.isArray(res.data)) {
          setAvailableDistricts(res.data.filter(Boolean));
        } else if (isMounted) {
          setAvailableDistricts(CITY_DISTRICTS[city] || []);
        }
      } catch (err) {
        console.error('Failed to load districts:', err);
        if (isMounted) setAvailableDistricts(CITY_DISTRICTS[city] || []);
      } finally {
        if (isMounted) setLoadingDistricts(false);
      }
    }
    loadDistricts();
    return () => { isMounted = false; };
  }, [city]);

  const handleToggleAmenity = (id: string) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quotaExceeded) return;

    setGeneralError(null);
    setFieldErrors({});
    setPlanLimitError(null);

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Nama lapangan wajib diisi';
    if (!finalSportType.trim()) errors.sport_type = 'Pilih atau masukkan jenis olahraga';
    
    if (!pricePerHour || Number(pricePerHour) < 10000) {
      errors.price_per_hour = 'Tarif sewa minimal Rp 10.000 / jam';
    } else if (Number(pricePerHour) > 5000000) {
      errors.price_per_hour = 'Tarif maksimal Rp 5.000.000 / jam.';
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
    const normalizedCloseTime = closeTime === '00:00' ? '23:59' : closeTime;
    const baseDescription = description.trim() ? `${description.trim()}\n\n` : '';
    const rulesSection = rules.trim() ? `Aturan Venue:\n${rules.trim()}\n\n` : '';
    const refundSection = refundPolicy.trim() ? `Kebijakan Refund & Reschedule:\n${refundPolicy.trim()}` : '';

    const compiledDescription = `Jam Operasional: ${openTime} - ${normalizedCloseTime}\n${
      selectedAmenities.length > 0
        ? `Fasilitas Tersedia: ${selectedAmenities.map(a => AMENITIES.find(x => x.id === a)?.label).join(', ')}.\n\n`
        : '\n'
    }${baseDescription}${rulesSection}${refundSection}`;

    const validImageUrl = selectedPhotos.length > 0 && selectedPhotos[0].startsWith('http')
      ? selectedPhotos[0]
      : getCourtFallbackImage(finalSportType);

    try {
      const payload = {
        name: name.trim(),
        sport_type: finalSportType.trim(),
        price_per_hour: Number(pricePerHour),
        open_time: openTime,
        close_time: normalizedCloseTime,
        address: address.trim(),
        city: city.trim(),
        district: district.trim() ? district.trim() : null,
        description: compiledDescription ? compiledDescription : null,
        image_url: validImageUrl,
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
        } else {
          setGeneralError(res?.message || 'Gagal menambahkan lapangan baru.');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.error('Error submitting court:', err);
      setGeneralError('Terjadi gangguan jaringan saat mengirim data.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-8 max-w-5xl mx-auto pb-24">
      {/* Peringatan Awal: Kuota Sudah Penuh */}
      {quotaExceeded && (
        <div className="bg-[#fff1f0] border-2 border-[#ff4d4f] rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ff4d4f]/15 text-[#ba1a1a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">lock</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0b1c30]">Kuota Pembuatan Lapangan Sudah Penuh</h2>
              <p className="text-xs text-[#3d4a3d] mt-1 leading-relaxed">
                Paket Anda saat ini adalah <strong>{user?.subscription?.plan_name || 'FREE'}</strong> yang dibatasi maksimal {maxCourtsAllowed ?? 'Unlimited'} lapangan. Anda telah memiliki {currentCourtsCount} lapangan aktif.
              </p>
            </div>
          </div>
          <Link
            href="/owner/pengaturan"
            className="shrink-0 bg-[#006e2f] hover:bg-[#005321] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">upgrade</span>
            Upgrade Paket
          </Link>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl bg-[#006e2f] text-white border border-[#22c55e]/40 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          <div>
            <p className="font-bold text-sm">Berhasil Menambahkan Lapangan!</p>
            <p className="text-xs text-white/90">Mengalihkan ke daftar lapangan...</p>
          </div>
        </div>
      )}

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
        <div className="bg-[#ffdad6]/80 border border-[#ba1a1a]/40 p-4 rounded-xl text-[#ba1a1a] flex items-start gap-3 shadow-sm">
          <span className="material-symbols-outlined text-[24px] shrink-0 mt-0.5">error</span>
          <div className="flex flex-col">
            <p className="text-sm font-bold">Terjadi Kesalahan</p>
            <p className="text-xs font-medium mt-0.5">{generalError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <fieldset disabled={quotaExceeded || checkingQuota} className="flex flex-col gap-6 disabled:opacity-60">
          
          {/* Section 1: Informasi Umum */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0b1c30]">Jam Buka <span className="text-[#ba1a1a]">*</span></label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 text-sm h-12"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0b1c30]">Jam Tutup <span className="text-[#ba1a1a]">*</span></label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 text-sm h-12"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full md:w-1/2 md:pr-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#0b1c30]" htmlFor="harga">Tarif Sewa per Jam <span className="text-[#ba1a1a]">*</span></label>
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
                  className="w-full bg-[#f8f9ff] text-[#0b1c30] pl-12 pr-4 py-3 rounded-xl border border-[#bccbb9]/40 text-sm h-12 font-medium"
                  placeholder="100000"
                />
              </div>
              {fieldErrors.price_per_hour && <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.price_per_hour}</span>}
            </div>
          </section>

          {/* Section 2: Lokasi Lapangan */}
          <section className="bg-[#ffffff] rounded-2xl shadow-sm border border-[#bccbb9]/30 p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#bccbb9]/20">
              <div className="w-9 h-9 rounded-xl bg-[#005ac2]/15 flex items-center justify-center text-[#005ac2]">
                <span className="material-symbols-outlined text-[22px]">location_on</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0b1c30]">2. Lokasi Lapangan</h2>
                <p className="text-xs text-[#3d4a3d]">Pilih kota dan kecamatan.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0b1c30]" htmlFor="kota">Kota / Kabupaten <span className="text-[#ba1a1a]">*</span></label>
                <div className="relative">
                  <select
                    id="kota"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setDistrict('');
                    }}
                    className="appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 text-sm h-12 cursor-pointer"
                  >
                    <option value="" disabled>Pilih Kota / Kabupaten...</option>
                    {(cityList.length > 0 ? cityList : Object.keys(CITY_DISTRICTS)).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0b1c30]" htmlFor="kecamatan">Kecamatan</label>
                <div className="relative">
                  <select
                    id="kecamatan"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    disabled={!city || loadingDistricts}
                    className="appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 text-sm h-12 cursor-pointer disabled:bg-gray-100"
                  >
                    <option value="">{loadingDistricts ? 'Memuat...' : 'Pilih Kecamatan...'}</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#0b1c30]" htmlFor="alamat">Alamat Lengkap Venue <span className="text-[#ba1a1a]">*</span></label>
              <textarea
                id="alamat"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 text-sm resize-y"
                placeholder="Masukkan nama jalan, gedung/GOR..."
              />
            </div>
          </section>

          {/* Section 3: Fasilitas & Media */}
          <section className="bg-[#ffffff] rounded-2xl shadow-sm border border-[#bccbb9]/30 p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#bccbb9]/20">
              <div className="w-9 h-9 rounded-xl bg-[#82abff]/25 flex items-center justify-center text-[#005ac2]">
                <span className="material-symbols-outlined text-[22px]">add_photo_alternate</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0b1c30]">3. Fasilitas & Media Visual</h2>
                <p className="text-xs text-[#3d4a3d]">Pilih fasilitas tambahan dan atur foto.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.id);
                return (
                  <button
                    type="button"
                    key={amenity.id}
                    onClick={() => handleToggleAmenity(amenity.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                      isSelected ? 'bg-[#22c55e]/10 border-[#006e2f]/50 text-[#006e2f]' : 'bg-white border-[#bccbb9]/40 text-[#3d4a3d]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{amenity.icon}</span>
                    <span className="text-[11px] font-bold">{amenity.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 4: Aturan & Regulasi */}
          <section className="bg-[#ffffff] rounded-2xl shadow-sm border border-[#bccbb9]/30 p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#bccbb9]/20">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <span className="material-symbols-outlined text-[22px]">gavel</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0b1c30]">4. Aturan & Regulasi Venue</h2>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#0b1c30]">Aturan Venue <span className="text-[#ba1a1a]">*</span></label>
              <textarea
                rows={3}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#0b1c30]">Kebijakan Refund & Reschedule <span className="text-[#ba1a1a]">*</span></label>
              <textarea
                rows={2}
                value={refundPolicy}
                onChange={(e) => setRefundPolicy(e.target.value)}
                className="w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 text-sm"
              />
            </div>
          </section>

        </fieldset>

        {/* Sticky Bottom Bar */}
        <div className="sticky bottom-6 z-30 flex items-center justify-between gap-4 bg-[#ffffff]/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#bccbb9]/30">
          <Link href="/owner/lapangan" className="px-6 py-3 rounded-xl font-semibold text-xs text-[#3d4a3d] hover:bg-[#eff4ff] transition-colors flex items-center justify-center cursor-pointer">
            Batal
          </Link>

          {quotaExceeded ? (
            <Link
              href="/owner/pengaturan"
              className="px-8 py-3 rounded-xl font-bold text-xs bg-[#ba1a1a] text-white hover:bg-[#931515] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>Kuota Penuh (Upgrade untuk Menambah)</span>
            </Link>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || checkingQuota}
              className="px-8 py-3 rounded-xl font-bold text-xs bg-[#006e2f] text-[#ffffff] hover:bg-[#006e2f]/90 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
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
          )}
        </div>
      </form>
    </div>
  );
}