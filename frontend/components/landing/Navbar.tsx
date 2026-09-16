'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#f4f6fa]/95 backdrop-blur-md border-b border-gray-200/60 shadow-xs">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
        
        {/* KIRI: Logo & Brand Name (Simpler, lighter-weight logo text) */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-gray-200 flex items-center justify-center p-1 transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="Lapangin Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-[18px] font-semibold text-slate-800 tracking-normal antialiased">
            Lapangin
          </span>
        </Link>

        {/* TENGAH: Menu Navigasi Desktop */}
        <nav className="hidden md:flex items-center gap-8">
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
            Gabung Mitra
          </Link>

          {/* Menu Dinamis: Customer Booking */}
          {user && (
            <Link
              href="/customer/booking"
              className={`text-[14px] transition-colors ${
                isActive('/customer/booking') ? 'font-bold text-[#0b1c30]' : 'font-medium text-slate-600 hover:text-[#0b1c30]'
              }`}
            >
              Booking Saya
            </Link>
          )}

          {/* Dual-Role: Owner Portal Switch */}
          {user?.role === 'OWNER' && (
            <Link
              href="/owner/dashboard"
              className="text-[13px] font-bold text-white bg-[#006e2f] px-3.5 py-1.5 rounded-full hover:bg-[#005321] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">dashboard</span>
              Portal Pengelola
            </Link>
          )}
        </nav>

        {/* KANAN: Status Login & Tombol Hamburger Mobile */}
        <div className="flex items-center gap-3">
          {token && user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-[#0b1c30] leading-tight">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase">
                  {user.role === 'OWNER' ? 'Pengelola Venue' : 'Penyewa'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0b1c30] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                type="button"
                onClick={() => logout()}
                title="Keluar"
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-[14px] font-semibold text-slate-700 hover:text-[#0b1c30] transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-[#0b1c30] hover:bg-slate-800 text-white font-semibold px-5 py-2 rounded-full text-[13px] transition-all shadow-xs"
              >
                Daftar
              </Link>
            </div>
          )}

          {/* Tombol Hamburger Khusus Mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Buka Menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

      </div>

      {/* Drawer Menu Navigasi Mobile (Tampil jika dibuka) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm py-1.5 font-medium ${isActive('/') ? 'text-[#006e2f] font-bold' : 'text-slate-700'}`}
          >
            Beranda
          </Link>
          <Link
            href="/lapangan"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm py-1.5 font-medium ${isActive('/lapangan') ? 'text-[#006e2f] font-bold' : 'text-slate-700'}`}
          >
            Sewa Lapangan
          </Link>
          <Link
            href="/partner"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm py-1.5 font-medium ${isActive('/partner') ? 'text-[#006e2f] font-bold' : 'text-slate-700'}`}
          >
            Gabung Mitra
          </Link>

          {user && (
            <Link
              href="/customer/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm py-1.5 font-medium text-slate-700"
            >
              Booking Saya
            </Link>
          )}

          {user?.role === 'OWNER' && (
            <Link
              href="/owner/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm py-2 font-bold text-white bg-[#006e2f] rounded-xl px-4 text-center mt-1"
            >
              Portal Pengelola
            </Link>
          )}

          {!token && (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-slate-800 bg-slate-100 rounded-xl"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-white bg-[#0b1c30] rounded-xl"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}