'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from '../../components/Sidebar';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State sidebar

  useEffect(() => {
    if (!isLoading) {
      if (!token || !user) {
        router.push('/login');
      } else if (user.role !== 'OWNER') {
        router.push('/lapangan');
      }
    }
  }, [user, token, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9ff]">
        <div className="flex items-center gap-2 text-[#006e2f] animate-pulse">
          <span className="material-symbols-outlined text-[32px]">sports_soccer</span>
          <span className="text-lg font-semibold">Memuat Lapangin...</span>
        </div>
      </div>
    );
  }

  if (!token || user?.role !== 'OWNER') {
    return null;
  }

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] text-base min-h-screen flex">
      {/* Mengirimkan state ke Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Konten Utama menyesuaikan lebar saat di Desktop (pl-72) */}
      <div className="flex-1 lg:pl-72 w-full transition-all duration-300">
        
        {/* Top Header */}
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-[#f8f9ff]/90 backdrop-blur-xl z-30 px-4 md:px-8 flex items-center justify-between border-b border-[#bccbb9]/30 shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all duration-300">
          <div className="flex items-center gap-3">
            {/* Tombol Hamburger Khusus HP/Tablet */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-[#006e2f] hover:bg-[#eff4ff] rounded-xl transition-colors cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[26px]">menu</span>
            </button>
            <span className="material-symbols-outlined text-[#006e2f] hidden sm:block">location_on</span>
            <span className="text-lg sm:text-xl font-semibold">Owner Portal</span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:pl-6 sm:border-l border-[#bccbb9]/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold tracking-wide text-[#0b1c30]">{user?.name || 'Owner'}</p>
                <p className="text-xs font-medium text-[#3d4a3d]">
                  {user?.subscription?.plan_name ? `Plan: ${user.subscription.plan_name}` : 'Venue Owner'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#006e2f] flex items-center justify-center shadow-md border-2 border-[#ffffff] text-white font-semibold text-sm shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'O'}
              </div>

              {/* Tombol Logout Header Khusus Desktop */}
              <button 
                onClick={() => logout()}
                title="Keluar / Logout"
                className="hidden sm:flex p-2 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl transition-colors items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Area Render Halaman */}
        <main className="relative pt-24 min-h-screen px-4 md:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}