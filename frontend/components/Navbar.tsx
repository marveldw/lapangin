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
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-[#bccbb9]/30">
      <div className="h-16 w-full px-4 sm:px-6 md:px-12 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Lapangin Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-[#006e2f] tracking-tight">Lapangin</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-[#006e2f]' : 'text-[#3d4a3d] hover:text-[#006e2f]'
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/lapangan"
              className={`text-sm font-semibold transition-colors ${
                isActive('/lapangan') ? 'text-[#006e2f]' : 'text-[#3d4a3d] hover:text-[#006e2f]'
              }`}
            >
              Cari Lapangan
            </Link>
            {user && user.role !== 'OWNER' && (
              <Link
                href="/customer/booking"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/customer/booking') ? 'text-[#006e2f]' : 'text-[#3d4a3d] hover:text-[#006e2f]'
                }`}
              >
                Booking Saya
              </Link>
            )}
            {user?.role === 'OWNER' && (
              <Link
                href="/owner/dashboard"
                className="text-sm font-bold text-[#006e2f] bg-[#e5eeff] px-3 py-1 rounded-lg hover:bg-[#d0e4ff] transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                Owner Portal
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {token && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-[#0b1c30] leading-tight">{user.name}</span>
                <span className="text-[10px] text-[#3d4a3d] font-medium">{user.role}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#006e2f] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                onClick={() => logout()}
                title="Keluar"
                className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold text-[#006e2f] hover:bg-[#e5eeff] rounded-lg transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-[#006e2f] hover:bg-[#005321] rounded-lg transition-all shadow-sm"
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
