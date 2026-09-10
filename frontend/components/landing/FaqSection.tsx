"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Bagaimana cara booking lapangan?",
    a: "Cari lapangan lewat filter olahraga & lokasi, pilih slot jam yang tersedia, lalu bayar. E-ticket langsung terkirim dan tinggal ditunjukkan di lokasi.",
  },
  {
    q: "Metode pembayaran apa saja yang didukung?",
    a: "Kami mendukung transfer bank, virtual account, dompet digital (GoPay, OVO, DANA), dan kartu kredit/debit.",
  },
  {
    q: "Apakah booking bisa dibatalkan?",
    a: "Ya, pembatalan bisa dilakukan hingga 2 jam sebelum jadwal bermain untuk mendapatkan refund penuh. Kebijakan bisa berbeda per venue.",
  },
  {
    q: "Saya punya lapangan, bagaimana cara bergabung?",
    a: "Daftar sebagai Owner saat registrasi, lengkapi profil venue, dan lapanganmu langsung bisa diakses ribuan pemain aktif.",
  },
];

export default function FaqSection() {
  // Set first item open by default like in App.png
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-[#fbfcfe] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

        {/* Left: Title & Subtitle */}
        <div className="lg:w-80 shrink-0">
          <p className="text-[11px] font-bold tracking-widest text-[#006e2f] uppercase mb-2">
            FAQ
          </p>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Pertanyaan umum
          </h2>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            Masih ada yang mau ditanyakan?{" "}
            <Link href="#" className="text-[#006e2f] font-semibold hover:underline">
              Hubungi tim support
            </Link>{" "}
            kami setiap hari, 08.00–22.00.
          </p>
        </div>

        {/* Right: Clean FAQ Accordion Card Container */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200/70 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {FAQS.map(({ q, a }, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-[#0b1c30]">
                    {q}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                      isOpen
                        ? "bg-gray-100 border-gray-200 text-gray-600"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-0 text-sm text-gray-500 leading-relaxed animate-in fade-in-50 duration-200">
                    {a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
