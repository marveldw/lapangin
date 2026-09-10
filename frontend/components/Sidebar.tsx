"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getMenuClass = (path: string) => {
    const isActive = pathname === path || pathname.startsWith(`${path}/`);
    return isActive 
      ? 'bg-[#006e2f] text-white font-semibold shadow-sm' 
      : 'text-[#3d4a3d] hover:bg-[#eff4ff] hover:text-[#0b1c30]';
  };

  const planName = (
    user?.subscription?.plan_name || 
    (user as any)?.plan || 
    'FREE'
  ).toUpperCase();

  return (
    <>
      {/* Overlay Gelap Khusus Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside className={`fixed left-0 top-0 h-full w-72 bg-[#ffffff] z-50 flex flex-col shadow-[1px_0_8px_rgba(0,0,0,0.02)] border-r border-[#bccbb9]/30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Logo & Tombol Close (Mobile) */}
        <div className="p-6 flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img alt="Lapangin Logo" className="h-8 w-auto object-contain" src="/logo.png" />
            <span className="text-xl font-semibold text-[#006e2f] tracking-tight">Lapangin</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-lg text-[#3d4a3d] hover:bg-[#eff4ff] cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigasi Utama */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-none pb-4">
          <Link onClick={() => setIsOpen(false)} href="/owner/dashboard" className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/dashboard')}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm tracking-wide">Dashboard</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/owner/lapangan" className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/lapangan')}`}>
            <span className="material-symbols-outlined">stadium</span>
            <span className="text-sm tracking-wide">Lapangan</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/owner/jadwal" className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/jadwal')}`}>
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="text-sm tracking-wide">Jadwal</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/owner/booking" className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/booking')}`}>
            <span className="material-symbols-outlined">confirmation_number</span>
            <span className="text-sm tracking-wide">Booking</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/owner/pendapatan" className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/pendapatan')}`}>
            <span className="material-symbols-outlined">payments</span>
            <span className="text-sm tracking-wide">Pendapatan</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/owner/pelanggan" className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/pelanggan')}`}>
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm tracking-wide">Pelanggan</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/owner/pengaturan" className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/pengaturan')}`}>
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm tracking-wide">Pengaturan</span>
          </Link>
        </nav>

        {/* Area Bawah: Upgrade Dinamis */}
        <div className="p-6 mt-auto border-t border-[#bccbb9]/20 flex flex-col gap-4 bg-[#f8f9ff]/50">
          <div className="p-3 bg-[#e5eeff] rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#3d4a3d]">Paket Anda:</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                planName === 'PRO' 
                  ? 'bg-amber-100 text-amber-800' 
                  : planName === 'BASIC' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {planName}
              </span>
            </div>

            <Link
              href="/owner/pengaturan"
              className="w-full py-1.5 mt-1 bg-[#006e2f] hover:bg-[#005321] text-white text-center rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              Kelola Langganan
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}