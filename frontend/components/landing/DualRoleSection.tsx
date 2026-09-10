"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DualRoleSection() {
  const [activeRole, setActiveRole] = useState<"owner" | "renter">("owner");

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Content & Switcher */}
          <div className="lg:col-span-5 flex flex-col items-start">
            
            {/* Pill Tab Switcher */}
            <div className="inline-flex items-center p-1 bg-[#f0f3f1] rounded-full mb-8 sm:mb-10">
              <button
                type="button"
                onClick={() => setActiveRole("owner")}
                className={`px-5 py-2 rounded-full text-xs sm:text-[13px] font-bold tracking-wider uppercase transition-all ${
                  activeRole === "owner"
                    ? "bg-[#006e2f] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                PEMILIK LAPANGAN
              </button>
              <button
                type="button"
                onClick={() => setActiveRole("renter")}
                className={`px-5 py-2 rounded-full text-xs sm:text-[13px] font-bold tracking-wider uppercase transition-all ${
                  activeRole === "renter"
                    ? "bg-[#006e2f] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                PENYEWA
              </button>
            </div>

            {/* Dynamic Heading */}
            {activeRole === "owner" ? (
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 tracking-tight leading-[1.2] mb-6">
                Kelola venue lebih praktis dan<br />
                menguntungkan.
              </h2>
            ) : (
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 tracking-tight leading-[1.2] mb-6">
                Sewa lapangan lebih mudah dan<br />
                fleksibel.
              </h2>
            )}

            {/* Dynamic Description */}
            <p className="text-gray-500 sm:text-base leading-relaxed max-w-md mb-8">
              {activeRole === "owner"
                ? "Waktunya buat venue-mu bekerja lebih dari sekadar tempat main. Semuanya dimulai dari pengelolaan yang simpel, fleksibel, dan menguntungkan lewat Lapangin."
                : "Temukan lapangan olahraga terbaik di sekitarmu, cek ketersediaan jam secara real-time, dan booking langsung dalam hitungan detik lewat Lapangin."}
            </p>

            {/* CTA Link */}
            <Link
              href={activeRole === "owner" ? "/partner" : "/lapangan"}
              className="inline-flex items-center gap-2 text-[#006e2f] hover:text-[#005321] font-bold text-sm sm:text-base group border-b-2 border-[#006e2f] pb-0.5 transition-all mb-10 sm:mb-14"
            >
              <span>Lihat Selengkapnya</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Metric / Indicator */}
            <div className="flex items-center gap-2.5 text-[11px] sm:text-xs font-bold tracking-widest text-gray-500 uppercase">
              <span className="w-2 h-2 rounded-full bg-[#006e2f] inline-block shrink-0" />
              <span>
                {activeRole === "owner"
                  ? "500+ VENUE PARTNER AKTIF"
                  : "10.000+ BOOKING TERVERIFIKASI"}
              </span>
            </div>

          </div>

          {/* Right Column: Sports Photos Mosaic Grid */}
          <div className="lg:col-span-7 w-full">
            <div className="grid grid-cols-12 gap-3.5 sm:gap-4 h-[380px] sm:h-[430px] lg:h-[460px]">
              
              {/* Left Sub-column (Col span 8) */}
              <div className="col-span-8 flex flex-col gap-3.5 sm:gap-4 h-full">
                
                {/* Top: Futsal Card */}
                <div className="relative flex-1 rounded-2xl sm:rounded-3xl overflow-hidden group shadow-sm bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80"
                    alt="Futsal Court"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold tracking-wider text-gray-900 shadow-sm uppercase">
                    FUTSAL
                  </div>
                </div>

                {/* Bottom Row: Tenis & Badminton (2 Cards) */}
                <div className="grid grid-cols-2 gap-3.5 sm:gap-4 h-32 sm:h-40 shrink-0">
                  
                  {/* Tenis */}
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden group shadow-sm bg-gray-100">
                    <img
                      src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80"
                      alt="Tennis Court"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold tracking-wider text-gray-900 shadow-sm uppercase">
                      TENIS
                    </div>
                  </div>

                  {/* Badminton */}
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden group shadow-sm bg-gray-100">
                    <img
                      src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80"
                      alt="Badminton Court"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                </div>

              </div>

              {/* Right Sub-column: Basketball Card (Col span 4, Full Height) */}
              <div className="col-span-4 h-full">
                <div className="relative h-full rounded-2xl sm:rounded-3xl overflow-hidden group shadow-sm bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80"
                    alt="Basketball Court"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold tracking-wider text-gray-900 shadow-sm uppercase">
                    BASKET
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
