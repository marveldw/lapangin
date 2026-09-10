"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CONTENT = {
  owner: {
    tag: "VENUE MANAGEMENT",
    title: "Kelola venue lebih produktif, rapi, dan menguntungkan.",
    ctaText: "Daftarkan Venue Jadi Partner",
    ctaHref: "/partner",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
    badgeTop: {
      label: "POTENSI OKUPANSI",
      value: "+40% Jam Sepi",
    },
    badgeBottom: {
      label: "RATA-RATA PARTNER",
      value: "+Rp 8,4jt",
      unit: "/bln",
      desc: "Pencairan otomatis tiap minggu",
    },
    items: [
      {
        number: "01",
        title: "Maksimalkan Okupansi Jam Sepi",
        description:
          "Jangkau ribuan komunitas pemain aktif setiap hari untuk mengisi slot jam kosong pagi dan siang hari hingga 40%.",
      },
      {
        number: "02",
        title: "Otomatiskan Operasional Bisnis",
        description:
          "Sistem reservasi aktif 24 jam. Tidak perlu lagi mencatat manual di buku atau membalas chat WA booking satu per satu.",
      },
      {
        number: "03",
        title: "Laporan Keuangan & Pencairan Pasti",
        description:
          "Pantau omzet harian & bulanan secara real-time dari satu dasbor, dengan pencairan dana otomatis langsung ke rekening bank.",
      },
    ],
  },
  renter: {
    tag: "SPORT ENTHUSIAST",
    title: "Main kapan saja tanpa ribet cari dan kontak lapangan.",
    ctaText: "Cari Lapangan Sekarang",
    ctaHref: "/lapangan",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    badgeTop: {
      label: "KEMUDAHAN AKSES",
      value: "100% Real-time Jadwal",
    },
    badgeBottom: {
      label: "KOMUNITAS AKTIF",
      value: "50.000+",
      unit: " Pemain",
      desc: "Terhubung setiap bulan di Lapangin",
    },
    items: [
      {
        number: "01",
        title: "Cek Jadwal Lapangan Real-Time",
        description:
          "Lihat ketersediaan slot jam dan harga secara akurat tanpa perlu menunggu balasan admin lapangan.",
      },
      {
        number: "02",
        title: "Booking & Bayar Instan",
        description:
          "Pesan lapangan pilihanmu dan bayar langsung lewat berbagai metode pembayaran resmi yang aman dan praktis.",
      },
      {
        number: "03",
        title: "Jaminan Slot Pasti Aman",
        description:
          "Konfirmasi booking otomatis langsung masuk ke sistem venue, tanpa risiko jadwal bentrok atau dobel booking.",
      },
    ],
  },
};

export default function WhyUs() {
  const [activeRole, setActiveRole] = useState<"renter" | "owner">("owner");
  const data = CONTENT[activeRole];

  return (
    <section className="py-20 bg-[#f8f9ff] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Kenapa Lapangin?
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-2">
              Standar baru berolahraga dan mengelola venue olahraga tanpa ribet.
            </p>
          </div>

          {/* Role Switcher Pill */}
          <div className="inline-flex items-center p-1 bg-[#f0f3f1] rounded-full self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveRole("renter")}
              className={`px-5 py-2 rounded-full text-xs sm:text-[13px] font-bold tracking-wider uppercase transition-all ${
                activeRole === "renter"
                  ? "bg-[#006e2f] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              UNTUK PENYEWA
            </button>
            <button
              type="button"
              onClick={() => setActiveRole("owner")}
              className={`px-5 py-2 rounded-full text-xs sm:text-[13px] font-bold tracking-wider uppercase transition-all ${
                activeRole === "owner"
                  ? "bg-[#006e2f] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              UNTUK PEMILIK LAPANGAN
            </button>
          </div>
        </div>

        {/* Unified Card Container */}
        <div className="bg-white rounded-3xl lg:rounded-[36px] border border-gray-200/80 shadow-md p-8 sm:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Content */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full">
            <div>
              {/* Badge */}
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#f0f3f1] text-[11px] font-extrabold tracking-wider text-gray-800 uppercase mb-4">
                {data.tag}
              </span>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-snug mb-8">
                {data.title}
              </h3>

              {/* Numbered Benefits List */}
              <div className="flex flex-col gap-6">
                {data.items.map((item) => (
                  <div
                    key={item.number}
                    className="flex flex-col pb-5 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-base sm:text-lg font-extrabold text-[#0b1c30]">
                        {item.number}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-[#0b1c30]">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed pl-7 sm:pl-8">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Link */}
            <div className="pt-8">
              <Link
                href={data.ctaHref}
                className="inline-flex items-center gap-2 text-sm sm:text-base font-extrabold text-[#0b1c30] hover:text-[#006e2f] transition-all group"
              >
                <span>{data.ctaText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column: Image with Floating Badges */}
          <div className="lg:col-span-5 relative w-full h-[360px] sm:h-[420px] lg:h-[480px] rounded-3xl overflow-hidden shadow-md bg-gray-100 group">
            <img
              src={data.image}
              alt={data.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

            {/* Floating Badge 1: Top Right */}
            <div className="absolute top-5 right-5 sm:top-6 sm:right-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/80 p-3.5 sm:p-4 animate-in fade-in duration-300">
              <p className="text-[10px] font-extrabold tracking-widest text-gray-400 uppercase">
                {data.badgeTop.label}
              </p>
              <p className="text-sm sm:text-base font-extrabold text-[#0b1c30] tracking-tight mt-0.5">
                {data.badgeTop.value}
              </p>
            </div>

            {/* Floating Badge 2: Bottom Left */}
            <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/80 p-4 sm:p-5 animate-in fade-in duration-300 max-w-[220px]">
              <p className="text-[10px] font-extrabold tracking-widest text-gray-400 uppercase">
                {data.badgeBottom.label}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight mt-1">
                {data.badgeBottom.value}
                {data.badgeBottom.unit && (
                  <span className="text-xs sm:text-sm font-semibold text-gray-500">
                    {data.badgeBottom.unit}
                  </span>
                )}
              </p>
              {data.badgeBottom.desc && (
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                  {data.badgeBottom.desc}
                </p>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
