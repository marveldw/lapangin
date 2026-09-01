export default function Dashboard() {
  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      
      {/* 4 Cards Atas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#e5eeff] rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-[#006e2f]/10 rounded-full blur-xl group-hover:bg-[#006e2f]/20 transition-colors"></div>
          <div className="flex items-center gap-2 text-[#3d4a3d]">
            <span className="material-symbols-outlined text-[20px]">stadium</span>
            <span className="text-sm font-semibold tracking-wide">Total Lapangan</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-[#0b1c30]">3</div>
        </div>

        <div className="bg-[#e5eeff] rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-[#565e74]/10 rounded-full blur-xl group-hover:bg-[#565e74]/20 transition-colors"></div>
          <div className="flex items-center gap-2 text-[#3d4a3d]">
            <span className="material-symbols-outlined text-[20px]">event_available</span>
            <span className="text-sm font-semibold tracking-wide">Booking Hari Ini</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-[#0b1c30]">12</div>
          <div className="text-xs font-medium text-[#006e2f] flex items-center gap-1 mt-auto">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+2 dari kemarin</span>
          </div>
        </div>

        <div className="bg-[#e5eeff] rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-[#005ac2]/10 rounded-full blur-xl group-hover:bg-[#005ac2]/20 transition-colors"></div>
          <div className="flex items-center gap-2 text-[#3d4a3d]">
            <span className="material-symbols-outlined text-[20px]">payments</span>
            <span className="text-sm font-semibold tracking-wide">Pendapatan Hari Ini</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-[#0b1c30]">Rp1.2M</div>
          <div className="text-xs font-medium text-[#3d4a3d] mt-auto">Rp1.200.000</div>
        </div>

        <div className="bg-[#006e2f] rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group text-[#ffffff]">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <span className="material-symbols-outlined text-[120px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          </div>
          <div className="flex items-center gap-2 text-[#4ae176]">
            <span className="material-symbols-outlined text-[20px]">monitoring</span>
            <span className="text-sm font-semibold tracking-wide">Pendapatan Bulan Ini</span>
          </div>
          <div className="text-4xl font-bold tracking-tight z-10">Rp12.5M</div>
          <div className="text-xs font-medium text-[#4ae176] mt-auto z-10">Rp12.500.000</div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Konten Kiri (Grafik & Tabel) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Grafik Pendapatan */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm flex flex-col h-[350px]">
            <div className="p-6 pb-2 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-[#0b1c30]">Tren Pendapatan</h3>
              <select className="bg-[#eff4ff] text-[#3d4a3d] text-sm font-semibold tracking-wide rounded-lg px-4 py-1.5 border-none outline-none cursor-pointer">
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
              </select>
            </div>
            
            <div className="flex-1 px-6 pb-6 pt-2 flex flex-col">
              {/* Box SVG */}
              <div className="flex-1 relative w-full min-h-[150px]">
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
                  <defs>
                    <linearGradient id="gradientLineDash" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#006e2f" stopOpacity="0.2"></stop>
                      <stop offset="100%" stopColor="#006e2f" stopOpacity="0"></stop>
                    </linearGradient>
                  </defs>
                  <path d="M0,300 L0,250 C100,220 200,280 300,200 C400,120 500,180 600,150 C700,120 800,80 900,100 L1000,60 L1000,300 Z" fill="url(#gradientLineDash)"></path>
                  <path className="text-[#006e2f]" d="M0,250 C100,220 200,280 300,200 C400,120 500,180 600,150 C700,120 800,80 900,100 L1000,60" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                  <circle className="text-[#006e2f]" cx="300" cy="200" fill="#ffffff" r="5" stroke="currentColor" strokeWidth="3"></circle>
                  <circle className="text-[#006e2f]" cx="600" cy="150" fill="#ffffff" r="5" stroke="currentColor" strokeWidth="3"></circle>
                  <circle className="text-[#006e2f]" cx="900" cy="100" fill="#ffffff" r="5" stroke="currentColor" strokeWidth="3"></circle>
                </svg>
              </div>
              {/* Teks Tanggal di Bawah Grafik */}
              <div className="w-full flex justify-between pt-3 mt-2 border-t border-[#bccbb9]/30 font-semibold text-xs text-[#3d4a3d]">
                <span>18 Ags</span>
                <span>20 Ags</span>
                <span>22 Ags</span>
                <span>24 Ags</span>
              </div>
            </div>
          </div>

          <div className="bg-[#ffffff] rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 flex justify-between items-center bg-[#ffffff] sticky top-0 z-10">
              <h3 className="text-xl font-semibold text-[#0b1c30]">Booking Terbaru</h3>
              <button className="text-[#006e2f] text-sm font-semibold tracking-wide hover:text-[#006e2f]/80 transition-colors flex items-center gap-1">
                Lihat Semua <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] text-[#3d4a3d] text-xs font-medium uppercase tracking-wider">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Pelanggan</th>
                    <th className="p-4 font-semibold">Lapangan</th>
                    <th className="p-4 font-semibold">Waktu</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-normal text-[#0b1c30]">
                  
                  {/* Row 1 */}
                  <tr className="hover:bg-[#eff4ff]/50 transition-colors group cursor-pointer border-b border-[#bccbb9]/10">
                    <td className="p-4 text-sm font-semibold tracking-wide text-[#3d4a3d]">#BK-1042</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#dae2fd] text-[#5c647a] flex items-center justify-center text-sm font-semibold tracking-wide">A</div>
                        Andi Saputra
                      </div>
                    </td>
                    <td className="p-4">Lapangan A (Futsal)</td>
                    <td className="p-4">
                      <div>12 Okt 2023</div>
                      <div className="text-[#3d4a3d] text-xs font-medium">18:00 - 20:00</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#22c55e]/20 text-[#004b1e] text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f] mr-1.5"></span>CONFIRMED
                      </span>
                    </td>
                    <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-[#3d4a3d] hover:text-[#006e2f] rounded-full hover:bg-[#e5eeff] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  
                  {/* Row 2 */}
                  <tr className="hover:bg-[#eff4ff]/50 transition-colors group cursor-pointer border-b border-[#bccbb9]/10">
                    <td className="p-4 text-sm font-semibold tracking-wide text-[#3d4a3d]">#BK-1043</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#82abff] text-[#003d88] flex items-center justify-center text-sm font-semibold tracking-wide">B</div>
                        Budi Santoso
                      </div>
                    </td>
                    <td className="p-4">Lapangan B (Badminton)</td>
                    <td className="p-4">
                      <div>12 Okt 2023</div>
                      <div className="text-[#3d4a3d] text-xs font-medium">19:00 - 21:00</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#d3e4fe] text-[#3d4a3d] text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#565e74] mr-1.5"></span>PENDING
                      </span>
                    </td>
                    <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-[#3d4a3d] hover:text-[#006e2f] rounded-full hover:bg-[#e5eeff] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-[#eff4ff]/50 transition-colors group cursor-pointer border-b border-[#bccbb9]/10">
                    <td className="p-4 text-sm font-semibold tracking-wide text-[#3d4a3d]">#BK-1044</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center text-sm font-semibold tracking-wide">C</div>
                        Citra Lestari
                      </div>
                    </td>
                    <td className="p-4">Lapangan C (Basket)</td>
                    <td className="p-4">
                      <div>13 Okt 2023</div>
                      <div className="text-[#3d4a3d] text-xs font-medium">08:00 - 10:00</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#ffdad6]/50 text-[#ba1a1a] text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] mr-1.5"></span>CANCELLED
                      </span>
                    </td>
                    <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-[#3d4a3d] hover:text-[#006e2f] rounded-full hover:bg-[#e5eeff] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-[#eff4ff]/50 transition-colors group cursor-pointer">
                    <td className="p-4 text-sm font-semibold tracking-wide text-[#3d4a3d]">#BK-1045</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#dae2fd] text-[#5c647a] flex items-center justify-center text-sm font-semibold tracking-wide">D</div>
                        Doni Pratama
                      </div>
                    </td>
                    <td className="p-4">Lapangan A (Futsal)</td>
                    <td className="p-4">
                      <div>13 Okt 2023</div>
                      <div className="text-[#3d4a3d] text-xs font-medium">16:00 - 18:00</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#22c55e]/20 text-[#004b1e] text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f] mr-1.5"></span>CONFIRMED
                      </span>
                    </td>
                    <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-[#3d4a3d] hover:text-[#006e2f] rounded-full hover:bg-[#e5eeff] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Konten Kanan (Jadwal & Banner) */}
        <div className="flex flex-col gap-6">
          
          {/* Jadwal Hari Ini */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 pb-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-[#0b1c30]">Jadwal Hari Ini</h3>
              <div className="bg-[#e5eeff] rounded-lg p-1 flex gap-1">
                <button className="px-2 py-1 bg-[#ffffff] shadow-sm rounded text-[#0b1c30] text-xs font-medium transition-all">Lap A</button>
                <button className="px-2 py-1 text-[#3d4a3d] hover:bg-[#eff4ff] rounded text-xs font-medium transition-all">Lap B</button>
                <button className="px-2 py-1 text-[#3d4a3d] hover:bg-[#eff4ff] rounded text-xs font-medium transition-all">Lap C</button>
              </div>
            </div>
            
            <div className="px-6 pb-2">
              <p className="text-xs font-medium text-[#3d4a3d] uppercase tracking-wider">Selasa, 12 Okt</p>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[500px] px-6 pb-6 flex flex-col gap-2">
              
              <div className="flex gap-4 group">
                <div className="w-12 text-right text-sm font-semibold tracking-wide text-[#3d4a3d] pt-2">08:00</div>
                <div className="flex-1 bg-[#eff4ff] hover:bg-[#e5eeff] transition-colors rounded-lg p-4 flex justify-between items-center cursor-pointer border border-transparent hover:border-[#bccbb9]/30">
                  <span className="text-sm font-semibold tracking-wide text-[#006e2f]">Tersedia</span>
                  <span className="material-symbols-outlined text-[#3d4a3d] opacity-0 group-hover:opacity-100 transition-opacity">add</span>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-12 text-right text-sm font-semibold tracking-wide text-[#3d4a3d] pt-2">10:00</div>
                <div className="flex-1 bg-[#e5eeff] hover:bg-[#dce9ff] transition-colors rounded-lg p-4 flex flex-col relative overflow-hidden border-l-4 border-l-[#006e2f] shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold tracking-wide text-[#0b1c30]">Eka Putra</span>
                    <span className="text-xs font-medium bg-[#22c55e] text-[#004b1e] px-2 py-0.5 rounded">Paid</span>
                  </div>
                  <span className="text-sm font-normal text-[#3d4a3d]">2 Jam • Regular</span>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-12 text-right text-sm font-semibold tracking-wide text-[#3d4a3d] pt-2">12:00</div>
                <div className="flex-1 bg-[#eff4ff] hover:bg-[#e5eeff] transition-colors rounded-lg p-4 flex justify-between items-center cursor-pointer border border-transparent hover:border-[#bccbb9]/30">
                  <span className="text-sm font-semibold tracking-wide text-[#006e2f]">Tersedia</span>
                  <span className="material-symbols-outlined text-[#3d4a3d] opacity-0 group-hover:opacity-100 transition-opacity">add</span>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-12 text-right text-sm font-semibold tracking-wide text-[#3d4a3d] pt-2">14:00</div>
                <div className="flex-1 bg-[#eff4ff] hover:bg-[#e5eeff] transition-colors rounded-lg p-4 flex justify-between items-center cursor-pointer border border-transparent hover:border-[#bccbb9]/30">
                  <span className="text-sm font-semibold tracking-wide text-[#006e2f]">Tersedia</span>
                  <span className="material-symbols-outlined text-[#3d4a3d] opacity-0 group-hover:opacity-100 transition-opacity">add</span>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-12 text-right text-sm font-semibold tracking-wide text-[#3d4a3d] pt-2">16:00</div>
                <div className="flex-1 bg-[#e5eeff] hover:bg-[#dce9ff] transition-colors rounded-lg p-4 flex flex-col relative overflow-hidden border-l-4 border-l-[#565e74] shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold tracking-wide text-[#0b1c30]">Fajar M.</span>
                    <span className="text-xs font-medium bg-[#d3e4fe] text-[#3d4a3d] px-2 py-0.5 rounded">DP</span>
                  </div>
                  <span className="text-sm font-normal text-[#3d4a3d]">2 Jam • Member</span>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-12 text-right text-sm font-semibold tracking-wide text-[#3d4a3d] pt-2">18:00</div>
                <div className="flex-1 bg-[#e5eeff] hover:bg-[#dce9ff] transition-colors rounded-lg p-4 flex flex-col relative overflow-hidden border-l-4 border-l-[#006e2f] shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold tracking-wide text-[#0b1c30]">Andi Saputra</span>
                    <span className="text-xs font-medium bg-[#22c55e] text-[#004b1e] px-2 py-0.5 rounded">Paid</span>
                  </div>
                  <span className="text-sm font-normal text-[#3d4a3d]">2 Jam • Regular</span>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-12 text-right text-sm font-semibold tracking-wide text-[#3d4a3d] pt-2">20:00</div>
                <div className="flex-1 bg-[#e5eeff] hover:bg-[#dce9ff] transition-colors rounded-lg p-4 flex flex-col relative overflow-hidden border-l-4 border-l-[#ba1a1a] shadow-sm opacity-60">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)]"></div>
                  <div className="flex justify-between items-start mb-1 relative z-10">
                    <span className="text-sm font-semibold tracking-wide text-[#0b1c30]">Maintenance</span>
                  </div>
                  <span className="text-sm font-normal text-[#3d4a3d] relative z-10">Pembersihan Lapangan</span>
                </div>
              </div>

            </div>
          </div>

          {/* Banner Upgrade */}
          <div className="bg-[#ffffff] rounded-xl shadow-sm p-6 relative overflow-hidden h-48 flex flex-col justify-center">
            <div className="absolute right-[-40px] bottom-[-40px] opacity-20">
              <span className="material-symbols-outlined text-[150px] text-[#005ac2]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
            </div>
            <h4 className="text-xl font-semibold text-[#0b1c30] relative z-10 w-2/3">Upgrade ke Pro untuk Fitur Liga & Turnamen</h4>
            <button className="mt-4 bg-[#005ac2] text-[#ffffff] px-6 py-2 rounded-lg text-sm font-semibold tracking-wide self-start relative z-10 hover:bg-[#005ac2]/90 transition-colors shadow-md">
              Pelajari Lebih Lanjut
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}