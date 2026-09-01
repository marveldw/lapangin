"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function KonfirmasiBookingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulasi loading proses booking (1 detik)
    setTimeout(() => {
      setIsSubmitting(false);
      setShowModal(true);
    }, 1000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Setelah sukses, lempar customer ke halaman Booking Saya
    router.push('/customer/booking');
  };

  return (
    <div className="bg-[#f8f9ff] font-sans text-[#0b1c30] min-h-screen flex flex-col relative">
      
      {/* Header (Navbar) */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-[#bccbb9]/30">
        <div className="h-16 w-full px-6 md:px-12 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Lapangin Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-[#006e2f] tracking-tight">Lapangin</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 h-16">
              <Link href="/" className="text-sm font-semibold text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Beranda</Link>
              <Link href="/lapangan" className="text-sm font-semibold text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Cari Lapangan</Link>
              <Link href="/customer/booking" className="text-sm font-semibold text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Booking Saya</Link>
              <Link href="/profile" className="text-sm font-semibold text-[#3d4a3d] hover:text-[#006e2f] transition-colors">Profile</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e5eeff] text-[#3d4a3d] transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#006e2f] flex items-center justify-center cursor-pointer shadow-sm">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 bg-[#f8f9ff] flex-1 flex flex-col relative group">
        {/* Ambient background layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <svg className="absolute w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="32" id="dot-grid" patternUnits="userSpaceOnUse" width="32">
                <circle cx="2" cy="2" fill="currentColor" r="1.5"></circle>
              </pattern>
            </defs>
            <rect fill="url(#dot-grid)" height="100%" width="100%"></rect>
          </svg>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-10 z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Booking Details */}
          <div className="col-span-1 lg:col-span-5 bg-[#e5eeff] rounded-xl shadow-sm overflow-hidden sticky top-24 border border-[#bccbb9]/30">
            <div 
              className="bg-cover bg-center w-full h-48 lg:h-64 relative shadow-sm" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=800&q=80')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#e5eeff] via-[#e5eeff]/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <span className="inline-flex items-center px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[#004b1e] font-bold text-xs shadow-sm gap-1 border border-white/50">
                  <span className="material-symbols-outlined text-[14px]">sports_tennis</span>
                  Badminton
                </span>
              </div>
            </div>
            
            <div className="p-6 md:p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-[#0b1c30]">Court A</h2>
                <p className="text-sm font-medium text-[#3d4a3d] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">location_on</span> Lapangin Arena, Jakarta
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-sm border border-[#bccbb9]/30">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#3d4a3d] uppercase tracking-wider">Tanggal</span>
                  <span className="text-sm font-bold text-[#0b1c30] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#006e2f]">calendar_month</span>
                    12 Okt 2026
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#3d4a3d] uppercase tracking-wider">Waktu</span>
                  <span className="text-sm font-bold text-[#0b1c30] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#006e2f]">schedule</span>
                    19:00 - 20:00
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 bg-white p-6 rounded-lg shadow-sm relative overflow-hidden border border-[#bccbb9]/30">
                <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#006e2f]/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm text-[#3d4a3d] font-medium">Harga (1 Jam)</span>
                  <span className="text-sm text-[#0b1c30] font-semibold">Rp100.000</span>
                </div>
                <div className="flex justify-between items-center w-full pt-3 border-t border-[#bccbb9]/30 mt-1">
                  <span className="text-sm font-bold text-[#0b1c30] uppercase tracking-wide">Total</span>
                  <span className="text-2xl font-bold text-[#006e2f]">Rp100.000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="col-span-1 lg:col-span-7 bg-white rounded-xl shadow-md p-6 lg:p-12 flex flex-col gap-8 border border-[#bccbb9]/30">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30]">Detail Pemesan</h1>
              <p className="text-sm text-[#3d4a3d]">Masukkan data diri Anda untuk menyelesaikan proses booking.</p>
            </div>
            
            <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
              
              {/* Name Input */}
              <div className="flex flex-col gap-2 relative group w-full">
                <label className="text-xs font-bold text-[#3d4a3d] uppercase tracking-wider" htmlFor="fullName">Nama Lengkap</label>
                <div className="relative flex items-center w-full">
                  <span className="material-symbols-outlined absolute left-4 text-[#3d4a3d]/60 group-focus-within:text-[#006e2f] transition-colors">person</span>
                  <input 
                    className="w-full bg-[#f8f9ff] text-sm text-[#0b1c30] border border-[#bccbb9]/50 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-[#006e2f]/20 transition-all shadow-sm font-medium" 
                    id="fullName" 
                    defaultValue="Tarisha Naila Angelin" 
                    required 
                    type="text"
                  />
                </div>
              </div>
              
              {/* WhatsApp Input */}
              <div className="flex flex-col gap-2 relative group w-full">
                <label className="text-xs font-bold text-[#3d4a3d] uppercase tracking-wider" htmlFor="whatsapp">Nomor WhatsApp</label>
                <div className="relative flex items-center w-full">
                  <span className="material-symbols-outlined absolute left-4 text-[#3d4a3d]/60 group-focus-within:text-[#006e2f] transition-colors">call</span>
                  <input 
                    className="w-full bg-[#f8f9ff] text-sm text-[#0b1c30] border border-[#bccbb9]/50 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-[#006e2f]/20 transition-all shadow-sm font-medium" 
                    id="whatsapp" 
                    defaultValue="081234567890" 
                    required 
                    type="tel"
                  />
                </div>
                <p className="text-xs text-[#3d4a3d] flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">info</span> Bukti booking akan dikirimkan via WhatsApp.
                </p>
              </div>
              
              {/* Decorative Divider */}
              <div className="w-full flex items-center gap-4 py-4 opacity-60">
                <div className="h-px bg-[#bccbb9] flex-1"></div>
                <span className="material-symbols-outlined text-[#bccbb9]">verified_user</span>
                <div className="h-px bg-[#bccbb9] flex-1"></div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end items-center w-full mt-2">
                <button 
                  className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-sm text-[#0b1c30] bg-[#e5eeff] hover:bg-[#d3e4fe] transition-colors shadow-sm" 
                  type="button"
                  onClick={() => router.back()}
                >
                  Batal
                </button>
                <button 
                  className={`w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-sm text-white bg-[#006e2f] hover:bg-[#005321] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 relative overflow-hidden group ${isSubmitting ? 'opacity-80 cursor-wait' : ''}`} 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  ) : (
                    <>
                      <span className="relative z-10 flex items-center gap-2">
                        Konfirmasi Booking
                        <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                      </span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Success Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#0b1c30]/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl p-8 md:p-12 flex flex-col items-center gap-6 max-w-md w-[calc(100%-2rem)] mx-auto animate-in zoom-in-95 duration-300 border border-[#bccbb9]/30">
            
            <div className="w-20 h-20 rounded-full bg-[#22c55e]/20 flex items-center justify-center shadow-sm mb-2 relative">
              <div className="absolute inset-0 bg-[#22c55e]/20 rounded-full animate-ping opacity-75"></div>
              <span className="material-symbols-outlined text-[#006e2f] text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-2xl font-bold text-[#0b1c30]">Booking Berhasil!</h3>
              <p className="text-sm text-[#3d4a3d] leading-relaxed">
                Terima kasih. Bukti booking Anda untuk <strong className="text-[#0b1c30]">Court A</strong> telah dikirimkan ke WhatsApp.
              </p>
            </div>
            
            <div className="w-full bg-[#f8f9ff] rounded-lg p-4 flex items-center justify-between shadow-sm mt-2 border-l-4 border-[#006e2f]">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#3d4a3d] uppercase tracking-wider">Kode Booking</span>
                <span className="text-lg font-bold text-[#0b1c30] font-mono tracking-widest mt-1">LPG-8X2F</span>
              </div>
              <button className="p-2 rounded-md bg-white text-[#3d4a3d] hover:text-[#006e2f] hover:bg-[#e5eeff] border border-[#bccbb9]/30 transition-colors shadow-sm" title="Salin Kode">
                <span className="material-symbols-outlined text-[20px]">content_copy</span>
              </button>
            </div>
            
            <button 
              className="w-full mt-4 px-6 py-3 rounded-lg font-bold text-sm text-white bg-[#006e2f] hover:bg-[#005321] transition-all shadow-md"
              onClick={handleCloseModal}
            >
              Selesai & Kembali ke Booking Saya
            </button>
          </div>
        </div>
      )}

    </div>
  );
}