export default function PelangganPage() {
  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#0b1c30]">Data Pelanggan</h1>
        <p className="text-base text-[#3d4a3d]">Kelola data pelanggan yang pernah melakukan booking di fasilitas Anda.</p>
      </header>

      {/* Toolbar: Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full bg-[#ffffff] rounded-xl p-4 shadow-sm border border-[#bccbb9]/30">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-[400px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3d4a3d]/50">search</span>
          <input 
            className="w-full bg-[#f8f9ff] text-[#0b1c30] text-sm pl-12 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006e2f]/50 border border-transparent focus:border-transparent transition-all placeholder:text-[#3d4a3d]/50" 
            placeholder="Cari nama atau kontak pelanggan..." 
            type="text"
          />
        </div>

        {/* Filter Button */}
        <button className="flex items-center gap-2 px-6 py-2.5 bg-[#f8f9ff] border border-[#bccbb9]/30 text-[#0b1c30] text-sm font-semibold rounded-lg hover:bg-[#e5eeff] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]/50">
          <span className="material-symbols-outlined text-[20px]">filter_list</span>
          <span>Filter</span>
        </button>
      </div>

      {/* Tabel Data Pelanggan */}
      <div className="w-full bg-[#ffffff] rounded-xl shadow-sm border border-[#bccbb9]/30 overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9ff] text-[#3d4a3d] font-semibold text-sm border-b border-[#bccbb9]/30">
                <th className="px-6 py-4 w-1/4">Nama Pelanggan</th>
                <th className="px-6 py-4 w-1/4">Kontak (WA/Email)</th>
                <th className="px-6 py-4 w-[15%]">Total Booking</th>
                <th className="px-6 py-4 w-[20%]">Terakhir Booking</th>
                <th className="px-6 py-4 w-[15%] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#0b1c30] divide-y divide-[#bccbb9]/20">
              
              {/* Row 1 - Andi Saputra */}
              <tr className="hover:bg-[#f8f9ff]/50 transition-colors group cursor-pointer">
                <td className="px-6 py-4 font-medium flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center font-bold uppercase shrink-0">A</div>
                  Andi Saputra
                </td>
                <td className="px-6 py-4 text-xs flex flex-col justify-center gap-1">
                  <span className="font-medium text-[#3d4a3d]">08123456789</span>
                  <span className="text-[#3d4a3d]/70">andi@email.com</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#006e2f]">15</span>
                    <span className="text-xs text-[#3d4a3d]">Booking</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#3d4a3d] font-medium">12 Okt 2023</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#006e2f] font-bold text-xs w-full max-w-[80px]">Aktif</span>
                </td>
              </tr>

              {/* Row 2 - Siti Aminah */}
              <tr className="hover:bg-[#f8f9ff]/50 transition-colors group cursor-pointer">
                <td className="px-6 py-4 font-medium flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#82abff] text-[#001a42] flex items-center justify-center font-bold uppercase shrink-0">S</div>
                  Siti Aminah
                </td>
                <td className="px-6 py-4 text-xs flex flex-col justify-center gap-1">
                  <span className="font-medium text-[#3d4a3d]">08778899112</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#006e2f]">8</span>
                    <span className="text-xs text-[#3d4a3d]">Booking</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#3d4a3d] font-medium">10 Okt 2023</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#006e2f] font-bold text-xs w-full max-w-[80px]">Aktif</span>
                </td>
              </tr>

              {/* Row 3 - Budi Raharjo */}
              <tr className="hover:bg-[#f8f9ff]/50 transition-colors group cursor-pointer">
                <td className="px-6 py-4 font-medium flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#dae2fd] text-[#131b2e] flex items-center justify-center font-bold uppercase shrink-0">B</div>
                  Budi Raharjo
                </td>
                <td className="px-6 py-4 text-xs flex flex-col justify-center gap-1">
                  <span className="font-medium text-[#3d4a3d]">08199223344</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#3d4a3d]">2</span>
                    <span className="text-xs text-[#3d4a3d]">Booking</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#3d4a3d] font-medium">05 Sep 2023</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#e5eeff] text-[#3d4a3d] font-bold text-xs w-full max-w-[80px]">Non-aktif</span>
                </td>
              </tr>

              {/* Row 4 - Diana Putri */}
              <tr className="hover:bg-[#f8f9ff]/50 transition-colors group cursor-pointer">
                <td className="px-6 py-4 font-medium flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center font-bold uppercase shrink-0">D</div>
                  Diana Putri
                </td>
                <td className="px-6 py-4 text-xs flex flex-col justify-center gap-1">
                  <span className="font-medium text-[#3d4a3d]">08521122334</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#006e2f]">24</span>
                    <span className="text-xs text-[#3d4a3d]">Booking</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#3d4a3d] font-medium">13 Okt 2023</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#006e2f] font-bold text-xs w-full max-w-[80px]">Aktif</span>
                </td>
              </tr>

              {/* Row 5 - Eko Prasetyo */}
              <tr className="hover:bg-[#f8f9ff]/50 transition-colors group cursor-pointer">
                <td className="px-6 py-4 font-medium flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#dce9ff] text-[#001a42] flex items-center justify-center font-bold uppercase shrink-0">E</div>
                  Eko Prasetyo
                </td>
                <td className="px-6 py-4 text-xs flex flex-col justify-center gap-1">
                  <span className="font-medium text-[#3d4a3d]">08212233445</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#006e2f]">5</span>
                    <span className="text-xs text-[#3d4a3d]">Booking</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#3d4a3d] font-medium">28 Sep 2023</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#006e2f] font-bold text-xs w-full max-w-[80px]">Aktif</span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-[#f8f9ff] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[#bccbb9]/30">
          <p className="text-sm text-[#3d4a3d]">
            Menampilkan <span className="font-bold text-[#0b1c30]">1 - 5</span> dari <span className="font-bold text-[#0b1c30]">25</span> pelanggan
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[#3d4a3d]">Halaman 1 dari 5</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-[#3d4a3d] hover:text-[#0b1c30] hover:bg-[#e5eeff] rounded-full transition-colors opacity-50 cursor-not-allowed">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="p-1.5 text-[#3d4a3d] hover:text-[#0b1c30] hover:bg-[#e5eeff] rounded-full transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}