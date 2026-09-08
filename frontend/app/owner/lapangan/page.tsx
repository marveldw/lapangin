'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah } from '@/lib/formatters';

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
  status: 'ACTIVE' | 'INACTIVE' | string;
  created_at?: string;
  updated_at?: string;
}

// Fallback image helper berdasarkan jenis olahraga
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

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sportFilter, setSportFilter] = useState<string>('ALL');

  // Action states
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Delete / Deactivate modal state
  const [courtToDelete, setCourtToDelete] = useState<CourtItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal state
  const [editingCourt, setEditingCourt] = useState<CourtItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    sport_type: '',
    price_per_hour: 0,
    address: '',
    city: '',
    district: '',
    description: '',
    image_url: '',
    status: 'ACTIVE',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch courts from backend
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

  // Toggle status court (ACTIVE <-> INACTIVE)
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

  // Confirm delete / deactivation
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

  // Open Edit Modal
  const handleOpenEdit = (court: CourtItem) => {
    setEditingCourt(court);
    setEditFormData({
      name: court.name || '',
      sport_type: court.sport_type || '',
      price_per_hour: court.price_per_hour || 0,
      address: court.address || '',
      city: court.city || '',
      district: court.district || '',
      description: court.description || '',
      image_url: court.image_url || '',
      status: court.status || 'ACTIVE',
    });
    setEditErrors({});
  };

  // Save Edit Court
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourt || !token) return;

    const errors: Record<string, string> = {};
    if (!editFormData.name.trim()) errors.name = 'Nama lapangan wajib diisi';
    if (!editFormData.sport_type.trim()) errors.sport_type = 'Jenis olahraga wajib diisi';
    if (!editFormData.price_per_hour || editFormData.price_per_hour <= 0) {
      errors.price_per_hour = 'Harga per jam harus lebih dari 0';
    }
    if (!editFormData.address.trim()) errors.address = 'Alamat wajib diisi';
    if (!editFormData.city.trim()) errors.city = 'Kota wajib diisi';

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await api.put(`/courts/${editingCourt.court_id}`, editFormData, token);

      if (res?.success && res.data) {
        const updated = res.data;
        setCourts((prev) =>
          prev.map((c) => (c.court_id === editingCourt.court_id ? { ...c, ...updated } : c))
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

  // Extract unique sports for filter dropdown
  const uniqueSports = useMemo(() => {
    const sports = new Set<string>();
    courts.forEach((c) => {
      if (c.sport_type) sports.add(c.sport_type);
    });
    return Array.from(sports);
  }, [courts]);

  // Filtered courts
  const filteredCourts = useMemo(() => {
    return courts.filter((court) => {
      const query = searchTerm.toLowerCase().trim();
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
  }, [courts, searchTerm, statusFilter, sportFilter]);

  const totalCourts = courts.length;
  const activeCourts = courts.filter((c) => c.status === 'ACTIVE').length;
  const inactiveCourts = courts.filter((c) => c.status !== 'ACTIVE').length;

  return (
    <div className="flex flex-col w-full gap-8 pb-16">
      {/* Toast Notification */}
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

      {/* Header Halaman */}
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

      {/* Quick Stats Bar */}
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

      {/* Filter & Search Toolbar */}
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

      {/* Content Area */}
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
                className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden border ${
                  isActive ? 'border-[#bccbb9]/30' : 'border-amber-200/60 bg-[#fafafa]'
                } group`}
              >
                <div className="relative h-48 w-full overflow-hidden bg-[#e5eeff]">
                  <img
                    src={imageUrl}
                    alt={court.name}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                      !isActive ? 'grayscale-[50%] opacity-80' : ''
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getCourtFallbackImage(court.sport_type);
                    }}
                  />

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
                  <div className="flex justify-between items-start gap-2 mb-2">
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
                      <span className="text-lg font-bold text-[#006e2f] block leading-tight">
                        {formatRupiah(court.price_per_hour)}
                      </span>
                      <span className="text-[11px] font-medium text-[#3d4a3d]">/ jam</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#3d4a3d]/80 line-clamp-2 my-2 min-h-[32px]">
                    {court.description || court.address || 'Tidak ada deskripsi tambahan.'}
                  </p>

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
                        className="w-9 h-9 rounded-xl bg-[#e5eeff] text-[#3d4a3d] flex items-center justify-center hover:bg-[#006e2f] hover:text-white transition-all shadow-sm cursor-pointer"
                        title="Edit Data Lapangan"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      <button
                        onClick={() => setCourtToDelete(court)}
                        className="w-9 h-9 rounded-xl bg-[#e5eeff] text-[#3d4a3d] flex items-center justify-center hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-all shadow-sm cursor-pointer"
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

      {/* MODAL EDIT LAPANGAN */}
      {editingCourt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#bccbb9]/30 flex flex-col">
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

            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#0b1c30]">
                    Nama Lapangan <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full bg-[#f8f9ff] text-sm text-[#0b1c30] px-3.5 py-2.5 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f]"
                    placeholder="Contoh: Lapangan Badminton A"
                  />
                  {editErrors.name && (
                    <span className="text-[11px] text-[#ba1a1a] font-medium">{editErrors.name}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#0b1c30]">
                    Jenis Olahraga <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <select
                    value={editFormData.sport_type}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, sport_type: e.target.value })
                    }
                    className="w-full bg-[#f8f9ff] text-sm text-[#0b1c30] px-3.5 py-2.5 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] cursor-pointer"
                  >
                    <option value="">Pilih Olahraga</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Futsal">Futsal</option>
                    <option value="Basket">Basket</option>
                    <option value="Tenis">Tenis</option>
                    <option value="Mini Soccer">Mini Soccer</option>
                    <option value="Voli">Voli</option>
                    <option value="Tenis Meja">Tenis Meja</option>
                    <option value="Padel">Padel</option>
                  </select>
                  {editErrors.sport_type && (
                    <span className="text-[11px] text-[#ba1a1a] font-medium">{editErrors.sport_type}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0b1c30]">
                  Harga Sewa per Jam (Rp) <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#3d4a3d]">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.price_per_hour || ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        price_per_hour: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#f8f9ff] text-sm text-[#0b1c30] pl-10 pr-3.5 py-2.5 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f]"
                    placeholder="100000"
                  />
                </div>
                {editErrors.price_per_hour && (
                  <span className="text-[11px] text-[#ba1a1a] font-medium">{editErrors.price_per_hour}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#0b1c30]">
                    Kota / Kabupaten <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, city: e.target.value })
                    }
                    className="w-full bg-[#f8f9ff] text-sm text-[#0b1c30] px-3.5 py-2.5 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f]"
                    placeholder="Contoh: Jakarta Selatan"
                  />
                  {editErrors.city && (
                    <span className="text-[11px] text-[#ba1a1a] font-medium">{editErrors.city}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#0b1c30]">Kecamatan (Opsional)</label>
                  <input
                    type="text"
                    value={editFormData.district}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, district: e.target.value })
                    }
                    className="w-full bg-[#f8f9ff] text-sm text-[#0b1c30] px-3.5 py-2.5 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f]"
                    placeholder="Contoh: Cilandak"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0b1c30]">
                  Alamat Lengkap <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, address: e.target.value })
                  }
                  className="w-full bg-[#f8f9ff] text-sm text-[#0b1c30] px-3.5 py-2.5 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f]"
                  placeholder="Jl. RS Fatmawati No. 12, Lantai 2"
                />
                {editErrors.address && (
                  <span className="text-[11px] text-[#ba1a1a] font-medium">{editErrors.address}</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0b1c30]">URL Foto Lapangan</label>
                <input
                  type="url"
                  value={editFormData.image_url}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, image_url: e.target.value })
                  }
                  className="w-full bg-[#f8f9ff] text-sm text-[#0b1c30] px-3.5 py-2.5 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f]"
                  placeholder="https://..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0b1c30]">Deskripsi Fasilitas</label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  className="w-full bg-[#f8f9ff] text-sm text-[#0b1c30] px-3.5 py-2.5 rounded-xl border border-[#bccbb9]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2f] resize-y"
                  placeholder="Jenis lantai, penerangan, AC, shower, loker..."
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#f8f9ff] rounded-xl border border-[#bccbb9]/30">
                <div>
                  <p className="text-xs font-bold text-[#0b1c30]">Status Lapangan</p>
                  <p className="text-[11px] text-[#3d4a3d]">
                    {editFormData.status === 'ACTIVE'
                      ? 'Aktif dan dapat dibooking pelanggan'
                      : 'Non-aktif (disembunyikan dari katalog pelanggan)'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditFormData({
                      ...editFormData,
                      status: editFormData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    editFormData.status === 'ACTIVE'
                      ? 'bg-[#006e2f] text-white'
                      : 'bg-[#ffdad6] text-[#ba1a1a]'
                  }`}
                >
                  {editFormData.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#bccbb9]/20">
                <button
                  type="button"
                  onClick={() => setEditingCourt(null)}
                  disabled={isSavingEdit}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#3d4a3d] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#006e2f] text-white hover:bg-[#006e2f]/90 transition-all shadow-md flex items-center gap-2 cursor-pointer"
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

      {/* MODAL KONFIRMASI DEAKTIVASI */}
      {courtToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#bccbb9]/30 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0b1c30]">Nonaktifkan Lapangan?</h3>
              <p className="text-xs text-[#3d4a3d] mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menonaktifkan{' '}
                <strong className="text-[#0b1c30] font-semibold">{courtToDelete.name}</strong>?
                Lapangan ini tidak akan muncul di pencarian booking pelanggan, namun riwayat transaksi tetap tersimpan.
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-3 pt-4 border-t border-[#bccbb9]/20">
              <button
                type="button"
                onClick={() => setCourtToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#3d4a3d] hover:bg-[#eff4ff] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#ba1a1a] text-white hover:bg-red-700 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? 'Memproses...' : 'Ya, Nonaktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
