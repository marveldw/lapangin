"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  // Logika di-upgrade: Cek apakah URL persis SAMA, ATAU berawalan kata yang sama (sub-halaman)
  const getMenuClass = (path: string) => {
    const isActive = pathname === path || pathname.startsWith(`${path}/`);
    return isActive 
      ? 'bg-[#22c55e] text-[#004b1e] font-semibold' 
      : 'text-[#3d4a3d] hover:bg-[#eff4ff] hover:text-[#0b1c30]';
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#ffffff] z-50 flex flex-col shadow-[1px_0_8px_rgba(0,0,0,0.02)] border-r border-[#bccbb9]/30">
      
      {/* Logo */}
      <div className="p-6 flex items-center gap-2 mb-8">
  <img alt="Lapangin Logo" className="h-8 w-auto object-contain" src="/logo.png" />
  <span className="text-xl font-semibold text-[#006e2f] tracking-tight">Lapangin</span>
</div>

      {/* Navigasi */}
      <nav className="flex-1 px-4 space-y-1">
        <Link 
          href="/owner/dashboard" 
          className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/dashboard')}`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-sm font-semibold tracking-wide">Dashboard</span>
        </Link>
        <Link 
          href="/owner/lapangan" 
          className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/lapangan')}`}
        >
          <span className="material-symbols-outlined">stadium</span>
          <span className="text-sm font-semibold tracking-wide">Lapangan</span>
        </Link>
        <Link 
          href="/owner/jadwal" 
          className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/jadwal')}`}
        >
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="text-sm font-semibold tracking-wide">Jadwal</span>
        </Link>
        <Link 
          href="/owner/booking" 
          className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/booking')}`}
        >
          <span className="material-symbols-outlined">confirmation_number</span>
          <span className="text-sm font-semibold tracking-wide">Booking</span>
        </Link>
        <Link 
          href="/owner/pendapatan" 
          className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/pendapatan')}`}
        >
          <span className="material-symbols-outlined">payments</span>
          <span className="text-sm font-semibold tracking-wide">Pendapatan</span>
        </Link>
        <Link 
          href="/owner/pelanggan" 
          className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/pelanggan')}`}
        >
          <span className="material-symbols-outlined">group</span>
          <span className="text-sm font-semibold tracking-wide">Pelanggan</span>
        </Link>
        <Link 
          href="/owner/pengaturan" 
          className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/pengaturan')}`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-semibold tracking-wide">Pengaturan</span>
        </Link>
      </nav>

      {/* Upgrade */}
      <div className="p-6 mt-auto">
        <div className="bg-[#dce9ff] rounded-xl p-4">
          <p className="text-xs font-medium text-[#3d4a3d] mb-1">Plan: Pro Elite</p>
          <button className="w-full bg-[#006e2f] text-[#ffffff] py-1.5 rounded-lg text-sm font-semibold tracking-wide hover:bg-[#006e2f]/90 transition-colors">Upgrade Plan</button>
        </div>
      </div>
    </aside>
  );
}