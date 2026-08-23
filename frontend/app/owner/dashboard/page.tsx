export default function Dashboard() {
  return (
    <div className="flex flex-col w-full gap-8">
      
      {/* 4 Kotak Data Atas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-[#e5eeff] rounded-2xl p-6 flex flex-col gap-2 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="material-symbols-outlined text-[20px]">stadium</span>
            <span className="font-semibold text-sm">Total Lapangan</span>
          </div>
          <div className="text-3xl font-bold text-[#0b1c30]">3</div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#e5eeff] rounded-2xl p-6 flex flex-col gap-2 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="material-symbols-outlined text-[20px]">event_available</span>
            <span className="font-semibold text-sm">Booking Hari Ini</span>
          </div>
          <div className="text-3xl font-bold text-[#0b1c30]">12</div>
          <div className="text-xs text-[#006e2f] flex items-center gap-1 mt-auto font-semibold">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+2 dari kemarin</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#e5eeff] rounded-2xl p-6 flex flex-col gap-2 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="material-symbols-outlined text-[20px]">payments</span>
            <span className="font-semibold text-sm">Pendapatan Hari Ini</span>
          </div>
          <div className="text-3xl font-bold text-[#0b1c30]">Rp1.2M</div>
          <div className="text-xs text-gray-500 mt-auto">Rp1.200.000</div>
        </div>

        {/* Card 4 (Primary Color) */}
        <div className="bg-[#006e2f] rounded-2xl p-6 flex flex-col gap-2 shadow-sm relative overflow-hidden text-white">
          <div className="flex items-center gap-2 text-green-200">
            <span className="material-symbols-outlined text-[20px]">monitoring</span>
            <span className="font-semibold text-sm">Pendapatan Bulan Ini</span>
          </div>
          <div className="text-3xl font-bold tracking-tight">Rp12.5M</div>
          <div className="text-xs text-green-200 mt-auto">Rp12.500.000</div>
        </div>
      </div>

      {/* Bagian Bawah (Grafik + Tabel & Jadwal) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri (Grafik & Tabel Booking) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Grafik Tren Pendapatan SVG */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-[320px] p-6 border border-gray-100">
            <div className="pb-4 flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#0b1c30]">Tren Pendapatan</h3>
              <select className="bg-gray-100 text-gray-700 text-sm rounded-xl px-3 py-1.5 border-none outline-none cursor-pointer font-medium">
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
              </select>
            </div>
            <div className="flex-1 relative">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path className="text-[#006e2f]" d="M0,80 L10,75 L20,60 L30,65 L40,40 L50,45 L60,20 L70,30 L80,10 L90,15 L100,5" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                <path className="opacity-15 text-[#006e2f]" d="M0,100 L0,80 L10,75 L20,60 L30,65 L40,40 L50,45 L60,20 L70,30 L80,10 L90,15 L100,5 L100,100 Z" fill="url(#gradient)"></path>
                <defs>
                  <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#006e2f" stopOpacity="1"></stop>
                    <stop offset="100%" stopColor="#006e2f" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Tabel Booking Terbaru */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6 flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#0b1c30]">Booking Terbaru</h3>
              <button className="text-[#006e2f] text-sm font-bold hover:underline flex items-center gap-1">
                Lihat Semua <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Pelanggan</th>
                    <th className="p-4 font-semibold">Lapangan</th>
                    <th className="p-4 font-semibold">Waktu</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-[#0b1c30]">
                  <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-semibold text-gray-500">#BK-1042</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">A</div>
                        Andi Saputra
                      </div>
                    </td>
                    <td className="p-4">Lapangan A (Futsal)</td>
                    <td className="p-4">
                      <div>12 Okt 2023</div>
                      <div className="text-xs text-gray-400">18:00 - 20:00</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-[#006e2f] text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f] mr-1.5"></span>CONFIRMED
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-semibold text-gray-500">#BK-1043</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">B</div>
                        Budi Santoso
                      </div>
                    </td>
                    <td className="p-4">Lapangan B (Badminton)</td>
                    <td className="p-4">
                      <div>12 Okt 2023</div>
                      <div className="text-xs text-gray-400">19:00 - 21:00</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>PENDING
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Kolom Kanan (Jadwal Hari Ini & Banner Upgrade) */}
        <div className="flex flex-col gap-6">
          
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#0b1c30]">Jadwal Hari Ini</h3>
              <div className="bg-gray-100 rounded-xl p-1 flex gap-1">
                <button className="px-3 py-1 bg-white shadow-sm rounded-lg text-gray-800 text-xs font-bold">Lap A</button>
                <button className="px-3 py-1 text-gray-500 hover:bg-gray-200 rounded-lg text-xs font-medium">Lap B</button>
                <button className="px-3 py-1 text-gray-500 hover:bg-gray-200 rounded-lg text-xs font-medium">Lap C</button>
              </div>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-4 font-semibold">Selasa, 12 Okt</p>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 items-center">
                <span className="w-10 text-right text-xs font-bold text-gray-400">08:00</span>
                <div className="flex-1 bg-gray-50 rounded-xl p-3 text-xs font-bold text-[#006e2f] border border-gray-100">Tersedia</div>
              </div>
              <div className="flex gap-3 items-center">
                <span className="w-10 text-right text-xs font-bold text-gray-400">10:00</span>
                <div className="flex-1 bg-gray-100 rounded-xl p-3 border-l-4 border-l-[#006e2f] shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-[#0b1c30]">Eka Putra</span>
                    <span className="text-[10px] bg-green-200 text-[#004b1e] px-2 py-0.5 rounded font-bold">Paid</span>
                  </div>
                  <span className="text-[11px] text-gray-500">2 Jam • Regular</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#d3e4fe] rounded-2xl shadow-sm p-6 relative overflow-hidden flex flex-col justify-center">
            <h4 className="font-bold text-base text-[#0b1c30] relative z-10 w-3/4">Upgrade ke Pro untuk Fitur Liga & Turnamen</h4>
            <button className="mt-4 bg-[#005ac2] text-white px-4 py-2.5 rounded-xl text-xs font-bold self-start relative z-10 hover:bg-blue-700 transition-colors shadow-md">
              Pelajari Lebih Lanjut
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}