import Link from 'next/link';

export default function CustomerBookingPage() {
  return (
    <div className="bg-[#f8f9ff] font-sans text-[#0b1c30] min-h-screen flex flex-col">
      
      {/* Header (Navbar) */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-[#bccbb9]/30">
        <div className="h-16 w-full px-6 md:px-12 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Lapangin Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-[#006e2f] tracking-tight">Lapangin</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 h-16">
              <Link href="/" className="text-sm font-semibold text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Beranda</Link>
              <Link href="/lapangan" className="text-sm font-semibold text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Cari Lapangan</Link>
              <Link href="/customer/booking" className="text-sm font-bold text-[#006e2f] border-b-2 border-[#006e2f] h-full flex items-center transition-colors">Booking Saya</Link>
              <Link href="/profile" className="text-sm font-semibold text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Profile</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e5eeff] text-[#3d4a3d] transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#006e2f] flex items-center justify-center cursor-pointer shadow-sm">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-20 pb-20 flex-1">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col">
          
          {/* Header Section */}
          <div className="pt-6 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#bccbb9]/40">
            <div>
              <h1 className="text-3xl font-bold text-[#0b1c30] mb-2">Booking Saya</h1>
              <p className="text-sm text-[#3d4a3d]">Pantau status dan riwayat pemesanan lapangan Anda.</p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar -mb-[1px]">
              <button className="py-2 text-sm font-semibold text-[#3d4a3d] hover:text-[#0b1c30] transition-colors whitespace-nowrap">Semua</button>
              <button className="py-2 text-sm font-semibold text-[#3d4a3d] hover:text-[#0b1c30] transition-colors whitespace-nowrap">Menunggu Pembayaran</button>
              <button className="py-2 text-sm font-bold text-[#006e2f] border-b-2 border-[#006e2f] whitespace-nowrap">Dikonfirmasi</button>
              <button className="py-2 text-sm font-semibold text-[#3d4a3d] hover:text-[#0b1c30] transition-colors whitespace-nowrap">Dibatalkan</button>
            </div>
          </div>

          {/* Main Content List */}
          <div className="flex flex-col gap-6 pt-8">
            
            {/* Card 1 - Dikonfirmasi */}
            <div className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden border border-[#bccbb9]/30">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#006e2f]"></div>
              
              {/* Thumbnail */}
              <div className="w-full md:w-56 h-36 flex-shrink-0">
                <img alt="Court A Premium Line" className="w-full h-full object-cover rounded-lg" src="https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=600&q=80"/>
              </div>
              
              {/* Details */}
              <div className="flex-grow w-full flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#3d4a3d] uppercase tracking-wider">#BK-1042</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#bccbb9]"></span>
                  <h3 className="text-xl font-bold text-[#0b1c30] truncate">Court A - Premium Line</h3>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-[#3d4a3d]">
                    <span className="material-symbols-outlined text-[#006e2f] text-[20px]">calendar_month</span>
                    <span className="text-sm font-medium">12 Okt 2026, 19:00 - 21:00</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#006e2f] text-[20px]">payments</span>
                    <span className="text-sm font-bold text-[#0b1c30]">Rp 200.000</span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="w-full md:w-auto flex flex-col items-end gap-3 flex-shrink-0 border-t md:border-t-0 md:border-l border-[#bccbb9]/40 pt-4 md:pt-0 md:pl-6">
                <div className="bg-[#22c55e]/20 text-[#004b1e] px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-[#22c55e]/30">
                  <span className="w-2 h-2 rounded-full bg-[#006e2f]"></span>
                  <span className="text-xs font-bold">Dikonfirmasi</span>
                </div>
                <button className="w-full md:w-40 px-4 py-2 rounded-lg border-2 border-[#006e2f] text-[#006e2f] font-bold text-sm hover:bg-[#006e2f]/5 transition-colors flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                  Lihat E-Ticket
                </button>
                <button className="w-full md:w-40 px-4 py-2 rounded-lg border border-[#ba1a1a] text-[#ba1a1a] font-bold text-sm hover:bg-[#ffdad6]/30 transition-colors flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Batalkan
                </button>
              </div>
            </div>

            {/* Card 2 - Dikonfirmasi */}
            <div className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden border border-[#bccbb9]/30">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#006e2f]"></div>
              
              {/* Thumbnail */}
              <div className="w-full md:w-56 h-36 flex-shrink-0">
                <img alt="Court B Arena Futsal" className="w-full h-full object-cover rounded-lg" src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80"/>
              </div>
              
              {/* Details */}
              <div className="flex-grow w-full flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#3d4a3d] uppercase tracking-wider">#BK-1039</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#bccbb9]"></span>
                  <h3 className="text-xl font-bold text-[#0b1c30] truncate">Court B - Arena Futsal</h3>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-[#3d4a3d]">
                    <span className="material-symbols-outlined text-[#006e2f] text-[20px]">calendar_month</span>
                    <span className="text-sm font-medium">10 Okt 2026, 16:00 - 18:00</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#006e2f] text-[20px]">payments</span>
                    <span className="text-sm font-bold text-[#0b1c30]">Rp 300.000</span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="w-full md:w-auto flex flex-col items-end gap-3 flex-shrink-0 border-t md:border-t-0 md:border-l border-[#bccbb9]/40 pt-4 md:pt-0 md:pl-6">
                <div className="bg-[#22c55e]/20 text-[#004b1e] px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-[#22c55e]/30">
                  <span className="w-2 h-2 rounded-full bg-[#006e2f]"></span>
                  <span className="text-xs font-bold">Dikonfirmasi</span>
                </div>
                <button className="w-full md:w-40 px-4 py-2 rounded-lg border-2 border-[#006e2f] text-[#006e2f] font-bold text-sm hover:bg-[#006e2f]/5 transition-colors flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                  Lihat E-Ticket
                </button>
                <button className="w-full md:w-40 px-4 py-2 rounded-lg border border-[#ba1a1a] text-[#ba1a1a] font-bold text-sm hover:bg-[#ffdad6]/30 transition-colors flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Batalkan
                </button>
              </div>
            </div>

            {/* Card 3 - Selesai (TANPA TOMBOL BATAL) */}
            <div className="w-full bg-white/60 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden border border-[#bccbb9]/30">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#bccbb9]"></div>
              
              {/* Thumbnail (Grayscale) */}
              <div className="w-full md:w-56 h-36 flex-shrink-0 grayscale opacity-80">
                <img alt="Court A Premium Line" className="w-full h-full object-cover rounded-lg" src="https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=600&q=80"/>
              </div>
              
              {/* Details (Opacity reduced) */}
              <div className="flex-grow w-full flex flex-col gap-2 opacity-80">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#3d4a3d] uppercase tracking-wider">#BK-1035</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#bccbb9]"></span>
                  <h3 className="text-xl font-bold text-[#0b1c30] truncate">Court A - Premium Line</h3>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-[#3d4a3d]">
                    <span className="material-symbols-outlined text-[#565e74] text-[20px]">calendar_month</span>
                    <span className="text-sm font-medium">05 Okt 2026, 20:00 - 21:00</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#565e74] text-[20px]">payments</span>
                    <span className="text-sm font-bold text-[#0b1c30]">Rp 100.000</span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="w-full md:w-auto flex flex-col items-end gap-3 flex-shrink-0 border-t md:border-t-0 md:border-l border-[#bccbb9]/40 pt-4 md:pt-0 md:pl-6">
                <div className="bg-[#e5eeff] text-[#3d4a3d] px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#565e74]"></span>
                  <span className="text-xs font-bold">Selesai</span>
                </div>
                <button className="w-full md:w-40 px-4 py-2 rounded-lg border border-[#bccbb9] text-[#3d4a3d] font-bold text-sm hover:bg-[#f8f9ff] transition-colors flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  Riwayat
                </button>
                {/* Tidak ada tombol batalkan karena sudah selesai */}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer Lengkap */}
      <footer className="w-full bg-[#f8f9ff] py-8 border-t border-[#bccbb9]/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[#3d4a3d] text-sm font-medium">
            <img src="/logo.png" alt="Icon" className="w-5 h-5 object-contain grayscale opacity-60" />
            <span>© 2026 Lapangin. Professional Athletic Management.</span>
          </div>
          <div className="flex gap-6 text-sm font-bold text-[#3d4a3d]">
            <Link href="#" className="hover:text-[#006e2f] transition-colors">Bantuan</Link>
            <Link href="#" className="hover:text-[#006e2f] transition-colors">Privasi</Link>
            <Link href="#" className="hover:text-[#006e2f] transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}