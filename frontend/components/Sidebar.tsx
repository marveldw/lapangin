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
  const { user, logout } = useAuth();

  const getMenuClass = (path: string) => {
    const isActive = pathname === path || pathname.startsWith(`${path}/`);
    return isActive 
      ? 'bg-[#22c55e] text-[#004b1e] font-semibold' 
      : 'text-[#3d4a3d] hover:bg-[#eff4ff] hover:text-[#0b1c30]';
  };

  const planName = user?.subscription?.plan_name || 'FREE';

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
            <span className="text-sm font-semibold tracking-wide">Dashboard</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/owner/lapangan" className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/lapangan')}`}>
            <span className="material-symbols-outlined">stadium</span>
            <span className="text-sm font-semibold tracking-wide">Lapangan</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/owner/jadwal" className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/jadwal')}`}>
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="text-sm font-semibold tracking-wide">Jadwal</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/owner/booking" className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/booking')}`}>
            <span className="material-symbols-outlined">confirmation_number</span>
            <span className="text-sm font-semibold tracking-wide">Booking</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/owner/pendapatan" className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/pendapatan')}`}>
            <span className="material-symbols-outlined">payments</span>
            <span className="text-sm font-semibold tracking-wide">Pendapatan</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/owner/pelanggan" className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/pelanggan')}`}>
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-semibold tracking-wide">Pelanggan</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/owner/pengaturan" className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 ${getMenuClass('/owner/pengaturan')}`}>
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-semibold tracking-wide">Pengaturan</span>
          </Link>
        </nav>

        {/* Area Bawah: Upgrade & Logout */}
        <div className="p-6 mt-auto border-t border-[#bccbb9]/20 flex flex-col gap-4 bg-[#f8f9ff]/50">
          <div className="bg-[#dce9ff] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#3d4a3d] mb-1">Paket: {planName}</p>
            <Link
              href="/owner/pengaturan"
              className="block text-center w-full bg-[#006e2f] text-[#ffffff] py-1.5 rounded-lg text-xs font-semibold tracking-wide hover:bg-[#006e2f]/90 transition-colors"
            >
              Kelola Langganan
            </Link>
          </div>
          
          <button 
            onClick={() => logout()}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6] font-bold text-sm transition-all duration-200 cursor-pointer shadow-sm border border-[#ba1a1a]/20"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
}