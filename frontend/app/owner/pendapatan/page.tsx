export default function PendapatanPage() {
  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0b1c30]">Laporan Pendapatan</h1>
          <p className="text-[#3d4a3d] mt-1">Pantau performa bisnis dan transaksi terkini.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#e5eeff] text-[#0b1c30] hover:bg-[#dce9ff] transition-colors shadow-sm font-semibold text-sm">
          <span>Bulan Ini</span>
          <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </button>
      </div>

      {/* 3 Cards Ringkasan - SUDAH SAMA PERSIS WARNANYA DENGAN DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="bg-[#e5eeff] rounded-xl p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#006e2f]/10 rounded-full blur-xl group-hover:bg-[#006e2f]/20 transition-colors"></div>
          <div>
            <p className="font-semibold text-xs text-[#3d4a3d] uppercase tracking-wider">Pendapatan Hari Ini</p>
            <h2 className="text-3xl font-bold text-[#0b1c30] mt-2">Rp 750.000</h2>
          </div>
          <div className="flex items-center gap-1 mt-4 bg-[#22c55e]/10 text-[#006e2f] px-2.5 py-1 rounded-full w-fit">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span className="font-bold text-xs">+5% dari kemarin</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#e5eeff] rounded-xl p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#005ac2]/10 rounded-full blur-xl group-hover:bg-[#005ac2]/20 transition-colors"></div>
          <div>
            <p className="font-semibold text-xs text-[#3d4a3d] uppercase tracking-wider">Pendapatan Bulan Ini</p>
            <h2 className="text-3xl font-bold text-[#0b1c30] mt-2">Rp 12.500.000</h2>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[#3d4a3d] opacity-80">
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            <span className="font-medium text-xs">Estimasi penarikan tgl 25</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#e5eeff] rounded-xl p-6 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#565e74]/10 rounded-full blur-xl group-hover:bg-[#565e74]/20 transition-colors"></div>
          <div>
            <p className="font-semibold text-xs text-[#3d4a3d] uppercase tracking-wider">Total Booking Sukses</p>
            <h2 className="text-3xl font-bold text-[#0b1c30] mt-2">124 Booking</h2>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[#3d4a3d] opacity-80">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span className="font-medium text-xs">Bulan ini</span>
          </div>
        </div>
      </div>

      {/* Grafik Tren Pendapatan */}
      <div className="bg-[#ffffff] border border-[#bccbb9]/30 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#0b1c30]">Tren Pendapatan</h3>
          <span className="font-semibold text-xs text-[#3d4a3d] bg-[#f8f9ff] border border-[#bccbb9]/50 px-3 py-1.5 rounded-full">30 Hari Terakhir</span>
        </div>
        
        <div className="w-full h-[300px] relative">
          {/* Grafik SVG */}
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
            <defs>
              <linearGradient id="gradientLine" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#006e2f" stopOpacity="0.2"></stop>
                <stop offset="100%" stopColor="#006e2f" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            <path d="M0,300 L0,250 C100,220 200,280 300,200 C400,120 500,180 600,150 C700,120 800,80 900,100 L1000,60 L1000,300 Z" fill="url(#gradientLine)"></path>
            <path className="text-[#006e2f]" d="M0,250 C100,220 200,280 300,200 C400,120 500,180 600,150 C700,120 800,80 900,100 L1000,60" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
            
            {/* Titik-titik (Dots) pada grafik */}
            <circle className="text-[#006e2f]" cx="300" cy="200" fill="#ffffff" r="5" stroke="currentColor" strokeWidth="3"></circle>
            <circle className="text-[#006e2f]" cx="600" cy="150" fill="#ffffff" r="5" stroke="currentColor" strokeWidth="3"></circle>
            <circle className="text-[#006e2f]" cx="900" cy="100" fill="#ffffff" r="5" stroke="currentColor" strokeWidth="3"></circle>
          </svg>
          
          {/* Label Tanggal Bawah */}
          <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 pt-3 border-t border-[#bccbb9]/30 font-semibold text-xs text-[#3d4a3d]">
            <span>1 Nov</span>
            <span>10 Nov</span>
            <span>20 Nov</span>
            <span>30 Nov</span>
          </div>
        </div>
      </div>

      {/* Tabel Transaksi Terakhir */}
      <div className="bg-[#ffffff] border border-[#bccbb9]/30 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 flex items-center justify-between border-b border-[#bccbb9]/20">
          <h3 className="text-xl font-bold text-[#0b1c30]">Transaksi Terakhir</h3>
          <button className="font-bold text-sm text-[#006e2f] hover:text-[#005321] transition-colors">Lihat Semua</button>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-[#0b1c30]">
            <thead className="bg-[#f8f9ff] font-semibold text-[#3d4a3d] border-b border-[#bccbb9]/30">
              <tr>
                <th className="py-3 px-6 font-semibold">ID Booking</th>
                <th className="py-3 px-6 font-semibold">Tanggal</th>
                <th className="py-3 px-6 font-semibold">Nama Pelanggan</th>
                <th className="py-3 px-6 font-semibold text-right">Total Bayar (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bccbb9]/20">
              <tr className="hover:bg-[#f8f9ff]/50 transition-colors group cursor-pointer">
                <td className="py-4 px-6 font-mono text-sm font-medium text-[#3d4a3d] group-hover:text-[#006e2f] transition-colors">#BK-9201</td>
                <td className="py-4 px-6">24 Nov 2023, 19:00</td>
                <td className="py-4 px-6 font-medium">Ahmad Reza</td>
                <td className="py-4 px-6 text-right font-bold">150.000</td>
              </tr>
              <tr className="hover:bg-[#f8f9ff]/50 transition-colors group cursor-pointer">
                <td className="py-4 px-6 font-mono text-sm font-medium text-[#3d4a3d] group-hover:text-[#006e2f] transition-colors">#BK-9200</td>
                <td className="py-4 px-6">24 Nov 2023, 16:00</td>
                <td className="py-4 px-6 font-medium">Budi Prakoso</td>
                <td className="py-4 px-6 text-right font-bold">120.000</td>
              </tr>
              <tr className="hover:bg-[#f8f9ff]/50 transition-colors group cursor-pointer">
                <td className="py-4 px-6 font-mono text-sm font-medium text-[#3d4a3d] group-hover:text-[#006e2f] transition-colors">#BK-9199</td>
                <td className="py-4 px-6">23 Nov 2023, 20:00</td>
                <td className="py-4 px-6 font-medium">Tim Futsal JKT</td>
                <td className="py-4 px-6 text-right font-bold">200.000</td>
              </tr>
              <tr className="hover:bg-[#f8f9ff]/50 transition-colors group cursor-pointer">
                <td className="py-4 px-6 font-mono text-sm font-medium text-[#3d4a3d] group-hover:text-[#006e2f] transition-colors">#BK-9198</td>
                <td className="py-4 px-6">23 Nov 2023, 08:00</td>
                <td className="py-4 px-6 font-medium">Citra Kirana</td>
                <td className="py-4 px-6 text-right font-bold">100.000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}