'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { formatRupiah, getCourtFallbackImage } from '@/lib/formatters';

interface Court {
  court_id: number;
  name: string;
  sport_type: string;
  description: string | null;
  price_per_hour: number;
  address: string;
  city: string | null;
  district: string | null;
  image_url: string | null;
}

function CariLapanganContent() {
  const searchParams = useSearchParams();

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [sportType, setSportType] = useState(searchParams.get('sport_type') || '');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popularitas' | 'harga_terendah' | 'harga_tertinggi'>('popularitas');

  // Options from backend
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableSports, setAvailableSports] = useState<string[]>([]);

  // Data & loading state
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch cities & sports on mount
  useEffect(() => {
    async function fetchMetadata() {
      try {
        const [citiesRes, sportsRes] = await Promise.all([
          api.get('/public/cities'),
          api.get('/public/sport-types'),
        ]);

        if (citiesRes.success && Array.isArray(citiesRes.data)) {
          setAvailableCities(citiesRes.data.filter(Boolean));
        }
        if (sportsRes.success && Array.isArray(sportsRes.data)) {
          setAvailableSports(sportsRes.data.filter(Boolean));
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    }
    fetchMetadata();
  }, []);

  // 2. Fetch districts when city changes
  useEffect(() => {
    if (!city) {
      setAvailableDistricts([]);
      setDistrict('');
      return;
    }
    async function fetchDistricts() {
      try {
        const res = await api.get(`/public/cities/${encodeURIComponent(city)}/districts`);
        if (res.success && Array.isArray(res.data)) {
          setAvailableDistricts(res.data.filter(Boolean));
        }
      } catch (err) {
        console.error('Failed to load districts:', err);
      }
    }
    fetchDistricts();
  }, [city]);

  // 3. Fetch courts from API
  const fetchCourts = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.append('search', search.trim());
      if (city) queryParams.append('city', city);
      if (district) queryParams.append('district', district);
      if (sportType) queryParams.append('sport_type', sportType);

      const res = await api.get(`/public/courts?${queryParams.toString()}`);
      if (res.success && res.data) {
        // Laravel paginate format: res.data.data
        const items = Array.isArray(res.data.data) ? res.data.data : res.data;
        setCourts(items || []);
      } else {
        setCourts([]);
      }
    } catch (err) {
      setError('Gagal memuat data lapangan. Pastikan server aktif.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, district, sportType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourts();
  };

  // 4. Client-side price filtering & sorting
  const filteredAndSortedCourts = useMemo(() => {
    let result = [...courts];

    const min = minPrice ? parseFloat(minPrice) : null;
    const max = maxPrice ? parseFloat(maxPrice) : null;

    if (min !== null && !isNaN(min)) {
      result = result.filter((c) => c.price_per_hour >= min);
    }
    if (max !== null && !isNaN(max)) {
      result = result.filter((c) => c.price_per_hour <= max);
    }

    if (sortBy === 'harga_terendah') {
      result.sort((a, b) => a.price_per_hour - b.price_per_hour);
    } else if (sortBy === 'harga_tertinggi') {
      result.sort((a, b) => b.price_per_hour - a.price_per_hour);
    }

    return result;
  }, [courts, minPrice, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setCity('');
    setDistrict('');
    setSportType('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('popularitas');
    setTimeout(() => {
      fetchCourts();
    }, 50);
  };

  return (
    <div className="bg-[#f8f9ff] font-sans text-[#0b1c30] min-h-screen flex flex-col">
      <Navbar />

      <main className="w-full pt-16 bg-[#f8f9ff] flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[300px] md:h-[350px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=1920&q=80')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1c30]/75 via-[#0b1c30]/50 to-[#f8f9ff]"></div>

          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto -mt-6">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-md">
              Temukan Lapangan Terbaik.
            </h1>
            <p className="text-sm md:text-base text-white/90 drop-shadow-md max-w-xl mx-auto">
              Pesan lapangan impian Anda dengan cepat dan mudah. Jelajahi berbagai pilihan lapangan olahraga di seluruh Indonesia.
            </p>
          </div>
        </section>

        {/* Floating Filter Bar */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-6 -mt-12">
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-2xl shadow-lg border border-[#bccbb9]/30 p-3 md:p-4 flex flex-col md:flex-row items-center gap-3"
          >
            {/* Search Input */}
            <div className="flex-1 w-full relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 text-[20px]">
                search
              </span>
              <input
                className="w-full bg-[#f8f9ff] py-2.5 pl-10 pr-4 rounded-xl border border-[#bccbb9]/40 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none transition-all text-sm text-[#0b1c30] placeholder:text-[#3d4a3d]/50"
                placeholder="Cari nama lapangan atau alamat..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* City Dropdown */}
            <div className="w-full md:w-44 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 pointer-events-none text-[20px]">
                location_city
              </span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#f8f9ff] py-2.5 pl-10 pr-8 rounded-xl border border-[#bccbb9]/40 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none text-sm text-[#0b1c30] appearance-none cursor-pointer"
              >
                <option value="">Semua Kota</option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            {/* District Dropdown */}
            <div className="w-full md:w-44 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 pointer-events-none text-[20px]">
                location_on
              </span>
              <select
                value={district}
                disabled={!city || availableDistricts.length === 0}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#f8f9ff] py-2.5 pl-10 pr-8 rounded-xl border border-[#bccbb9]/40 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none text-sm text-[#0b1c30] appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="">Semua Kecamatan</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            {/* Sport Type Dropdown */}
            <div className="w-full md:w-48 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 pointer-events-none text-[20px]">
                sports
              </span>
              <select
                value={sportType}
                onChange={(e) => setSportType(e.target.value)}
                className="w-full bg-[#f8f9ff] py-2.5 pl-10 pr-8 rounded-xl border border-[#bccbb9]/40 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none appearance-none text-sm text-[#0b1c30] cursor-pointer"
              >
                <option value="">Semua Olahraga</option>
                {availableSports.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto bg-[#006e2f] hover:bg-[#005321] text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Cari</span>
            </button>
          </form>
        </div>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto w-full px-6 py-10 flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar (Filters) */}
          <aside className="w-full lg:w-[260px] shrink-0 flex flex-col gap-6">
            {/* Rentang Harga */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#bccbb9]/30 p-6 flex flex-col gap-4">
              <h3 className="font-bold text-[#0b1c30] text-base">Rentang Harga</h3>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4a3d] font-semibold text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min (e.g. 50000)"
                    className="w-full bg-[#f8f9ff] py-2 pl-9 pr-3 rounded-xl border border-[#bccbb9]/40 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none text-xs text-[#0b1c30]"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4a3d] font-semibold text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Maks (e.g. 200000)"
                    className="w-full bg-[#f8f9ff] py-2 pl-9 pr-3 rounded-xl border border-[#bccbb9]/40 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none text-xs text-[#0b1c30]"
                  />
                </div>
                {(search || city || district || sportType || minPrice || maxPrice) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs text-[#ba1a1a] hover:underline font-semibold mt-1 text-center cursor-pointer"
                  >
                    Reset Semua Filter
                  </button>
                )}
              </div>
            </div>

            {/* Tips Banner */}
            <div className="bg-[#e5eeff] rounded-2xl p-5 flex flex-col gap-2 border-l-4 border-[#006e2f]">
              <div className="flex items-center gap-1.5 text-[#006e2f]">
                <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                <span className="font-bold text-sm">Tips Booking</span>
              </div>
              <p className="text-xs text-[#3d4a3d] leading-relaxed">
                Pesan 2 hari lebih awal untuk mengamankan jam favorit (18:00 - 21:00).
              </p>
            </div>
          </aside>

          {/* Right Content (Court Grid) */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#bccbb9]/30 gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#0b1c30]">Menampilkan Lapangan</h2>
                <span className="text-xs font-bold text-[#006e2f] bg-[#e5eeff] px-3 py-1.5 rounded-full">
                  {filteredAndSortedCourts.length} Ditemukan
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#3d4a3d]">Urutkan:</span>
                <div className="relative flex items-center">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-[#006e2f] font-bold text-xs outline-none cursor-pointer border-b border-dashed border-[#006e2f] pb-0.5 appearance-none pr-5 z-10"
                  >
                    <option value="popularitas">Popularitas</option>
                    <option value="harga_terendah">Harga Terendah</option>
                    <option value="harga_tertinggi">Harga Tertinggi</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-0 text-[#006e2f] pointer-events-none text-[16px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-[#bccbb9]/30 animate-pulse flex flex-col gap-3"
                  >
                    <div className="h-44 bg-gray-200 rounded-xl"></div>
                    <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded mt-4"></div>
                  </div>
                ))}
              </div>
            ) : filteredAndSortedCourts.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-[#bccbb9]/30 p-12 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#3d4a3d]">
                  <span className="material-symbols-outlined text-[32px]">sports_soccer</span>
                </div>
                <h3 className="text-lg font-bold text-[#0b1c30]">Belum Ada Lapangan yang Cocok</h3>
                <p className="text-xs text-[#3d4a3d] max-w-md">
                  Coba ubah filter kota, cabang olahraga, atau gunakan kata kunci pencarian yang lebih umum.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#006e2f] text-white text-xs font-bold hover:bg-[#005321] transition-all shadow-sm cursor-pointer"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              /* Courts Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAndSortedCourts.map((court) => (
                  <div
                    key={court.court_id}
                    className="bg-white rounded-2xl shadow-sm border border-[#bccbb9]/30 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col relative group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#006e2f] z-10"></div>

                    {/* Image Section */}
                    <div className="h-48 w-full relative overflow-hidden bg-[#e5eeff]">
                      <div className="absolute top-3 right-3 z-10 bg-[#006e2f] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        {court.sport_type}
                      </div>
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={court.image_url || getCourtFallbackImage(court.sport_type)}
                        alt={court.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getCourtFallbackImage(court.sport_type);
                        }}
                      />
                    </div>

                    {/* Details Section */}
                    <div className="p-5 flex flex-col flex-1 gap-3">
                      <h3 className="text-lg font-bold text-[#0b1c30] line-clamp-1">{court.name}</h3>

                      <div className="flex items-start gap-1.5 text-[#3d4a3d]">
                        <span className="material-symbols-outlined text-[18px] shrink-0 mt-[1px]">
                          location_on
                        </span>
                        <span className="text-xs font-medium line-clamp-1">
                          {court.address}
                          {court.city ? `, ${court.city}` : ''}
                        </span>
                      </div>

                      {court.description && (
                        <p className="text-xs text-[#3d4a3d]/80 line-clamp-2">
                          {court.description}
                        </p>
                      )}

                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#bccbb9]/30">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium text-[#3d4a3d]">Harga Sewa</span>
                          <span className="text-base font-bold text-[#006e2f]">
                            {formatRupiah(court.price_per_hour)}
                            <span className="text-[10px] font-normal text-[#3d4a3d]">/jam</span>
                          </span>
                        </div>
                        <Link
                          href={`/lapangan/detail?id=${court.court_id}`}
                          className="bg-[#e5eeff] text-[#006e2f] hover:bg-[#006e2f] hover:text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors border border-[#006e2f]/20"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#bccbb9]/30 py-8 mt-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Lapangin Logo" className="w-6 h-6 object-contain" />
            <span className="text-sm font-bold text-[#006e2f]">Lapangin Indonesia</span>
          </div>
          <p className="text-xs text-[#3d4a3d]">© 2026 Lapangin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function CariLapanganPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
          <span className="text-sm font-semibold text-[#006e2f]">Memuat Lapangin...</span>
        </div>
      }
    >
      <CariLapanganContent />
    </Suspense>
  );
}