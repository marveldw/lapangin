import Link from 'next/link';

export default function CariLapanganPage() {
  return (
    <div className="bg-[#f8f9ff] font-sans text-[#0b1c30] min-h-screen flex flex-col">
      
      {/* Header (Navbar) */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-[#bccbb9]/30">
        <div className="h-16 w-full px-6 md:px-12 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Lapangin Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-[#006e2f] tracking-tight">Lapangin</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-semibold text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Beranda</Link>
              <Link href="/lapangan" className="text-sm font-bold text-[#006e2f] transition-colors">Cari Lapangan</Link>
              <Link href="/customer/booking" className="text-sm font-semibold text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Booking Saya</Link>
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

      <main className="w-full pt-16 bg-[#f8f9ff] flex-1">
        
        {/* Hero Section */}
        <section className="relative w-full h-[350px] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=1920&q=80')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1c30]/70 via-[#0b1c30]/50 to-[#f8f9ff]"></div>
          
          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto -mt-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-md">Temukan Lapangan Terbaik.</h1>
            <p className="text-base md:text-lg text-white/90 drop-shadow-md">
              Pesan lapangan impian Anda dengan cepat dan mudah. Jelajahi berbagai pilihan lapangan olahraga premium di seluruh Indonesia.
            </p>
          </div>
        </section>

        {/* Floating Filter Bar */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-6 -mt-10">
          <div className="bg-white rounded-xl shadow-md border border-[#bccbb9]/30 p-3 md:p-4 flex flex-col md:flex-row items-center gap-3">
            
            <div className="flex-1 w-full relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 text-[20px]">search</span>
              <input 
                className="w-full bg-[#f8f9ff] py-2.5 pl-10 pr-4 rounded-lg border border-[#bccbb9]/40 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none transition-all text-sm text-[#0b1c30] placeholder:text-[#3d4a3d]/50" 
                placeholder="Cari nama lapangan..." 
                type="text"
              />
            </div>

            <div className="w-full md:w-48 relative">
              <select className="w-full bg-[#f8f9ff] py-2.5 pl-4 pr-10 rounded-lg border border-[#bccbb9]/40 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none appearance-none text-sm text-[#0b1c30] cursor-pointer">
                <option value="">Semua Kota</option>
                <option value="semarang">Semarang</option>
                <option value="jakarta">Jakarta</option>
                <option value="bandung">Bandung</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 pointer-events-none text-[20px]">expand_more</span>
            </div>

            <div className="w-full md:w-48 relative">
              <select className="w-full bg-[#f8f9ff] py-2.5 pl-4 pr-10 rounded-lg border border-[#bccbb9]/40 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none appearance-none text-sm text-[#0b1c30] cursor-pointer">
                <option value="">Semua Kecamatan</option>
                <option value="ngaliyan">Ngaliyan</option>
                <option value="banyumanik">Banyumanik</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 pointer-events-none text-[20px]">expand_more</span>
            </div>

            <div className="w-full md:w-48 relative">
              <select className="w-full bg-[#f8f9ff] py-2.5 pl-4 pr-10 rounded-lg border border-[#bccbb9]/40 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none appearance-none text-sm text-[#0b1c30] cursor-pointer">
                <option value="">Semua Olahraga</option>
                <option value="badminton">Badminton</option>
                <option value="futsal">Futsal</option>
                <option value="basket">Basket</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 pointer-events-none text-[20px]">expand_more</span>
            </div>

            <button className="w-full md:w-auto bg-[#006e2f] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-[#005321] transition-colors shadow-sm">
              Cari
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto w-full px-6 py-10 flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar (Filters) */}
          <aside className="w-full lg:w-[260px] shrink-0 flex flex-col gap-6">
            
            {/* Fasilitas */}
            <div className="bg-white rounded-xl shadow-sm border border-[#bccbb9]/30 p-6 flex flex-col gap-4">
              <h3 className="font-bold text-[#0b1c30] text-lg">Fasilitas</h3>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#bccbb9] text-[#006e2f] focus:ring-[#006e2f]" />
                  <span className="text-sm font-medium text-[#3d4a3d] group-hover:text-[#0b1c30] transition-colors">Parkir Luas</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[#bccbb9] text-[#006e2f] focus:ring-[#006e2f]" />
                  <span className="text-sm font-medium text-[#3d4a3d] group-hover:text-[#0b1c30] transition-colors">Kantin</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#bccbb9] text-[#006e2f] focus:ring-[#006e2f]" />
                  <span className="text-sm font-medium text-[#3d4a3d] group-hover:text-[#0b1c30] transition-colors">Toilet / Loker</span>
                </label>
              </div>
            </div>

            {/* Tipe Lantai */}
            <div className="bg-white rounded-xl shadow-sm border border-[#bccbb9]/30 p-6 flex flex-col gap-4">
              <h3 className="font-bold text-[#0b1c30] text-lg">Tipe Lantai</h3>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#bccbb9] text-[#006e2f] focus:ring-[#006e2f]" />
                  <span className="text-sm font-medium text-[#3d4a3d] group-hover:text-[#0b1c30] transition-colors">Vinyl</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#bccbb9] text-[#006e2f] focus:ring-[#006e2f]" />
                  <span className="text-sm font-medium text-[#3d4a3d] group-hover:text-[#0b1c30] transition-colors">Sintetis / Rumput</span>
                </label>
              </div>
            </div>

            {/* Tips Banner */}
            <div className="bg-[#e5eeff] rounded-xl p-5 flex flex-col gap-2 border-l-4 border-[#006e2f]">
              <div className="flex items-center gap-1.5 text-[#006e2f]">
                <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                <span className="font-bold text-sm">Tips Booking</span>
              </div>
              <p className="text-sm text-[#3d4a3d] leading-relaxed">
                Pesan 2 hari lebih awal untuk mengamankan jam favorit (18:00 - 21:00).
              </p>
            </div>
          </aside>

          {/* Right Content (Court Grid) */}
          <div className="flex-1 flex flex-col gap-6">
            
            <div className="flex justify-between items-center pb-2 border-b border-[#bccbb9]/30">
              <h2 className="text-2xl font-bold text-[#0b1c30]">Menampilkan Lapangan</h2>
              <span className="text-xs font-bold text-[#006e2f] bg-[#e5eeff] px-3 py-1.5 rounded-full">12 Ditemukan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Court Card 1 */}
              <div className="bg-white rounded-xl shadow-sm border border-[#bccbb9]/30 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col relative group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#006e2f] z-10"></div>
                
                {/* Image Section */}
                <div className="h-48 w-full relative overflow-hidden bg-[#e5eeff]">
                  <div className="absolute top-3 right-3 z-10 bg-[#22c55e] text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Badminton
                  </div>
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    src="https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=600&q=80" 
                    alt="Court A"
                  />
                </div>
                
                {/* Details Section */}
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <h3 className="text-xl font-bold text-[#0b1c30] line-clamp-1">Court A - Premium Line</h3>
                  
                  <div className="flex items-start gap-1.5 text-[#3d4a3d]">
                    <span className="material-symbols-outlined text-[18px] shrink-0 mt-[1px]">location_on</span>
                    <span className="text-sm font-medium line-clamp-1">Senayan, Jakarta Selatan</span>
                  </div>
                  
                  <div className="flex gap-2 mt-1">
                    <div className="w-8 h-8 rounded-full bg-[#f8f9ff] border border-[#bccbb9]/30 flex items-center justify-center text-[#3d4a3d]" title="Parkir Luas">
                      <span className="material-symbols-outlined text-[16px]">local_parking</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#f8f9ff] border border-[#bccbb9]/30 flex items-center justify-center text-[#3d4a3d]" title="Kantin">
                      <span className="material-symbols-outlined text-[16px]">restaurant</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#f8f9ff] border border-[#bccbb9]/30 flex items-center justify-center text-[#3d4a3d]" title="Toilet / Loker">
                      <span className="material-symbols-outlined text-[16px]">shower</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#bccbb9]/30">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#3d4a3d]">Mulai dari</span>
                      <span className="text-lg font-bold text-[#006e2f]">Rp100.000<span className="text-xs font-normal text-[#3d4a3d]">/jam</span></span>
                    </div>
                    {/* BAGIAN INI YANG DIUBAH JADI LINK */}
                    <Link href="/lapangan/detail" className="bg-[#e5eeff] text-[#006e2f] hover:bg-[#006e2f] hover:text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors border border-[#006e2f]/20">
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </div>

              {/* Court Card 2 */}
              <div className="bg-white rounded-xl shadow-sm border border-[#bccbb9]/30 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col relative group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#005ac2] z-10"></div>
                
                <div className="h-48 w-full relative overflow-hidden bg-[#e5eeff]">
                  <div className="absolute top-3 right-3 z-10 bg-[#005ac2] text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Futsal
                  </div>
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80" 
                    alt="Court B"
                  />
                </div>
                
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <h3 className="text-xl font-bold text-[#0b1c30] line-clamp-1">Court B - Arena Futsal</h3>
                  
                  <div className="flex items-start gap-1.5 text-[#3d4a3d]">
                    <span className="material-symbols-outlined text-[18px] shrink-0 mt-[1px]">location_on</span>
                    <span className="text-sm font-medium line-clamp-1">Dago, Bandung</span>
                  </div>
                  
                  <div className="flex gap-2 mt-1">
                    <div className="w-8 h-8 rounded-full bg-[#f8f9ff] border border-[#bccbb9]/30 flex items-center justify-center text-[#3d4a3d]" title="Parkir">
                      <span className="material-symbols-outlined text-[16px]">local_parking</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#f8f9ff] border border-[#bccbb9]/30 flex items-center justify-center text-[#3d4a3d]" title="Toilet / Loker">
                      <span className="material-symbols-outlined text-[16px]">shower</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#bccbb9]/30">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#3d4a3d]">Mulai dari</span>
                      <span className="text-lg font-bold text-[#006e2f]">Rp150.000<span className="text-xs font-normal text-[#3d4a3d]">/jam</span></span>
                    </div>
                    {/* BAGIAN INI YANG DIUBAH JADI LINK */}
                    <Link href="/lapangan/detail" className="bg-[#e5eeff] text-[#006e2f] hover:bg-[#006e2f] hover:text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors border border-[#006e2f]/20">
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer Lengkap */}
      <footer className="w-full bg-white border-t border-[#bccbb9]/30 pt-16 pb-8 mt-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-[#bccbb9]/30 pb-10">
          
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Lapangin Logo" className="w-8 h-8 object-contain" />
              <span className="text-2xl font-bold text-[#006e2f] tracking-tight">Lapangin</span>
            </Link>
            <p className="text-sm text-[#3d4a3d] leading-relaxed">
              Platform booking lapangan olahraga nomor satu di Indonesia.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-[#0b1c30]">Produk</h4>
            <Link href="#" className="text-sm font-medium text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Cari Lapangan</Link>
            <Link href="#" className="text-sm font-medium text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Cara Booking</Link>
            <Link href="#" className="text-sm font-medium text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Mitra Venue</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-[#0b1c30]">Bantuan</h4>
            <Link href="#" className="text-sm font-medium text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Pusat Bantuan</Link>
            <Link href="#" className="text-sm font-medium text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Kontak Kami</Link>
            <Link href="#" className="text-sm font-medium text-[#3d4a3d] hover:text-[#006e2f] transition-colors">FAQ</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-[#0b1c30]">Legal</h4>
            <Link href="#" className="text-sm font-medium text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Syarat & Ketentuan</Link>
            <Link href="#" className="text-sm font-medium text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Kebijakan Privasi</Link>
          </div>
          
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8 text-center">
          <p className="text-xs font-medium text-[#3d4a3d]">© 2026 Lapangin Indonesia. Hak Cipta Dilindungi.</p>
        </div>
      </footer>

    </div>
  );
}