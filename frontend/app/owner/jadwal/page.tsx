"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function JadwalLapangan() {
  // State buat ngatur popover mana yang lagi kebuka pas jadwal diklik
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const togglePopover = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePopover(activePopover === id ? null : id);
  };

  // Nutup popover kalau klik sembarang tempat di luar kotak
  const closePopover = () => {
    setActivePopover(null);
  };

  return (
    <div className="flex flex-col w-full" onClick={closePopover}>
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0b1c30] mb-2">Jadwal Lapangan</h1>
          <p className="text-[#3d4a3d]">Kelola ketersediaan dan lihat pemesanan aktif.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button className="bg-[#e5eeff] flex items-center gap-2 px-4 py-2 rounded-lg text-[#0b1c30] hover:bg-[#dce9ff] transition-colors font-semibold text-sm">
            <span className="material-symbols-outlined text-[20px]">today</span>
            Hari Ini
          </button>
          
          <div className="flex bg-[#e5eeff] rounded-lg p-1">
            <button className="px-2 py-1 rounded hover:bg-[#dce9ff] text-[#0b1c30] transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <div className="px-4 py-1 flex items-center justify-center min-w-[140px] font-semibold text-sm text-[#0b1c30]">
              12 Okt 2023
            </div>
            <button className="px-2 py-1 rounded hover:bg-[#dce9ff] text-[#0b1c30] transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
          
          <Link 
            href="/owner/booking" 
            className="bg-[#006e2f] flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:bg-[#005321] transition-colors shadow-sm font-semibold text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Booking Baru
          </Link>
        </div>
      </div>

      {/* Tabs Lapangan */}
      <div className="bg-[#ffffff] rounded-xl shadow-sm mb-6 overflow-hidden border border-[#bccbb9]/20">
        <div className="flex overflow-x-auto">
          <button className="flex-1 min-w-[120px] py-4 border-b-2 border-[#006e2f] text-[#006e2f] font-semibold text-sm text-center transition-colors">
            Lapangan 1
          </button>
          <button className="flex-1 min-w-[120px] py-4 border-b-2 border-transparent text-[#3d4a3d] hover:bg-[#eff4ff] hover:text-[#0b1c30] font-semibold text-sm text-center transition-colors">
            Lapangan 2
          </button>
          <button className="flex-1 min-w-[120px] py-4 border-b-2 border-transparent text-[#3d4a3d] hover:bg-[#eff4ff] hover:text-[#0b1c30] font-semibold text-sm text-center transition-colors">
            Lapangan 3
          </button>
          <button className="flex-1 min-w-[120px] py-4 border-b-2 border-transparent text-[#3d4a3d] hover:bg-[#eff4ff] hover:text-[#0b1c30] font-semibold text-sm text-center transition-colors">
            VIP Futsal
          </button>
        </div>
      </div>

      {/* Timeline Jadwal */}
      <div className="bg-[#ffffff] rounded-xl shadow-sm p-6 relative overflow-hidden border border-[#bccbb9]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#006e2f]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="flex gap-6">
          {/* Sisi Kiri: Jam */}
          <div className="w-16 flex flex-col pt-[44px]">
            <div className="h-20 flex items-center justify-end pr-4 text-xs font-medium text-[#3d4a3d]">08:00</div>
            <div className="h-20 flex items-center justify-end pr-4 text-xs font-medium text-[#3d4a3d]">09:00</div>
            <div className="h-20 flex items-center justify-end pr-4 text-xs font-medium text-[#3d4a3d]">10:00</div>
            <div className="h-20 flex items-center justify-end pr-4 text-xs font-medium text-[#3d4a3d]">11:00</div>
            <div className="h-20 flex items-center justify-end pr-4 text-xs font-medium text-[#3d4a3d]">12:00</div>
            <div className="h-20 flex items-center justify-end pr-4 text-xs font-medium text-[#3d4a3d]">13:00</div>
          </div>
          
          {/* Sisi Kanan: Garis dan Event */}
          <div className="flex-1 relative border-l border-[#bccbb9]/30 pl-6">
            
            {/* Garis-garis grid */}
            <div className="absolute left-6 right-0 top-[44px] bottom-0 flex flex-col pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 border-t border-[#bccbb9]/20 w-full relative">
                  <div className="absolute -left-[30px] top-0 w-2 h-px bg-[#bccbb9]/50"></div>
                </div>
              ))}
            </div>
            
            {/* Legend / Keterangan */}
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-[#ffffff]/90 backdrop-blur-sm z-10 py-2">
              <div className="font-semibold text-sm text-[#0b1c30]">Slot Tersedia vs Terpesan</div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
                  <span className="text-xs font-medium text-[#3d4a3d]">Tersedia</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#dae2fd]"></div>
                  <span className="text-xs font-medium text-[#3d4a3d]">Terpesan</span>
                </div>
              </div>
            </div>
            
            {/* Area Box Jadwal */}
            <div className="relative w-full z-0 h-[480px]">
              
              {/* Event 1: Tim Garuda FC (08:00 - 09:00) */}
              <div 
                className="absolute top-0 left-0 w-full h-20 px-2 py-1 group cursor-pointer" 
                onClick={(e) => togglePopover('popover-1', e)}
              >
                <div className="w-full h-full bg-[#dae2fd] rounded-lg border-l-4 border-[#565e74] p-2 flex flex-col justify-center transition-all hover:shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-[#565e74]/10 to-transparent"></div>
                  <div className="font-semibold text-sm text-[#131b2e] truncate">Tim Garuda FC</div>
                  <div className="text-xs font-medium text-[#565e74] truncate flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    Budi Darmawan • Lunas
                  </div>
                </div>
                
                {/* Popover Event 1 */}
                {activePopover === 'popover-1' && (
                  <div 
                    className="absolute top-0 left-[calc(100%+16px)] w-72 bg-[#ffffff] rounded-xl shadow-xl z-20 flex flex-col p-4 transition-all border border-[#bccbb9]/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-lg text-[#0b1c30]">Tim Garuda FC</div>
                      <button className="text-[#3d4a3d] hover:text-[#ba1a1a]" onClick={() => setActivePopover(null)}>
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[#3d4a3d] text-sm mb-4">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      08:00 - 09:00 (1 Jam)
                    </div>
                    <div className="bg-[#eff4ff] rounded-lg p-3 mb-4 flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-[#dae2fd] flex items-center justify-center text-[#131b2e] font-bold text-sm">BD</div>
                      <div>
                        <div className="font-semibold text-sm text-[#0b1c30]">Budi Darmawan</div>
                        <div className="text-xs font-medium text-[#3d4a3d]">0812-3456-7890</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-medium text-[#3d4a3d]">Status Pembayaran</span>
                      <span className="bg-[#22c55e]/20 text-[#004b1e] px-2 py-1 rounded-full text-xs font-bold">Lunas Rp 150.000</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-[#e5eeff] text-[#0b1c30] font-semibold text-sm py-2 rounded-lg hover:bg-[#dce9ff] transition-colors">Hubungi</button>
                      <button className="flex-1 bg-[#565e74] text-white font-semibold text-sm py-2 rounded-lg hover:bg-[#3f465c] transition-colors">Edit</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Slot Tersedia 1 (09:00 - 10:00) */}
              <div className="absolute top-[80px] left-0 w-full h-20 px-2 py-1 group cursor-pointer transition-transform hover:scale-[1.01]">
                <div className="w-full h-full bg-[#22c55e]/10 rounded-lg border-2 border-dashed border-[#22c55e]/50 hover:border-[#006e2f] p-2 flex items-center justify-center transition-all">
                  <div className="font-semibold text-sm text-[#006e2f] flex items-center gap-2">
                    <span className="material-symbols-outlined">add_circle</span> Tersedia
                  </div>
                </div>
              </div>

              {/* Slot Tersedia 2 (10:00 - 11:00) */}
              <div className="absolute top-[160px] left-0 w-full h-20 px-2 py-1 group cursor-pointer transition-transform hover:scale-[1.01]">
                <div className="w-full h-full bg-[#22c55e]/10 rounded-lg border-2 border-dashed border-[#22c55e]/50 hover:border-[#006e2f] p-2 flex items-center justify-center transition-all">
                  <div className="font-semibold text-sm text-[#006e2f] flex items-center gap-2">
                    <span className="material-symbols-outlined">add_circle</span> Tersedia
                  </div>
                </div>
              </div>

              {/* Event 2: Turnamen Antar Warga (11:00 - 13:00) */}
              <div 
                className="absolute top-[240px] left-0 w-full h-40 px-2 py-1 group cursor-pointer"
                onClick={(e) => togglePopover('popover-2', e)}
              >
                <div className="w-full h-full bg-[#e5eeff] rounded-lg border-l-4 border-[#005ac2] p-3 flex flex-col justify-start transition-all hover:shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-br from-[#005ac2]/5 to-transparent"></div>
                  <div className="font-semibold text-sm text-[#003d88] truncate">Turnamen Antar Warga</div>
                  <div className="text-xs font-medium text-[#005ac2] truncate flex items-center gap-1 mt-1 mb-3">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    Ketua RT 05 • DP 50%
                  </div>
                  <div className="mt-auto flex items-center gap-2">
                    <span className="bg-[#005ac2]/10 text-[#003d88] px-2 py-1 rounded text-xs font-bold inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">timer</span> 2 Jam
                    </span>
                  </div>
                </div>

                {/* Popover Event 2 */}
                {activePopover === 'popover-2' && (
                  <div 
                    className="absolute top-10 left-[calc(100%+16px)] w-72 bg-[#ffffff] rounded-xl shadow-xl z-20 flex flex-col p-4 transition-all border border-[#bccbb9]/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-lg text-[#0b1c30]">Turnamen Antar Warga</div>
                      <button className="text-[#3d4a3d] hover:text-[#ba1a1a]" onClick={() => setActivePopover(null)}>
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[#3d4a3d] text-sm mb-4">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      11:00 - 13:00 (2 Jam)
                    </div>
                    <div className="bg-[#eff4ff] rounded-lg p-3 mb-4 flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-[#82abff] flex items-center justify-center text-[#001a42] font-bold text-sm">RT</div>
                      <div>
                        <div className="font-semibold text-sm text-[#0b1c30]">Agus Setiawan (RT 05)</div>
                        <div className="text-xs font-medium text-[#3d4a3d]">0819-8765-4321</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-medium text-[#3d4a3d]">Status Pembayaran</span>
                      <span className="bg-[#ffdad6] text-[#93000a] px-2 py-1 rounded-full text-xs font-bold">DP Rp 150.000</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-[#e5eeff] text-[#0b1c30] font-semibold text-sm py-2 rounded-lg hover:bg-[#dce9ff] transition-colors">Hubungi</button>
                      <button className="flex-1 bg-[#006e2f] text-white font-semibold text-sm py-2 rounded-lg hover:bg-[#005321] transition-colors">Pelunasan</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Indikator Waktu Saat Ini (Garis Merah 10:15) */}
              <div className="absolute top-[180px] left-0 w-full h-px bg-[#ba1a1a]/50 z-10 flex items-center">
                <div className="absolute -left-[45px] bg-[#ba1a1a] text-white px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm">10:15</div>
                <div className="w-2 h-2 rounded-full bg-[#ba1a1a] -ml-1"></div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Statistik Bawah */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2 pb-12">
        <div className="bg-[#ffffff] rounded-xl p-6 shadow-sm flex items-center gap-4 border border-[#bccbb9]/20">
          <div className="w-12 h-12 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[#006e2f]">
            <span className="material-symbols-outlined text-[24px]">trending_up</span>
          </div>
          <div>
            <div className="text-xs font-medium text-[#3d4a3d] mb-1">Okupansi Hari Ini</div>
            <div className="text-2xl font-bold text-[#0b1c30]">75%</div>
          </div>
        </div>
        
        <div className="bg-[#ffffff] rounded-xl p-6 shadow-sm flex items-center gap-4 border border-[#bccbb9]/20">
          <div className="w-12 h-12 rounded-full bg-[#dae2fd] flex items-center justify-center text-[#565e74]">
            <span className="material-symbols-outlined text-[24px]">payments</span>
          </div>
          <div>
            <div className="text-xs font-medium text-[#3d4a3d] mb-1">Estimasi Pendapatan</div>
            <div className="text-2xl font-bold text-[#0b1c30]">Rp 1.250.000</div>
          </div>
        </div>
        
        <div className="bg-[#ffffff] rounded-xl p-6 shadow-sm flex items-center gap-4 border border-[#bccbb9]/20">
          <div className="w-12 h-12 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <div>
            <div className="text-xs font-medium text-[#3d4a3d] mb-1">Belum Lunas</div>
            <div className="text-2xl font-bold text-[#0b1c30]">2 Booking</div>
          </div>
        </div>
      </div>
      
    </div>
  );
}