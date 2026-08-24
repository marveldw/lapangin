"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function BookingPage() {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const toggleFilter = (filterName: string) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  return (
    <div className="flex flex-col w-full h-full pb-12" onClick={() => setOpenFilter(null)}>
      
      {/* Header & Controls */}
      <div className="flex flex-col gap-6 mb-8 animate-fade-in-up">
        <div className="flex items-end justify-between gap-8 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#0b1c30]">Manajemen Booking</h1>
            <p className="text-[#3d4a3d] max-w-2xl text-base">Kelola dan pantau seluruh reservasi lapangan Anda.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/owner/booking/tambah" className="bg-[#006e2f] text-[#ffffff] font-semibold text-sm px-6 py-2.5 rounded-lg flex items-center gap-2 hover:-translate-y-0.5 transition-transform shadow-md hover:shadow-lg w-fit">
  <span className="material-symbols-outlined text-[20px]">add</span>
  Buat Booking Manual
</Link>
            <button className="bg-[#ffffff] text-[#006e2f] border border-[#bccbb9]/50 font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#eff4ff] transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[20px]">download</span>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#ffffff] rounded-xl shadow-sm border border-[#bccbb9]/30 flex-1 flex flex-col overflow-hidden animate-fade-in-up [animation-delay:100ms]">
        
        {/* Toolbar: Search & Filter */}
        <div className="p-6 bg-[#ffffff] flex flex-wrap items-center gap-4 border-b border-[#bccbb9]/30 sticky top-0 z-10">
          
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3d4a3d]/50">search</span>
            <input 
              className="w-full pl-12 pr-4 py-2.5 bg-[#f8f9ff] rounded-lg text-[#0b1c30] text-sm placeholder:text-[#3d4a3d]/50 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/50 transition-shadow border border-transparent focus:border-transparent" 
              placeholder="Cari nama pelanggan atau ID booking..." 
              type="text"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            
            {/* Filter Waktu */}
            <div className="relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleFilter('waktu'); }}>
              <div className="flex items-center gap-2 bg-[#f8f9ff] px-4 py-2.5 rounded-lg hover:bg-[#e5eeff] transition-colors border border-[#bccbb9]/20">
                <span className="material-symbols-outlined text-[20px] text-[#3d4a3d]">calendar_today</span>
                <span className="font-semibold text-sm text-[#0b1c30]">Bulan Ini</span>
                <span className={`material-symbols-outlined text-[20px] text-[#3d4a3d] transition-transform ${openFilter === 'waktu' ? 'rotate-180' : ''}`}>expand_more</span>
              </div>
              
              {openFilter === 'waktu' && (
                <div className="absolute right-0 top-full mt-2 bg-[#ffffff] rounded-lg shadow-xl py-2 w-48 z-20 border border-[#bccbb9]/20">
                  <button className="w-full text-left px-6 py-2 hover:bg-[#e5eeff] text-sm text-[#0b1c30]">Hari Ini</button>
                  <button className="w-full text-left px-6 py-2 hover:bg-[#e5eeff] text-sm text-[#0b1c30]">Minggu Ini</button>
                  <button className="w-full text-left px-6 py-2 bg-[#22c55e]/10 text-[#006e2f] font-semibold text-sm">Bulan Ini</button>
                  <button className="w-full text-left px-6 py-2 hover:bg-[#e5eeff] text-sm text-[#0b1c30]">Semua Waktu</button>
                </div>
              )}
            </div>

            {/* Filter Status */}
            <div className="relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleFilter('status'); }}>
              <div className="flex items-center gap-2 bg-[#f8f9ff] px-4 py-2.5 rounded-lg hover:bg-[#e5eeff] transition-colors border border-[#bccbb9]/20">
                <span className="material-symbols-outlined text-[20px] text-[#3d4a3d]">filter_list</span>
                <span className="font-semibold text-sm text-[#0b1c30]">Semua Status</span>
                <span className={`material-symbols-outlined text-[20px] text-[#3d4a3d] transition-transform ${openFilter === 'status' ? 'rotate-180' : ''}`}>expand_more</span>
              </div>
              
              {openFilter === 'status' && (
                <div className="absolute right-0 top-full mt-2 bg-[#ffffff] rounded-lg shadow-xl py-2 w-48 z-20 border border-[#bccbb9]/20">
                  <button className="w-full text-left px-6 py-2 bg-[#22c55e]/10 text-[#006e2f] font-semibold text-sm">Semua Status</button>
                  <button className="w-full text-left px-6 py-2 hover:bg-[#e5eeff] text-sm text-[#0b1c30] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#006e2f]"></span> Confirmed
                  </button>
                  <button className="w-full text-left px-6 py-2 hover:bg-[#e5eeff] text-sm text-[#0b1c30] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Pending
                  </button>
                  <button className="w-full text-left px-6 py-2 hover:bg-[#e5eeff] text-sm text-[#0b1c30] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span> Cancelled
                  </button>
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#bccbb9]/30 bg-[#f8f9ff]/50">
                <th className="p-4 font-semibold text-sm text-[#3d4a3d] whitespace-nowrap pl-6">Booking ID</th>
                <th className="p-4 font-semibold text-sm text-[#3d4a3d] whitespace-nowrap">Pelanggan</th>
                <th className="p-4 font-semibold text-sm text-[#3d4a3d] whitespace-nowrap">Lapangan</th>
                <th className="p-4 font-semibold text-sm text-[#3d4a3d] whitespace-nowrap">Jadwal</th>
                <th className="p-4 font-semibold text-sm text-[#3d4a3d] whitespace-nowrap text-right">Total Harga</th>
                <th className="p-4 font-semibold text-sm text-[#3d4a3d] whitespace-nowrap text-center">Status</th>
                <th className="p-4 font-semibold text-sm text-[#3d4a3d] whitespace-nowrap text-right pr-6">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#0b1c30]">
              
              {/* Row 1 - Confirmed */}
              <tr className="border-b border-[#bccbb9]/10 hover:bg-[#f8f9ff] transition-colors group cursor-pointer">
                <td className="p-4 pl-6 font-semibold">#BK-1045</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#22c55e] text-white flex items-center justify-center font-bold text-xs shrink-0">AS</div>
                    <span className="truncate font-medium">Andi Saputra</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium">Lapangan A</span>
                    <span className="text-xs text-[#3d4a3d]">Futsal Vinyl</span>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-medium">12 Okt 2023</span>
                    <span className="text-xs text-[#3d4a3d]">18:00 - 20:00 (2 Jam)</span>
                  </div>
                </td>
                <td className="p-4 text-right font-bold">Rp 300.000</td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#22c55e]/10 text-[#006e2f] text-xs font-bold border border-[#22c55e]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f] mr-2"></span> Confirmed
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded-full hover:bg-[#e5eeff] flex items-center justify-center text-[#3d4a3d] transition-colors" title="Lihat Detail">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    <button className="w-8 h-8 rounded-full hover:bg-[#e5eeff] flex items-center justify-center text-[#3d4a3d] transition-colors" title="Edit">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 2 - Pending */}
              <tr className="border-b border-[#bccbb9]/10 hover:bg-[#f8f9ff] transition-colors group cursor-pointer">
                <td className="p-4 pl-6 font-semibold">#BK-1046</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#dce9ff] text-[#001a42] flex items-center justify-center font-bold text-xs shrink-0">DR</div>
                    <span className="truncate font-medium">Deni Ramadhan</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium">Lapangan C</span>
                    <span className="text-xs text-[#3d4a3d]">Badminton</span>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-medium">12 Okt 2023</span>
                    <span className="text-xs text-[#3d4a3d]">19:00 - 21:00 (2 Jam)</span>
                  </div>
                </td>
                <td className="p-4 text-right font-bold">Rp 150.000</td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-2"></span> Pending
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded-full bg-[#006e2f]/10 hover:bg-[#006e2f]/20 flex items-center justify-center text-[#006e2f] transition-colors" title="Konfirmasi Pembayaran">
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </button>
                    <button className="w-8 h-8 rounded-full hover:bg-[#e5eeff] flex items-center justify-center text-[#3d4a3d] transition-colors" title="Lihat Detail">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 3 - Confirmed */}
              <tr className="border-b border-[#bccbb9]/10 hover:bg-[#f8f9ff] transition-colors group cursor-pointer">
                <td className="p-4 pl-6 font-semibold">#BK-1047</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#82abff] text-[#001a42] flex items-center justify-center font-bold text-xs shrink-0">MK</div>
                    <span className="truncate font-medium">PT. Maju Karya</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium">Lapangan A</span>
                    <span className="text-xs text-[#3d4a3d]">Futsal Vinyl</span>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-medium">13 Okt 2023</span>
                    <span className="text-xs text-[#3d4a3d]">20:00 - 22:00 (2 Jam)</span>
                  </div>
                </td>
                <td className="p-4 text-right font-bold">Rp 300.000</td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#22c55e]/10 text-[#006e2f] text-xs font-bold border border-[#22c55e]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f] mr-2"></span> Confirmed
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded-full hover:bg-[#e5eeff] flex items-center justify-center text-[#3d4a3d] transition-colors" title="Lihat Detail">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    <button className="w-8 h-8 rounded-full hover:bg-[#e5eeff] flex items-center justify-center text-[#3d4a3d] transition-colors" title="Edit">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 4 - Cancelled */}
              <tr className="border-b border-[#bccbb9]/10 hover:bg-[#f8f9ff] transition-colors group cursor-pointer">
                <td className="p-4 pl-6 font-semibold">#BK-1048</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#bccbb9]/30" alt="Budi Santoso" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmMneZ-b3pG6bB7D5zHUvkSm4xxeufWEpRFUbnFI6C8mkkU-0-HWGJsMKUT95qFEJBymTTq2UTTiuFAuvpNC-42W9HgCAbXNKztStsssQUWu-eLjIv_EwI5KD6j9f00GMEJF4_7saFcyyCJs2JI5lc0efVgYj9vD0FO7gJXFfJWeFewZM9ik9UM-sdwRjLlsttAIGCciuJ8kE0EbHknQIguP29rIcOgELv9FEWXDQ3i75PbZTn1GOfYA"/>
                    <span className="truncate font-medium">Budi Santoso</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium">Lapangan B</span>
                    <span className="text-xs text-[#3d4a3d]">Basket Semi-Indoor</span>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-medium">13 Okt 2023</span>
                    <span className="text-xs text-[#3d4a3d]">15:00 - 17:00 (2 Jam)</span>
                  </div>
                </td>
                <td className="p-4 text-right font-bold">Rp 250.000</td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffdad6]/50 text-[#ba1a1a] text-xs font-bold border border-[#ffdad6]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] mr-2"></span> Cancelled
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded-full hover:bg-[#e5eeff] flex items-center justify-center text-[#3d4a3d] transition-colors" title="Lihat Detail">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#bccbb9]/30 bg-[#f8f9ff] flex items-center justify-between">
          <p className="text-xs font-medium text-[#3d4a3d]">Menampilkan 1-4 dari 45 booking</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded hover:bg-[#e5eeff] flex items-center justify-center text-[#3d4a3d] opacity-50 cursor-not-allowed transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded bg-[#006e2f] text-white flex items-center justify-center font-bold text-sm shadow-sm">1</button>
            <button className="w-8 h-8 rounded hover:bg-[#e5eeff] flex items-center justify-center text-[#0b1c30] font-semibold text-sm transition-colors">2</button>
            <button className="w-8 h-8 rounded hover:bg-[#e5eeff] flex items-center justify-center text-[#0b1c30] font-semibold text-sm transition-colors">3</button>
            <span className="px-2 text-[#3d4a3d] font-bold">...</span>
            <button className="w-8 h-8 rounded hover:bg-[#e5eeff] flex items-center justify-center text-[#3d4a3d] transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}