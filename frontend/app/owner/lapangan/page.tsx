'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah } from '@/lib/formatters';
import { useDebounce } from '@/lib/useDebounce';

export interface CourtItem {
  court_id: number;
  owner_id: number;
  name: string;
  sport_type: string;
  description?: string | null;
  price_per_hour: number;
  address: string;
  city: string;
  district?: string | null;
  image_url?: string | null;
  open_time?: string | null;
  close_time?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | string;
  booking_count?: number;
  created_at?: string;
  updated_at?: string;
}

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

export default function DaftarLapangan() {
  const { token, isLoading: authLoading } = useAuth();

  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sportFilter, setSportFilter] = useState<string>('ALL');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [courtToDelete, setCourtToDelete] = useState<CourtItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingCourt, setEditingCourt] = useState<CourtItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    sport_type: '',
    price_per_hour: 0,
    address: '',
    city: '',
    district: '',
    description: '',
    status: 'ACTIVE',
  });
  
  const [editCustomSport, setEditCustomSport] = useState('');
  const [editOpenTime, setEditOpenTime] = useState('08:00');
  const [editCloseTime, setEditCloseTime] = useState('23:00');
  const [editSelectedAmenities, setEditSelectedAmenities] = useState<string[]>([]);
  const [editSelectedPhotos, setEditSelectedPhotos] = useState<string[]>([]);
  const [editRules, setEditRules] = useState('');
  const [editRefundPolicy, setEditRefundPolicy] = useState('');

  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const [cityList, setCityList] = useState<string[]>([]);
  const [editDistricts, setEditDistricts] = useState<string[]>([]);
  const [loadingEditDistricts, setLoadingEditDistricts] = useState(false);

  // 1. Fetch cities on mount
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

  // 2. Fetch districts when editFormData.city changes
  useEffect(() => {
    if (!editFormData.city) {
      setEditDistricts([]);
      return;
    }
    let isMounted = true;
    async function loadDistricts() {
      setLoadingEditDistricts(true);
      try {
        const res = await api.get(`/public/cities/${encodeURIComponent(editFormData.city)}/districts`);
        if (isMounted && res.success && Array.isArray(res.data)) {
          setEditDistricts(res.data.filter(Boolean));
        } else if (isMounted) {
          setEditDistricts(CITY_DISTRICTS[editFormData.city] || []);
        }
      } catch (err) {
        console.error('Failed to load edit districts:', err);
        if (isMounted) setEditDistricts(CITY_DISTRICTS[editFormData.city] || []);
      } finally {
        if (isMounted) setLoadingEditDistricts(false);
      }
    }
    loadDistricts();
    return () => { isMounted = false; };
  }, [editFormData.city]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchCourts = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/courts', token);
      if (res?.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setCourts(list);
      } else {
        setError(res?.message || 'Gagal memuat daftar lapangan.');
      }
    } catch (err) {
      console.error('Error fetching courts:', err);
      setError('Terjadi kendala saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && token) {
      fetchCourts();
    }
  }, [token, authLoading]);

  const handleToggleStatus = async (court: CourtItem) => {
    if (!token || updatingId) return;
    const newStatus = court.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setUpdatingId(court.court_id);

    try {
      const res = await api.put(
        `/courts/${court.court_id}`,
        { status: newStatus },
        token
      );

      if (res?.success) {
        setCourts((prev) =>
          prev.map((c) => (c.court_id === court.court_id ? { ...c, status: newStatus } : c))
        );
        setToastMessage({
          type: 'success',
          text: `Status ${court.name} berhasil diubah menjadi ${newStatus === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}.`,
        });
      } else {
        setToastMessage({
          type: 'error',
          text: res?.message || 'Gagal mengubah status lapangan.',
        });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setToastMessage({
        type: 'error',
        text: 'Terjadi kesalahan jaringan.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!courtToDelete || !token) return;
    setIsDeleting(true);

    try {
      const res = await api.delete(`/courts/${courtToDelete.court_id}`, token);
      if (res?.success) {
        setCourts((prev) =>
          prev.map((c) =>
            c.court_id === courtToDelete.court_id ? { ...c, status: 'INACTIVE' } : c
          )
        );
        setToastMessage({
          type: 'success',
          text: `${courtToDelete.name} berhasil dinonaktifkan.`,
        });
        setCourtToDelete(null);
      } else {
        setToastMessage({
          type: 'error',
          text: res?.message || 'Gagal menonaktifkan lapangan.',
        });
      }
    } catch (err) {
      console.error('Error deleting court:', err);
      setToastMessage({
        type: 'error',
        text: 'Terjadi kendala saat menghubungi server.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEdit = (court: CourtItem) => {
    setEditingCourt(court);
    
    let rawDesc = court.description || '';
    // Ambil langsung jika field open_time / close_time tersedia di court
    let oTime = court.open_time ? court.open_time.slice(0, 5) : '08:00';
    let cTime = court.close_time ? court.close_time.slice(0, 5) : '23:00';
    let foundAmenities: string[] = [];
    
    let eRules = '- Wajib menggunakan sepatu olahraga khusus indoor.\n- Dilarang membawa makanan berat ke dalam area lapangan.\n- Dilarang merokok di area GOR.';
    let eRefund = 'Booking yang sudah dibayar tidak dapat dibatalkan (Non-refundable). Jika ada kendala cuaca pada lapangan outdoor, jadwal bisa di-reschedule.';

    // Extract Refund Policy
    const refundSplit = rawDesc.split(/Kebijakan Refund & Reschedule:\n/i);
    if (refundSplit.length > 1) {
      eRefund = refundSplit[1].trim();
      rawDesc = refundSplit[0];
    }

    // Extract Rules
    const rulesSplit = rawDesc.split(/Aturan Venue:\n/i);
    if (rulesSplit.length > 1) {
      eRules = rulesSplit[1].trim();
      rawDesc = rulesSplit[0];
    }

    // Extract Operating Hours jika belum ada di field kolom langsung
    const timeMatch = rawDesc.match(/Jam Operasional:\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/i);
    if (timeMatch) {
      if (!court.open_time) oTime = timeMatch[1];
      if (!court.close_time) cTime = timeMatch[2];
      rawDesc = rawDesc.replace(timeMatch[0], '');
    }

    const fasMatch = rawDesc.match(/Fasilitas Tersedia:\s*(.*?)\./);
    if (fasMatch) {
      const fasString = fasMatch[1];
      AMENITIES.forEach(a => {
        if (fasString.includes(a.label)) {
          foundAmenities.push(a.id);
        }
      });
      rawDesc = rawDesc.replace(/Fasilitas Tersedia:.*?\.\n*/, '');
    }

    rawDesc = rawDesc.trim();

    const isCustomSport = court.sport_type && !SPORT_OPTIONS.some(s => s.value === court.sport_type);

    setEditFormData({
      name: court.name || '',
      sport_type: isCustomSport ? 'OTHER' : (court.sport_type || ''),
      price_per_hour: court.price_per_hour || 0,
      address: court.address || '',
      city: court.city || '',
      district: court.district || '',
      description: rawDesc,
      status: court.status || 'ACTIVE',
    });

    setEditCustomSport(isCustomSport ? court.sport_type : '');
    setEditOpenTime(oTime);
    setEditCloseTime(cTime);
    setEditSelectedAmenities(foundAmenities);
    setEditSelectedPhotos(court.image_url ? [court.image_url] : []);
    setEditRules(eRules);
    setEditRefundPolicy(eRefund);
    setEditErrors({});
  };

  const handleToggleEditAmenity = (id: string) => {
    setEditSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditSelectedPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveEditPhoto = (indexToRemove: number) => {
    setEditSelectedPhotos((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourt || !token) return;

    const finalEditSportType = editFormData.sport_type === 'OTHER' ? editCustomSport : editFormData.sport_type;

    const errors: Record<string, string> = {};
    if (!editFormData.name.trim()) errors.name = 'Nama lapangan wajib diisi';
    if (!finalEditSportType.trim()) errors.sport_type = 'Jenis olahraga wajib diisi';
    if (!editFormData.price_per_hour || editFormData.price_per_hour < 10000) {
      errors.price_per_hour = 'Tarif sewa minimal Rp 10.000 / jam';
    }
    if (!editFormData.address.trim()) errors.address = 'Alamat wajib diisi';
    if (!editFormData.city.trim()) errors.city = 'Kota wajib diisi';

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setIsSavingEdit(true);

    // Normalisasi jam malam: jika tutup jam 00:00, jadikan 23:59 agar validasi waktu backend aman
    const normalizedCloseTime = editCloseTime === '00:00' ? '23:59' : editCloseTime;

    const baseDescription = editFormData.description.trim() ? `${editFormData.description.trim()}\n\n` : '';
    const rulesSection = editRules.trim() ? `Aturan Venue:\n${editRules.trim()}\n\n` : '';
    const refundSection = editRefundPolicy.trim() ? `Kebijakan Refund & Reschedule:\n${editRefundPolicy.trim()}` : '';

    const compiledDescription = `Jam Operasional: ${editOpenTime} - ${normalizedCloseTime}\n${
      editSelectedAmenities.length > 0
        ? `Fasilitas Tersedia: ${editSelectedAmenities.map(a => AMENITIES.find(x => x.id === a)?.label).join(', ')}.\n\n`
        : '\n'
    }${baseDescription}${rulesSection}${refundSection}`;

    try {
      const payload = {
        name: editFormData.name.trim(),
        sport_type: finalEditSportType.trim(),
        price_per_hour: Number(editFormData.price_per_hour),
        open_time: editOpenTime,              // <-- Sinkronkan jam buka ke backend
        close_time: normalizedCloseTime,      // <-- Sinkronkan jam tutup ke backend
        address: editFormData.address.trim(),
        city: editFormData.city.trim(),
        district: editFormData.district.trim() ? editFormData.district.trim() : null,
        description: compiledDescription ? compiledDescription : null,
        image_url: editSelectedPhotos.length > 0 && editSelectedPhotos[0].startsWith('http')
          ? editSelectedPhotos[0]
          : getCourtFallbackImage(finalEditSportType),
        status: editFormData.status,
      };

      const res = await api.put(`/courts/${editingCourt.court_id}`, payload, token);

      if (res?.success && res.data) {
        const updated = res.data;
        setCourts((prev) =>
          prev.map((c) => (c.court_id === editingCourt.court_id ? { 
            ...c, 
            ...updated,
            open_time: editOpenTime,
            close_time: normalizedCloseTime 
          } : c))
        );
        setToastMessage({
          type: 'success',
          text: `Perubahan data lapangan "${editFormData.name}" berhasil disimpan!`,
        });
        setEditingCourt(null);
      } else {
        setToastMessage({
          type: 'error',
          text: res?.message || 'Gagal menyimpan perubahan lapangan.',
        });
      }
    } catch (err) {
      console.error('Error saving court:', err);
      setToastMessage({
        type: 'error',
        text: 'Terjadi kendala saat menyimpan perubahan.',
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const uniqueSports = useMemo(() => {
    const sports = new Set<string>();
    courts.forEach((c) => {
      if (c.sport_type) sports.add(c.sport_type);
    });
    return Array.from(sports);
  }, [courts]);

  const filteredCourts = useMemo(() => {
    return courts.filter((court) => {
      const query = debouncedSearch.toLowerCase().trim();
      const matchSearch =
        !query ||
        court.name.toLowerCase().includes(query) ||
        court.sport_type.toLowerCase().includes(query) ||
        court.address.toLowerCase().includes(query) ||
        court.city.toLowerCase().includes(query) ||
        (court.district && court.district.toLowerCase().includes(query));

      const matchStatus =
        statusFilter === 'ALL' || court.status.toUpperCase() === statusFilter;

      const matchSport =
        sportFilter === 'ALL' ||
        court.sport_type.toLowerCase() === sportFilter.toLowerCase();

      return matchSearch && matchStatus && matchSport;
    });
  }, [courts, debouncedSearch, statusFilter, sportFilter]);

  const totalCourts = courts.length;
  const activeCourts = courts.filter((c) => c.status === 'ACTIVE').length;
  const inactiveCourts = courts.filter((c) => c.status !== 'ACTIVE').length;

  return (
    <div className="flex flex-col w-full gap-8 pb-16">
      {toastMessage && (
        <div
          className={`fixed top-24 right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border transition-all transform duration-300 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === 'success'
              ? 'bg-[#006e2f] text-white border-[#22c55e]/40'
              : 'bg-[#ba1a1a] text-white border-red-400/40'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {toastMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-sm font-medium">{toastMessage.text}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/80 hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#0b1c30] tracking-tight">MANAJEMEN LAPANGAN</h1>
            <span className="bg-[#e5eeff] text-[#006e2f] text-xs font-bold px-3 py-1 rounded-full">
              {totalCourts} Total
            </span>
          </div>
          <p className="text-base text-[#3d4a3d] max-w-2xl">
            Kelola data lapangan olahraga, atur harga sewa per jam, ubah status aktif, dan pantau ketersediaan fasilitas Anda.
          </p>
        </div>

        <Link
          href="/owner/lapangan/tambah"
          className="bg-[#006e2f] text-[#ffffff] text-sm font-semibold py-3 px-6 rounded-xl shadow-md hover:bg-[#006e2f]/90 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 self-start lg:self-end shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tambah Lapangan Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#bccbb9]/30 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e5eeff] text-[#006e2f] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">stadium</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#3d4a3d]">Total Lapangan</p>
              <p className="text-2xl font-bold text-[#0b1c30]">{totalCourts}</p>
            </div>
          </div>
          <span className="text-xs text-[#3d4a3d] font-medium bg-[#f8f9ff] px-2.5 py-1 rounded-lg border border-[#bccbb9]/20">
            Terdaftar
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#bccbb9]/30 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 text-[#006e2f] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#3d4a3d]">Lapangan Aktif</p>
              <p className="text-2xl font-bold text-[#006e2f]">{activeCourts}</p>
            </div>
          </div>
          <span className="text-xs text-[#006e2f] font-semibold bg-[#22c55e]/10 px-2.5 py-1 rounded-lg">
            Siap Dipesan
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#bccbb9]/30 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffdad6]/60 text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">pause_circle</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#3d4a3d]">Non-Aktif</p>
              <p className="text-2xl font-bold text-[#ba1a1a]">{inactiveCourts}</p>
            </div>
          </div>
          <span className="text-xs text-[#ba1a1a] font-semibold bg-[#ffdad6]/40 px-2.5 py-1 rounded-lg">
            Ditutup Sementara
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#bccbb9]/30 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 text-[20px]">
            search
          </span>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f8f9ff] text-[#0b1c30] text-sm py-2.5 pl-10 pr-4 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all placeholder:text-[#3d4a3d]/50"
            placeholder="Cari nama lapangan, jenis olahraga, alamat, kota..."
            type="text"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 hover:text-[#0b1c30] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-[#f8f9ff] text-[#0b1c30] text-xs font-semibold py-2.5 pl-3.5 pr-8 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Non-Aktif</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3d4a3d] text-[18px] pointer-events-none">
              expand_more
            </span>
          </div>

          <div className="relative min-w-[150px]">
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="w-full bg-[#f8f9ff] text-[#0b1c30] text-xs font-semibold py-2.5 pl-3.5 pr-8 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] appearance-none cursor-pointer capitalize"
            >
              <option value="ALL">Semua Olahraga</option>
              {uniqueSports.map((sport) => (
                <option key={sport} value={sport} className="capitalize">
                  {sport}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3d4a3d] text-[18px] pointer-events-none">
              expand_more
            </span>
          </div>

          {(searchTerm || statusFilter !== 'ALL' || sportFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setSportFilter('ALL');
              }}
              className="p-2 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset Filter"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {loading || authLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#bccbb9]/30 animate-pulse flex flex-col h-[400px]"
            >
              <div className="h-48 bg-[#e5eeff]/70 w-full"></div>
              <div className="p-6 flex flex-col gap-4 flex-1">
                <div className="h-6 bg-[#e5eeff] rounded w-3/4"></div>
                <div className="h-4 bg-[#e5eeff]/60 rounded w-1/2"></div>
                <div className="mt-auto pt-4 border-t border-[#bccbb9]/20 flex justify-between items-center">
                  <div className="h-6 bg-[#e5eeff] rounded w-24"></div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#e5eeff]"></div>
                    <div className="w-8 h-8 rounded-full bg-[#e5eeff]"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-red-200 shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">error</span>
          </div>
          <h3 className="text-xl font-bold text-[#0b1c30]">Gagal Memuat Lapangan</h3>
          <p className="text-sm text-[#3d4a3d] max-w-md">{error}</p>
          <button
            onClick={fetchCourts}
            className="mt-2 bg-[#006e2f] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#006e2f]/90 transition-all cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredCourts.length === 0 ? (
        courts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-[#bccbb9] shadow-sm flex flex-col items-center justify-center gap-4 py-16">
            <div className="w-20 h-20 rounded-full bg-[#dce9ff] text-[#006e2f] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[40px]">stadium</span>
            </div>
            <h3 className="text-2xl font-bold text-[#0b1c30]">Belum Ada Lapangan Terdaftar</h3>
            <p className="text-sm text-[#3d4a3d] max-w-md">
              Mulai buat profil lapangan olahraga Anda sekarang untuk menerima reservasi dan mengelola ketersediaan secara online.
            </p>
            <Link
              href="/owner/lapangan/tambah"
              className="mt-4 bg-[#006e2f] text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Tambah Lapangan Pertama
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#bccbb9]/30 shadow-sm flex flex-col items-center justify-center gap-3 py-12">
            <div className="w-14 h-14 rounded-full bg-[#f8f9ff] text-[#3d4a3d]/60 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">search_off</span>
            </div>
            <h3 className="text-lg font-bold text-[#0b1c30]">Tidak Ada Lapangan Ditemukan</h3>
            <p className="text-xs text-[#3d4a3d] max-w-sm">
              Tidak ada lapangan yang sesuai dengan filter atau kata kunci pencarian Anda.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setSportFilter('ALL');
              }}
              className="mt-2 text-xs font-semibold text-[#006e2f] hover:underline cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative">
          {filteredCourts.map((court) => {
            const isActive = court.status === 'ACTIVE';
            const imageUrl = court.image_url || getCourtFallbackImage(court.sport_type);
            const locationDisplay = court.district
              ? `${court.district}, ${court.city}`
              : court.city || court.address;

            return (
              <div
                key={court.court_id}
                className={`rounded-2xl shadow-sm transition-all duration-300 flex flex-col overflow-hidden border group ${
                  isActive
                    ? 'bg-white border-[#bccbb9]/30 hover:shadow-md'
                    : 'bg-[#f1f4f9] border-[#d1d9e2] opacity-90'
                }`}
              >
                <div className="relative h-48 w-full overflow-hidden bg-[#e5eeff]">
                  <img
                    src={imageUrl}
                    alt={court.name}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isActive ? 'group-hover:scale-105' : 'grayscale opacity-60 mix-blend-multiply'
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getCourtFallbackImage(court.sport_type);
                    }}
                  />

                  {!isActive && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10 pointer-events-none">
                      <span className="bg-[#0b1c30]/80 text-[#ffffff] text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-widest backdrop-blur-md shadow-sm">
                        NON-AKTIF
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 z-20 bg-[#0b1c30]/80 backdrop-blur-md text-[#ffffff] text-[11px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
                    {court.sport_type}
                  </div>

                  <div className="absolute top-3 right-3 z-20 flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(court)}
                      disabled={updatingId === court.court_id}
                      title={`Klik untuk ubah status ke ${isActive ? 'Non-Aktif' : 'Aktif'}`}
                      className={`backdrop-blur text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#22c55e]/90 text-[#004b1e] hover:bg-[#22c55e]'
                          : 'bg-[#ffdad6]/90 text-[#ba1a1a] hover:bg-[#ffdad6]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isActive ? 'bg-[#006e2f] animate-pulse' : 'bg-[#ba1a1a]'
                        }`}
                      ></span>
                      {updatingId === court.court_id
                        ? 'Memproses...'
                        : isActive
                        ? 'Aktif'
                        : 'Non-Aktif'}
                    </button>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-[#0b1c30] group-hover:text-[#006e2f] transition-colors line-clamp-1">
                        {court.name}
                      </h3>
                      <p className="text-xs text-[#3d4a3d] flex items-center gap-1 mt-1 font-medium line-clamp-1">
                        <span className="material-symbols-outlined text-[15px] text-[#006e2f] shrink-0">
                          location_on
                        </span>
                        {locationDisplay}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-lg font-bold block leading-tight ${isActive ? 'text-[#006e2f]' : 'text-[#3d4a3d]'}`}>
                        {formatRupiah(court.price_per_hour)}
                      </span>
                      <span className="text-[11px] font-medium text-[#3d4a3d]">/ jam</span>
                    </div>
                  </div>

                  <div className="my-4 flex items-center">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
                      isActive 
                        ? 'bg-[#fff4e5] border-[#ffe5b4] text-[#e65c00]' 
                        : 'bg-[#e2e8f0] border-[#cbd5e1] text-[#64748b]'
                    }`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {isActive ? 'local_fire_department' : 'history'}
                      </span>
                      <span className="text-[11px] font-bold">
                        {court.booking_count || 0}x dipesan
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#bccbb9]/20">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(court)}
                        disabled={updatingId === court.court_id}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                          isActive
                            ? 'bg-[#eff4ff] text-[#3d4a3d] hover:bg-[#ffdad6]/60 hover:text-[#ba1a1a]'
                            : 'bg-[#22c55e]/15 text-[#006e2f] hover:bg-[#22c55e]/30'
                        }`}
                        title={isActive ? 'Nonaktifkan Lapangan' : 'Aktifkan Lapangan'}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isActive ? 'power_settings_new' : 'check'}
                        </span>
                        <span>{isActive ? 'Tutup' : 'Buka'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(court)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer ${
                          isActive ? 'bg-[#e5eeff] text-[#3d4a3d] hover:bg-[#006e2f] hover:text-white' : 'bg-white text-[#3d4a3d] hover:bg-gray-200'
                        }`}
                        title="Edit Data Lapangan"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      <button
                        onClick={() => setCourtToDelete(court)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer ${
                          isActive ? 'bg-[#e5eeff] text-[#3d4a3d] hover:bg-[#ffdad6] hover:text-[#ba1a1a]' : 'bg-white text-[#3d4a3d] hover:bg-gray-200'
                        }`}
                        title="Nonaktifkan Lapangan"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <Link
            href="/owner/lapangan/tambah"
            className="bg-white/60 hover:bg-white rounded-2xl shadow-sm border-2 border-dashed border-[#bccbb9] hover:border-[#006e2f] transition-all duration-300 flex flex-col items-center justify-center min-h-[350px] p-8 text-center cursor-pointer group hover:-translate-y-1"
          >
            <div className="w-16 h-16 rounded-full bg-[#dce9ff] text-[#006e2f] group-hover:bg-[#006e2f] group-hover:text-white flex items-center justify-center mb-4 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[32px]">add_location_alt</span>
            </div>
            <h3 className="text-lg font-bold text-[#0b1c30] mb-2 group-hover:text-[#006e2f] transition-colors">
              Tambah Lapangan Baru
            </h3>
            <p className="text-xs text-[#3d4a3d] max-w-[240px]">
              Tambahkan fasilitas atau cabang lapangan baru untuk memperluas bisnis Anda.
            </p>
          </Link>
        </div>
      )}

      {editingCourt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#bccbb9]/30 flex flex-col">
            <div className="p-6 border-b border-[#bccbb9]/20 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#e5eeff] text-[#006e2f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0b1c30]">Edit Lapangan</h2>
                  <p className="text-xs text-[#3d4a3d]">ID #{editingCourt.court_id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingCourt(null)}
                className="w-8 h-8 rounded-full text-[#3d4a3d] hover:bg-[#eff4ff] flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-6 bg-[#f8f9ff]">
              
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
                    <label className="text-sm font-bold text-[#0b1c30]">
                      Nama Lapangan <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className={`w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border ${editErrors.name ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'} focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12`}
                      placeholder="Contoh: Lapangan Badminton A"
                    />
                    {editErrors.name && <span className="text-xs font-semibold text-[#ba1a1a]">{editErrors.name}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-[#0b1c30]">
                      Jenis Olahraga <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={editFormData.sport_type}
                        onChange={(e) => setEditFormData({ ...editFormData, sport_type: e.target.value })}
                        className={`appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border ${editErrors.sport_type ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'} focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12 cursor-pointer`}
                      >
                        <option value="" disabled>Pilih Jenis Olahraga</option>
                        {SPORT_OPTIONS.map((sport) => (
                          <option key={sport.value} value={sport.value}>{sport.label}</option>
                        ))}
                        <option value="OTHER">Lainnya (Tulis Sendiri)...</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
                    </div>
                    {editFormData.sport_type === 'OTHER' && (
                      <input
                        type="text"
                        value={editCustomSport}
                        onChange={(e) => setEditCustomSport(e.target.value)}
                        placeholder="Ketik jenis olahraga (cth: Squash, Pickleball)"
                        className="mt-2 w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-2 rounded-xl border border-[#bccbb9]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]"
                      />
                    )}
                    {editErrors.sport_type && <span className="text-xs font-semibold text-[#ba1a1a]">{editErrors.sport_type}</span>}
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
                        value={editOpenTime}
                        onChange={(e) => setEditOpenTime(e.target.value)}
                        className="w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] text-sm h-12"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-[#0b1c30]">
                      Jam Tutup <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={editCloseTime}
                        onChange={(e) => setEditCloseTime(e.target.value)}
                        className="w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] text-sm h-12"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 w-full md:w-1/2 md:pr-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#0b1c30]">
                      Tarif Sewa per Jam <span className="text-[#ba1a1a]">*</span>
                    </label>
                    {editFormData.price_per_hour > 0 && (
                      <span className="text-xs font-bold text-[#006e2f] bg-[#22c55e]/15 px-2.5 py-0.5 rounded-md">
                        Preview: {formatRupiah(editFormData.price_per_hour)} / jam
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-[#3d4a3d] font-bold text-sm select-none">Rp</span>
                    <input
                      type="number"
                      min="10000"
                      step="5000"
                      value={editFormData.price_per_hour || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, price_per_hour: parseInt(e.target.value) || 0 })}
                      className={`w-full bg-[#f8f9ff] text-[#0b1c30] pl-12 pr-4 py-3 rounded-xl border ${editErrors.price_per_hour ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'} focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12 font-medium`}
                      placeholder="100000"
                    />
                  </div>
                  {editErrors.price_per_hour ? (
                    <span className="text-xs font-semibold text-[#ba1a1a]">{editErrors.price_per_hour}</span>
                  ) : (
                    <p className="text-xs font-medium text-[#3d4a3d]">Batas maksimal pengisian adalah Rp 5.000.000/jam.</p>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-xl border border-[#bccbb9]/30 mt-2">
                  <div>
                    <p className="text-sm font-bold text-[#0b1c30]">Status Lapangan</p>
                    <p className="text-xs text-[#3d4a3d]">{editFormData.status === 'ACTIVE' ? 'Aktif dan dapat dibooking pelanggan' : 'Non-aktif (disembunyikan dari katalog pelanggan)'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, status: editFormData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 ${editFormData.status === 'ACTIVE' ? 'bg-[#006e2f] text-white hover:bg-[#006e2f]/90' : 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-red-200'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{editFormData.status === 'ACTIVE' ? 'check_circle' : 'pause_circle'}</span>
                    <span>{editFormData.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}</span>
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
                    <label className="text-sm font-bold text-[#0b1c30]">
                      Kota / Kabupaten <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={editFormData.city}
                        onChange={(e) => {
                          setEditFormData({ ...editFormData, city: e.target.value, district: '' });
                        }}
                        className={`appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border ${editErrors.city ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'} focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12 cursor-pointer`}
                      >
                        <option value="" disabled>Pilih Kota / Kabupaten...</option>
                        {(cityList.length > 0 ? cityList : Object.keys(CITY_DISTRICTS)).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
                    </div>
                    {editErrors.city && <span className="text-xs font-semibold text-[#ba1a1a]">{editErrors.city}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-[#0b1c30]">
                      Kecamatan
                    </label>
                    <div className="relative">
                      <select
                        value={editFormData.district}
                        onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                        disabled={!editFormData.city || loadingEditDistricts}
                        className="appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] disabled:bg-gray-100 disabled:text-gray-400 px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm h-12 cursor-pointer"
                      >
                        <option value="">
                          {!editFormData.city
                            ? 'Pilih Kota terlebih dahulu...'
                            : loadingEditDistricts
                              ? 'Memuat daftar kecamatan...'
                              : editDistricts.length === 0
                                ? 'Tidak ada kecamatan ditemukan'
                                : 'Pilih Kecamatan...'}
                        </option>
                        {editDistricts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-[#0b1c30]">
                    Alamat Lengkap Venue <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className={`w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border ${editErrors.address ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'} focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm resize-y`}
                    placeholder="Masukkan nama jalan, nomor kavling, nama gedung/gor, patokan terdekat."
                  />
                  {editErrors.address && <span className="text-xs font-semibold text-[#ba1a1a]">{editErrors.address}</span>}
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
                      const isSelected = editSelectedAmenities.includes(amenity.id);
                      return (
                        <button
                          type="button"
                          key={amenity.id}
                          onClick={() => handleToggleEditAmenity(amenity.id)}
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
                  <label className="text-sm font-bold text-[#0b1c30]">
                    Deskripsi Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm resize-y"
                    placeholder="Tuliskan keunggulan lain: jenis lantai (vinyl/karpet), penerangan (lux), aturan penggunaan..."
                  />
                </div>

                <div className="flex flex-col gap-3 mt-2 border-t border-[#bccbb9]/20 pt-4">
                  <label
                    htmlFor="edit-multi-photo-upload"
                    className="border-2 border-dashed border-[#bccbb9] hover:border-[#006e2f] bg-[#f8f9ff] hover:bg-[#f0f9f3] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#006e2f]/10 text-[#006e2f] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
                    </div>
                    <p className="text-sm font-bold text-[#0b1c30]">Klik untuk Unggah Foto dari Perangkat</p>
                    <p className="text-xs text-[#3d4a3d]">Pilih format PNG, JPG, atau JPEG (Bisa pilih beberapa foto sekaligus)</p>
                    <input
                      id="edit-multi-photo-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleEditPhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {editSelectedPhotos.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      <p className="text-xs font-bold text-[#0b1c30]">
                        Foto Terpilih ({editSelectedPhotos.length} Foto)
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {editSelectedPhotos.map((photo, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#bccbb9]/40 h-28 bg-[#f8f9ff]">
                            <img src={photo} alt={`Foto Lapangan ${idx + 1}`} className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <span className="absolute bottom-1.5 left-1.5 bg-[#006e2f] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Foto Utama
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveEditPhoto(idx)}
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
                          setEditSelectedPhotos((prev) => [...prev, preset.url]);
                          if (!editFormData.sport_type) setEditFormData({ ...editFormData, sport_type: preset.sport });
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

              {/* Section 4: Aturan & Regulasi Venue */}
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
                    value={editRules}
                    onChange={(e) => setEditRules(e.target.value)}
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
                    value={editRefundPolicy}
                    onChange={(e) => setEditRefundPolicy(e.target.value)}
                    className="w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-all text-sm resize-y"
                    placeholder="Booking yang sudah dibayar tidak dapat dibatalkan (Non-refundable). Jika ada hujan, jadwal bisa di-reschedule..."
                    required
                  />
                </div>
              </section>

              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-[#bccbb9]/20 sticky bottom-0 bg-[#f8f9ff] pb-2 z-10">
                <button
                  type="button"
                  onClick={() => setEditingCourt(null)}
                  disabled={isSavingEdit}
                  className="px-6 py-3 rounded-xl text-xs font-semibold text-[#3d4a3d] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-8 py-3 rounded-xl text-xs font-bold bg-[#006e2f] text-white hover:bg-[#006e2f]/90 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isSavingEdit ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        progress_activity
                      </span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}