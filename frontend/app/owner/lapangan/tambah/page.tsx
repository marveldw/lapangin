'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah } from '@/lib/formatters';

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
  
  // Rule States
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
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // 1. Fetch cities on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCities() {
      setLoadingCities(true);
      try {
        const res = await api.get('/public/cities');
        if (isMounted && res.success && Array.isArray(res.data)) {
          setCityList(res.data.filter(Boolean));
        }
      } catch (err) {
        console.error('Failed to load cities:', err);
      } finally {
        if (isMounted) setLoadingCities(false);
      }
    }
    loadCities();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch districts when city changes
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
    setGeneralError(null);
    setFieldErrors({});
    setPlanLimitError(null);

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Nama lapangan wajib diisi';
    if (!finalSportType.trim()) errors.sport_type = 'Pilih atau masukkan jenis olahraga';
    
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

    const normalizedCloseTime = closeTime === '00:00' ? '23:59' : closeTime;

    const baseDescription = description.trim() ? `${description.trim()}\n\n` : '';
    const rulesSection = rules.trim() ? `Aturan Venue:\n${rules.trim()}\n\n` : '';
    const refundSection = refundPolicy.trim() ? `Kebijakan Refund & Reschedule:\n${refundPolicy.trim()}` : '';

    const compiledDescription = `Jam Operasional: ${openTime} - ${normalizedCloseTime}\n${
      selectedAmenities.length > 0
        ? `Fasilitas Tersedia: ${selectedAmenities.map(a => AMENITIES.find(x => x.id === a)?.label).join(', ')}.\n\n`
        : '\n'
    }${baseDescription}${rulesSection}${refundSection}`;

    // Validasi URL: Hanya kirim string URL asli ke database Laravel (mencegah error Base64)
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
        } else if (res?.errors) {
          const backendErrors: Record<string, string> = {};
          const errorDetails: string[] = [];

          Object.keys(res.errors).forEach((k) => {
            const msg = Array.isArray(res.errors[k]) ? res.errors[k][0] : res.errors[k];
            backendErrors[k] = msg;
            errorDetails.push(`${k}: ${msg}`);
          });

          setFieldErrors(backendErrors);
          // Menampilkan error spesifik dari Laravel langsung di banner merah atas
          setGeneralError(`Validasi gagal: ${errorDetails.join(' | ')}`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setGeneralError(res?.message || 'Gagal menambahkan lapangan baru.');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.error('Error submitting court:', err);
      setGeneralError('Terjadi gangguan jaringan saat mengirim data. Silakan coba lagi.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-8 max-w-5xl mx-auto pb-24">
      {showSuccessToast && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl bg-[#006e2f] text-white border border-[#22c55e]/40 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          <div>
            <p className="font-bold text-sm">Berhasil Menambahkan Lapangan!</p>
            <p className="text-xs text-white/90">Mengalihkan ke daftar lapangan...</p>
          </div>
        </div>
      )}

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
              <label className="text-sm font-bold text-[#0b1c30]">
                Jam Buka <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className={`w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border ${fieldErrors.open_time ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'} focus:outline-none focus:ring-2 focus:ring-[#006e2f] text-sm h-12`}
                />
              </div>
              {fieldErrors.open_time && <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.open_time}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#0b1c30]">
                Jam Tutup <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className={`w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border ${fieldErrors.close_time ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'} focus:outline-none focus:ring-2 focus:ring-[#006e2f] text-sm h-12`}
                />
              </div>
              {fieldErrors.close_time && <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.close_time}</span>}
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
                    setDistrict('');
                  }}
                  className={`appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border ${fieldErrors.city ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'} focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12 cursor-pointer`}
                >
                  <option value="" disabled>Pilih Kota / Kabupaten...</option>
                  {(cityList.length > 0 ? cityList : Object.keys(CITY_DISTRICTS)).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
              </div>
              {fieldErrors.city && <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.city}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#0b1c30]" htmlFor="kecamatan">
                Kecamatan
              </label>
              <div className="relative">
                <select
                  id="kecamatan"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!city || loadingDistricts}
                  className="appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] disabled:bg-gray-100 disabled:text-gray-400 px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12 cursor-pointer"
                >
                  <option value="">
                    {!city
                      ? 'Pilih Kota terlebih dahulu...'
                      : loadingDistricts
                        ? 'Memuat daftar kecamatan...'
                        : availableDistricts.length === 0
                          ? 'Tidak ada kecamatan ditemukan'
                          : 'Pilih Kecamatan...'}
                  </option>
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
              placeholder="Tuliskan keunggulan lain: jenis lantai (vinyl/karpet), penerangan (lux)..."
            />
          </div>

          <div className="flex flex-col gap-3 mt-2 border-t border-[#bccbb9]/20 pt-4">
            <label
              htmlFor="multi-photo-upload"
              className="border-2 border-dashed border-[#bccbb9] hover:border-[#006e2f] bg-[#f8f9ff] hover:bg-[#f0f9f3] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#006e2f]/10 text-[#006e2f] flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
              </div>
              <p className="text-sm font-bold text-[#0b1c30]">Klik untuk Unggah Foto dari Perangkat</p>
              <p className="text-xs text-[#3d4a3d]">Pilih format PNG, JPG, atau JPEG (Bisa pilih beberapa foto sekaligus)</p>
              <input
                id="multi-photo-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            {fieldErrors.image_url && (
              <span className="text-xs font-semibold text-[#ba1a1a]">{fieldErrors.image_url}</span>
            )}

            {selectedPhotos.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-xs font-bold text-[#0b1c30]">
                  Foto Terpilih ({selectedPhotos.length} Foto)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {selectedPhotos.map((photo, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#bccbb9]/40 h-28 bg-[#f8f9ff]">
                      <img src={photo} alt={`Foto Lapangan ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 bg-[#006e2f] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Foto Utama
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
                        title="Hapus foto"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-[#bccbb9]/20 pt-4 mt-1">
            <p className="text-xs font-semibold text-[#3d4a3d]">Atau gunakan foto preset siap pakai:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {PRESET_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => {
                    setSelectedPhotos((prev) => [preset.url, ...prev]);
                    if (!sportType) setSportType(preset.sport);
                  }}
                  className="group relative h-20 rounded-xl overflow-hidden border border-transparent hover:border-[#006e2f] transition-all cursor-pointer text-left"
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-1.5 flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-white leading-tight">{preset.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#ffffff] rounded-2xl shadow-sm border border-[#bccbb9]/30 p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#bccbb9]/20">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[22px]">gavel</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0b1c30]">4. Aturan & Regulasi Venue</h2>
              <p className="text-xs text-[#3d4a3d]">Tetapkan aturan bagi pelanggan dan kebijakan refund saat terjadi pembatalan.</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#0b1c30]">
              Aturan Venue <span className="text-[#ba1a1a]">*</span>
            </label>
            <p className="text-[11px] text-[#3d4a3d] mb-1">Beritahu pelanggan apa saja yang diperbolehkan dan dilarang di area lapangan.</p>
            <textarea
              rows={4}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm resize-y"
              placeholder="- Wajib menggunakan sepatu olahraga khusus indoor.&#10;- Dilarang merokok di area GOR."
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-sm font-bold text-[#0b1c30]">
              Kebijakan Refund & Reschedule <span className="text-[#ba1a1a]">*</span>
            </label>
            <p className="text-[11px] text-[#3d4a3d] mb-1">Beri kejelasan kepada pelanggan apakah booking bisa dibatalkan atau diganti jadwalnya.</p>
            <textarea
              rows={3}
              value={refundPolicy}
              onChange={(e) => setRefundPolicy(e.target.value)}
              className="w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm resize-y"
              placeholder="Booking yang sudah dibayar tidak dapat dibatalkan (Non-refundable). Jika ada kendala cuaca pada lapangan outdoor, jadwal bisa di-reschedule..."
              required
            />
          </div>
        </section>

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