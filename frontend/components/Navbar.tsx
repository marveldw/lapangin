'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, token, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#f4f6fa]/95 backdrop-blur-md border-b border-gray-200/50 shadow-xs">
      <div className="h-16 max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* KIRI: Logo & Brand Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-gray-200 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="Lapangin Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-[19px] font-extrabold text-[#0b1c30] tracking-tight">
            Lapangin
          </span>
        </Link>

        {/* TENGAH: Menu Navigasi */}
        <nav className="hidden md:flex items-center gap-9">
          <Link
            href="/"
            className={`text-[14px] transition-colors ${
              isActive('/') ? 'font-bold text-[#0b1c30]' : 'font-medium text-slate-600 hover:text-[#0b1c30]'
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/lapangan"
            className={`text-[14px] transition-colors ${
              isActive('/lapangan') ? 'font-bold text-[#0b1c30]' : 'font-medium text-slate-600 hover:text-[#0b1c30]'
            }`}
          >
            Sewa Lapangan
          </Link>
          <Link
            href="/partner"
            className={`text-[14px] transition-colors ${
              isActive('/partner') ? 'font-bold text-[#0b1c30]' : 'font-medium text-slate-600 hover:text-[#0b1c30]'
            }`}
          >
            Partner With Us
          </Link>

          {/* Menu Dinamis: Hanya Muncul Jika User Biasa Login */}
          {user && user.role !== 'OWNER' && (
            <Link
              href="/customer/booking"
              className={`text-[14px] transition-colors ${
                isActive('/customer/booking') ? 'font-bold text-[#0b1c30]' : 'font-medium text-slate-600 hover:text-[#0b1c30]'
              }`}
            >
              Booking Saya
            </Link>
          )}

          {/* Menu Dinamis: Hanya Muncul Jika Role OWNER Login */}
          {user?.role === 'OWNER' && (
            <Link
              href="/owner/dashboard"
              className="text-[13px] font-bold text-[#0b1c30] bg-[#e2e8f0] px-3.5 py-1.5 rounded-full hover:bg-slate-300 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">dashboard</span>
              Owner Portal
            </Link>
          )}
        </nav>

        {/* KANAN: Status Login / Profil Terintegrasi useAuth */}
        <div className="flex items-center gap-5">
          {token && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-[#0b1c30] leading-tight">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase">{user.role}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#0b1c30] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                type="button"
                onClick={() => logout()}
                title="Keluar"
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-5">
              <Link
                href="/login"
                className="text-[14px] font-semibold text-slate-700 hover:text-[#0b1c30] transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-[#0b1c30] hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-full text-[14px] transition-all shadow-sm"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}