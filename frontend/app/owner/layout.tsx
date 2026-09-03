'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from '../../components/Sidebar';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();

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
    <div className="bg-[#f8f9ff] text-[#0b1c30] text-base min-h-screen">
      <Sidebar />
      
      <div className="pl-72 w-full">
        {/* Top Header */}
        <header className="fixed top-0 left-72 right-0 h-20 bg-[#f8f9ff]/80 backdrop-blur-xl z-40 px-8 flex items-center justify-between border-b border-[#bccbb9]/30 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#006e2f]">location_on</span>
            <span className="text-xl font-semibold">Owner Portal</span>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Profil User */}
            <div className="flex items-center gap-4 pl-6 border-l border-[#bccbb9]/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold tracking-wide text-[#0b1c30]">{user?.name || 'Owner'}</p>
                <p className="text-xs font-medium text-[#3d4a3d]">
                  {user?.subscription?.plan_name ? `Plan: ${user.subscription.plan_name}` : 'Venue Owner'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#006e2f] flex items-center justify-center shadow-md border-2 border-[#ffffff] text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'O'}
              </div>

              {/* Tombol Logout */}
              <button 
                onClick={() => logout()}
                title="Keluar / Logout"
                className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Konten Utama */}
        <main className="relative pt-24 min-h-screen bg-[#f8f9ff] px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}