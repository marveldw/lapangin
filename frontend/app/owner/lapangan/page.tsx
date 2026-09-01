import Link from 'next/link';

export default function DaftarLapangan() {
  return (
    <div className="flex flex-col w-full gap-8">
      
      {/* Header Halaman & Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 mb-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#0b1c30] tracking-tight uppercase">Lapangan</h1>
          <p className="text-base text-[#3d4a3d] max-w-2xl">
            Kelola data lapangan, atur harga sewa, dan pantau status ketersediaan di seluruh fasilitas olahraga Anda.
          </p>
        </div>
        
        <div className="flex items-center gap-4 self-start md:self-end">
          {/* Input Cari */}
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3d4a3d]/50">search</span>
            <input 
              className="w-full bg-[#ffffff] text-[#0b1c30] text-sm py-2.5 pl-11 pr-4 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-shadow" 
              placeholder="Cari lapangan..." 
              type="text"
            />
          </div>
          
          {/* Dropdown Status */}
          <select className="bg-[#ffffff] text-[#0b1c30] text-sm font-semibold py-2.5 px-6 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f] transition-shadow appearance-none cursor-pointer">
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Non-Aktif</option>
            <option value="perbaikan">Perbaikan</option>
          </select>
          
          {/* Tombol Tambah Lapangan - SUDAH DIUBAH JADI LINK */}
          <Link href="/owner/lapangan/tambah" className="bg-[#006e2f] text-[#ffffff] text-sm font-semibold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tambah Lapangan
          </Link>
        </div>
      </div>

      {/* Grid Daftar Lapangan */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative">
        
        {/* Card 1: Badminton */}
        <div className="bg-[#ffffff] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
          <div className="relative h-48 w-full overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZMwom1l805QJznCMhh4H5P6aiMO7_eCCnn9CtofDJhWi-foSy4VAa4Q2phO2niWiQy4G6skqecHREe2RJ6qT8_IyPU7__7WZ54BI6AxVhDKkdiOMxeaG-Zbl9vv-QRz5-IF9Pf_n_GP66WZ9QTi8xyRr2_GS0nvdjV-DjyEZkmJTHRnIxogyCmeI_hewmsA8bB2zBaR6Y3MBvCSUxMlyVocCsGgGh_vI7bdNZzNgveU8Br5FowHU-2A')" }}
            ></div>
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <span className="bg-[#22c55e]/90 backdrop-blur text-[#004b1e] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> Aktif
              </span>
            </div>
            <div className="absolute bottom-4 left-4 z-20 bg-[#f8f9ff]/90 backdrop-blur text-[#0b1c30] text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider text-[10px]">
              Badminton
            </div>
          </div>
          <div className="p-6 flex flex-col flex-1 relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-[#0b1c30] mb-1">Lapangan A</h3>
                <p className="text-sm text-[#3d4a3d] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span> Lantai 1, Gedung Utama
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-[#006e2f] block">Rp100.000</span>
                <span className="text-xs font-medium text-[#3d4a3d]">/jam</span>
              </div>
            </div>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#bccbb9]/20">
              <div className="flex gap-2 text-[#3d4a3d]">
                <span className="material-symbols-outlined text-[20px]" title="Lighting Tersedia">lightbulb</span>
                <span className="material-symbols-outlined text-[20px]" title="Karpet Sintetis">layers</span>
              </div>
              <div className="flex gap-2">
                <button className="w-9 h-9 rounded-full bg-[#e5eeff] text-[#3d4a3d] flex items-center justify-center hover:bg-[#dce9ff] hover:text-[#006e2f] transition-colors" title="Edit">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button className="w-9 h-9 rounded-full bg-[#e5eeff] text-[#3d4a3d] flex items-center justify-center hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors" title="Hapus">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Futsal */}
        <div className="bg-[#ffffff] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
          <div className="relative h-48 w-full overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBmPfZFFdtCVjVR9T-SuDu-8XKK8XwOlLXsPEK81GtjwpQ7Vx4CAmUaLZTSgkjH8zgolNzYvxKjRToWCJYIUPduAfB1oNMMFTw4Rj4L_Wqbo0jhfktV3IbZA-6hlgIzMt2S5iRfl5Mw9orSfx9T6GHYXTrJBEMNQxWUiYi3NxzcXqKgyju55F6aOvDeJN4vW_JnW6rDqeIJ0eMomJh5YA9k3t0IbY8zna5wLq_kk4r-DvKKr8L0p3_q9Q')" }}
            ></div>
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <span className="bg-[#22c55e]/90 backdrop-blur text-[#004b1e] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> Aktif
              </span>
            </div>
            <div className="absolute bottom-4 left-4 z-20 bg-[#f8f9ff]/90 backdrop-blur text-[#0b1c30] text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider text-[10px]">
              Futsal
            </div>
          </div>
          <div className="p-6 flex flex-col flex-1 relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-[#0b1c30] mb-1">Lapangan B</h3>
                <p className="text-sm text-[#3d4a3d] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span> Lantai Dasar, Hall B
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-[#006e2f] block">Rp150.000</span>
                <span className="text-xs font-medium text-[#3d4a3d]">/jam</span>
              </div>
            </div>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#bccbb9]/20">
              <div className="flex gap-2 text-[#3d4a3d]">
                <span className="material-symbols-outlined text-[20px]" title="Rumput Sintetis">grass</span>
                <span className="material-symbols-outlined text-[20px]" title="Tribun Penonton">event_seat</span>
              </div>
              <div className="flex gap-2">
                <button className="w-9 h-9 rounded-full bg-[#e5eeff] text-[#3d4a3d] flex items-center justify-center hover:bg-[#dce9ff] hover:text-[#006e2f] transition-colors" title="Edit">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button className="w-9 h-9 rounded-full bg-[#e5eeff] text-[#3d4a3d] flex items-center justify-center hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors" title="Hapus">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Tambah Lapangan Baru - SUDAH DIUBAH JADI LINK */}
        <Link href="/owner/lapangan/tambah" className="bg-[#ffffff]/50 backdrop-blur-sm rounded-2xl shadow-sm border-2 border-dashed border-[#bccbb9] hover:border-[#006e2f] hover:bg-[#ffffff] transition-all duration-300 flex flex-col items-center justify-center min-h-[350px] p-8 text-center cursor-pointer group">
          <div className="w-16 h-16 rounded-full bg-[#dce9ff] text-[#3d4a3d] group-hover:bg-[#22c55e] group-hover:text-[#004b1e] flex items-center justify-center mb-4 transition-colors">
            <span className="material-symbols-outlined text-[32px]">add_location_alt</span>
          </div>
          <h3 className="text-lg font-bold text-[#0b1c30] mb-2">Tambah Lapangan Baru</h3>
          <p className="text-sm text-[#3d4a3d] max-w-[220px]">
            Ekspansi fasilitas Anda dengan menambahkan data lapangan baru.
          </p>
        </Link>

      </div>
    </div>
  );
}