import Link from 'next/link';

export default function DetailLapanganPage() {
  return (
    <div className="bg-[#f8f9ff] font-sans text-[#0b1c30] min-h-screen flex flex-col">
      
      {/* Header (Navbar) */}
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm border-b border-[#bccbb9]/30">
        <div className="h-16 w-full px-6 md:px-12 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Lapangin Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-[#006e2f] tracking-tight">Lapangin</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 h-16">
              <Link href="/" className="text-sm font-semibold text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Beranda</Link>
              <Link href="/lapangan" className="text-sm font-bold text-[#006e2f] border-b-2 border-[#006e2f] h-full flex items-center transition-colors">Cari Lapangan</Link>
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

      <main className="w-full pt-16 bg-[#f8f9ff] flex-1 pb-20">
        
        {/* Hero Image */}
        <div className="w-full h-[300px] md:h-[400px]">
          <img 
            src="https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=1920&q=80" 
            alt="Venue Banner" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8 flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Kiri (Info, Jadwal, Lokasi) */}
          <div className="flex-1 flex flex-col gap-6 w-full">
            
            {/* 1. Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-[#bccbb9]/30 p-6 md:p-8 flex flex-col md:flex-row gap-8 justify-between">
              
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex gap-2">
                  <span className="bg-[#82abff] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">sports_tennis</span> Badminton
                  </span>
                  <span className="bg-[#e5eeff] text-[#3d4a3d] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-[#bccbb9]/30">
                    <span className="material-symbols-outlined text-[14px]">verified</span> Premium Karpet
                  </span>
                </div>
                
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#0b1c30]">Court A - Premium Line</h1>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-[#3d4a3d] mt-2">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    Senayan, Jakarta Selatan <span className="text-[#bccbb9] mx-1">•</span> <a href="#" className="text-[#006e2f] font-semibold hover:underline">Lihat Peta</a>
                  </div>
                </div>

                <p className="text-sm text-[#3d4a3d] leading-relaxed max-w-2xl mt-1">
                  Lapangan badminton dengan karpet standar internasional. Dilengkapi dengan pencahayaan yang optimal dan sirkulasi udara yang baik untuk kenyamanan bermain Anda.
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex -space-x-2">
                    <img className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User" />
                    <img className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="User" />
                    <img className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="User" />
                  </div>
                  <span className="text-xs font-medium text-[#3d4a3d]">+124 orang bermain disini minggu ini</span>
                </div>
              </div>

              {/* Harga & Rating Box */}
              <div className="bg-white border border-[#bccbb9]/50 rounded-xl p-5 md:w-56 shrink-0 flex flex-col justify-center gap-4 h-fit">
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-bold tracking-widest text-[#3d4a3d] uppercase">Harga Sewa</p>
                  <p className="text-xl font-bold text-[#006e2f] mt-1">Rp100.000</p>
                  <p className="text-xs text-[#3d4a3d] mt-0.5">/ jam</p>
                </div>
                <div className="border-t border-[#bccbb9]/30"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#0b1c30]">
                    <span className="material-symbols-outlined text-[16px]">star</span>
                    <span className="text-xs font-bold">Rating</span>
                  </div>
                  <span className="text-xs font-medium text-[#3d4a3d]">4.9/5 (84 ulasan)</span>
                </div>
              </div>

            </div>

            {/* 2. Jadwal Ketersediaan */}
            <div className="bg-white rounded-xl shadow-sm border border-[#bccbb9]/30 p-6 md:p-8 flex flex-col gap-6">
              
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-[#0b1c30]">Jadwal Ketersediaan</h3>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-full border border-[#bccbb9]/50 flex items-center justify-center text-[#3d4a3d] hover:bg-[#e5eeff] transition-colors"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                  <button className="w-8 h-8 rounded-full border border-[#bccbb9]/50 flex items-center justify-center text-[#3d4a3d] hover:bg-[#e5eeff] transition-colors"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
                </div>
              </div>

              {/* Tanggal */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <div className="w-[72px] h-[84px] shrink-0 bg-[#006e2f] text-white rounded-lg flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer border border-[#006e2f]">
                  <span className="text-xs font-medium">Senin</span>
                  <span className="text-2xl font-bold leading-none">12</span>
                  <span className="text-[10px]">Okt</span>
                </div>
                {['Selasa 13', 'Rabu 14', 'Kamis 15', 'Jumat 16', 'Sabtu 17', 'Minggu 18'].map((date, i) => (
                  <div key={i} className="w-[72px] h-[84px] shrink-0 bg-white border border-[#bccbb9]/50 text-[#3d4a3d] rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#006e2f] hover:text-[#006e2f] cursor-pointer transition-colors">
                    <span className="text-xs font-medium">{date.split(' ')[0]}</span>
                    <span className="text-2xl font-bold leading-none">{date.split(' ')[1]}</span>
                    <span className="text-[10px]">Okt</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-end border-b border-[#bccbb9]/30 pb-3 mt-4">
                <p className="text-xs font-bold tracking-widest text-[#3d4a3d] uppercase">Pilih Jam Bermain</p>
                <div className="flex gap-4 text-xs font-medium text-[#3d4a3d]">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px] text-[#006e2f]">radio_button_unchecked</span> Tersedia</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px] text-[#bccbb9]">radio_button_checked</span> Penuh</span>
                </div>
              </div>

              {/* Grid Jam */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                
                {/* Baris 1 */}
                <div className="h-16 bg-[#f8f9ff] border border-[#bccbb9]/40 rounded-lg flex flex-col items-center justify-center text-[#bccbb9] cursor-not-allowed">
                  <span className="font-bold text-sm">08:00</span>
                  <span className="text-[10px]">Sudah Dibooking</span>
                </div>
                <div className="h-16 bg-[#f8f9ff] border border-[#bccbb9]/40 rounded-lg flex flex-col items-center justify-center text-[#bccbb9] cursor-not-allowed">
                  <span className="font-bold text-sm">09:00</span>
                  <span className="text-[10px]">Sudah Dibooking</span>
                </div>
                <div className="h-16 bg-white border border-[#006e2f] rounded-lg flex flex-col items-center justify-center text-[#006e2f] cursor-pointer hover:bg-[#006e2f]/5 transition-colors">
                  <span className="font-bold text-sm">10:00</span>
                  <span className="text-[10px] font-semibold">Rp100rb</span>
                </div>
                <div className="h-16 bg-white border border-[#006e2f] rounded-lg flex flex-col items-center justify-center text-[#006e2f] cursor-pointer hover:bg-[#006e2f]/5 transition-colors">
                  <span className="font-bold text-sm">11:00</span>
                  <span className="text-[10px] font-semibold">Rp100rb</span>
                </div>

                {/* Baris 2 */}
                <div className="h-16 bg-white border border-[#006e2f] rounded-lg flex flex-col items-center justify-center text-[#006e2f] cursor-pointer hover:bg-[#006e2f]/5 transition-colors">
                  <span className="font-bold text-sm">12:00</span>
                  <span className="text-[10px] font-semibold">Rp100rb</span>
                </div>
                <div className="relative h-16 bg-[#006e2f] border border-[#006e2f] rounded-lg flex flex-col items-center justify-center text-white cursor-pointer shadow-md">
                  <span className="material-symbols-outlined absolute top-1.5 right-1.5 text-[14px]">check_circle</span>
                  <span className="font-bold text-sm">13:00</span>
                  <span className="text-[10px]">Dipilih</span>
                </div>
                <div className="h-16 bg-white border border-[#006e2f] rounded-lg flex flex-col items-center justify-center text-[#006e2f] cursor-pointer hover:bg-[#006e2f]/5 transition-colors">
                  <span className="font-bold text-sm">14:00</span>
                  <span className="text-[10px] font-semibold">Rp100rb</span>
                </div>
                <div className="h-16 bg-[#f8f9ff] border border-[#bccbb9]/40 rounded-lg flex flex-col items-center justify-center text-[#bccbb9] cursor-not-allowed">
                  <span className="font-bold text-sm">15:00</span>
                  <span className="text-[10px]">Sudah Dibooking</span>
                </div>

                {/* Baris 3 */}
                <div className="h-16 bg-[#f8f9ff] border border-[#bccbb9]/40 rounded-lg flex flex-col items-center justify-center text-[#bccbb9] cursor-not-allowed">
                  <span className="font-bold text-sm">16:00</span>
                  <span className="text-[10px]">Sudah Dibooking</span>
                </div>
                <div className="h-16 bg-[#f8f9ff] border border-[#bccbb9]/40 rounded-lg flex flex-col items-center justify-center text-[#bccbb9] cursor-not-allowed">
                  <span className="font-bold text-sm">17:00</span>
                  <span className="text-[10px]">Sudah Dibooking</span>
                </div>
                <div className="relative h-16 bg-[#006e2f] border border-[#006e2f] rounded-lg flex flex-col items-center justify-center text-white cursor-pointer shadow-md">
                  <span className="material-symbols-outlined absolute top-1.5 right-1.5 text-[14px]">check_circle</span>
                  <span className="font-bold text-sm">18:00</span>
                  <span className="text-[10px]">Dipilih</span>
                </div>
                <div className="relative h-16 bg-[#006e2f] border border-[#006e2f] rounded-lg flex flex-col items-center justify-center text-white cursor-pointer shadow-md">
                  <span className="material-symbols-outlined absolute top-1.5 right-1.5 text-[14px]">check_circle</span>
                  <span className="font-bold text-sm">19:00</span>
                  <span className="text-[10px]">Dipilih</span>
                </div>

                {/* Baris 4 */}
                <div className="h-16 bg-white border border-[#006e2f] rounded-lg flex flex-col items-center justify-center text-[#006e2f] cursor-pointer hover:bg-[#006e2f]/5 transition-colors">
                  <span className="font-bold text-sm">20:00</span>
                  <span className="text-[10px] font-semibold">Rp100rb</span>
                </div>
                <div className="h-16 bg-white border border-[#006e2f] rounded-lg flex flex-col items-center justify-center text-[#006e2f] cursor-pointer hover:bg-[#006e2f]/5 transition-colors">
                  <span className="font-bold text-sm">21:00</span>
                  <span className="text-[10px] font-semibold">Rp100rb</span>
                </div>
              </div>
            </div>

            {/* 3. Lokasi Lapangan */}
            <div className="bg-white rounded-xl shadow-sm border border-[#bccbb9]/30 p-6 md:p-8 flex flex-col gap-4">
              <h3 className="font-bold text-[#0b1c30]">Lokasi Lapangan</h3>
              
              <div className="w-full h-[250px] bg-gray-200 rounded-lg overflow-hidden border border-[#bccbb9]/40">
                <img 
                  src="https://www.google.com/maps/d/thumbnail?mid=1L3OWhgPik961Q82n58pS0y6tZTo&hl=en" 
                  alt="Map Location" 
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="bg-[#f8f9ff] border border-[#bccbb9]/30 rounded-lg p-4 flex gap-4 mt-2">
                <span className="material-symbols-outlined text-[#006e2f] shrink-0 mt-0.5">directions_car</span>
                <div>
                  <h4 className="font-semibold text-sm text-[#0b1c30]">Akses Parkir & Transportasi</h4>
                  <p className="text-xs text-[#3d4a3d] mt-1 leading-relaxed">
                    Tersedia area parkir luas untuk mobil dan motor. Lokasi mudah dijangkau dari stasiun MRT terdekat dan halte TransJakarta.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Kanan: Ringkasan Booking (Sticky) */}
          <aside className="w-full lg:w-[350px] xl:w-[380px] shrink-0 h-fit sticky top-24">
            <div className="bg-white rounded-xl shadow-lg border border-[#bccbb9]/40 p-6 flex flex-col gap-5">
              
              <div>
                <h3 className="font-bold text-lg text-[#0b1c30]">Ringkasan Booking</h3>
                <p className="text-sm text-[#3d4a3d] mt-1">Court A - Premium Line</p>
              </div>

              <div className="border-t border-[#bccbb9]/30"></div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-[#3d4a3d] text-sm">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span className="font-medium">Tanggal</span>
                  </div>
                  <span className="text-sm font-semibold text-[#0b1c30]">Senin, 12 Okt 2026</span>
                </div>

                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-[#3d4a3d] text-sm">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span className="font-medium">Waktu</span>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className="bg-[#e5eeff] text-[#0b1c30] px-3 py-1 rounded-md text-xs font-semibold tracking-wide">13:00 - 14:00</span>
                    <span className="bg-[#e5eeff] text-[#0b1c30] px-3 py-1 rounded-md text-xs font-semibold tracking-wide">18:00 - 19:00</span>
                    <span className="bg-[#e5eeff] text-[#0b1c30] px-3 py-1 rounded-md text-xs font-semibold tracking-wide">19:00 - 20:00</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#f8f9ff] rounded-lg p-4 flex flex-col gap-3 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#3d4a3d]">Durasi</span>
                  <span className="font-medium text-[#0b1c30]">3 Jam dipilih</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#3d4a3d]">Harga per jam</span>
                  <span className="font-medium text-[#0b1c30]">Rp100.000</span>
                </div>
                <div className="border-t border-[#bccbb9]/30 pt-3 flex justify-between items-center">
                  <span className="font-bold text-[#0b1c30]">Total Tagihan</span>
                  <span className="text-xl font-bold text-[#006e2f]">Rp300.000</span>
                </div>
              </div>

              <Link href="/customer/checkout" className="w-full">
                <button className="w-full bg-[#006e2f] hover:bg-[#005321] text-white py-3.5 rounded-lg font-bold text-sm shadow-md transition-colors flex justify-center items-center gap-2 mt-2">
                  <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                  Booking Sekarang
                </button>
              </Link>
              
              <p className="text-[10px] text-center text-[#3d4a3d]">
                Pembayaran aman & terverifikasi.
              </p>
            </div>
          </aside>

        </div>
      </main>

      {/* Footer Minimalis */}
      <footer className="w-full bg-[#f8f9ff] py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[#3d4a3d] text-sm">
            <img src="/logo.png" alt="Icon" className="w-5 h-5 object-contain opacity-70" />
            <span>© 2026 Lapangin Indonesia. Solusi Sewa Lapangan Terpercaya.</span>
          </div>
          <div className="flex gap-6 text-sm font-semibold text-[#3d4a3d]">
            <Link href="#" className="hover:text-[#006e2f]">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-[#006e2f]">Bantuan</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}