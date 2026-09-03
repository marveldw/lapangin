// Format angka ke format mata uang Rupiah
export function formatRupiah(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount || 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(isNaN(num) ? 0 : num);
}

// Format ringkas (Contoh: 1.200.000 -> Rp1.2Jt / Rp1.2M)
export function formatRupiahCompact(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount || 0);
  if (!num || isNaN(num)) return 'Rp0';
  if (num >= 1000000000) {
    return 'Rp' + (num / 1000000000).toFixed(1) + 'M';
  }
  if (num >= 1000000) {
    return 'Rp' + (num / 1000000).toFixed(1) + 'Jt';
  }
  if (num >= 1000) {
    return 'Rp' + (num / 1000).toFixed(0) + 'Rb';
  }
  return 'Rp' + num;
}

// Format tanggal ke Bahasa Indonesia (Contoh: 12 Okt 2023)
export function formatDateIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
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