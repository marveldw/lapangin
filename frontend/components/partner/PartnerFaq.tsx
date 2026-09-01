"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const PARTNER_FAQS = [
  {
    q: "Bagaimana mekanisme pencegahan jadwal bentrok bekerja?",
    a: "Setiap reservasi yang diajukan akan melalui validasi ketersediaan di backend. Sistem memeriksa tanggal, jam mulai, jam selesai, dan ID unit lapangan secara atomik dengan database lock sebelum transaksi disimpan.",
  },
  {
    q: "Apakah pelanggan bisa melihat lapangan berdasarkan lokasi terdekat?",
    a: "Ya! Pelanggan dapat menjelajahi seluruh lapangan di kota atau area mereka tanpa harus login terlebih dahulu. Namun saat ingin melakukan reservasi slot jam, pelanggan akan diarahkan untuk login terlebih dahulu agar data booking terdata rapi.",
  },
  {
    q: "Bagaimana batasan kuota paket Free diterapkan?",
    a: "Ketika Owner pada paket Free mencoba menambahkan unit lapangan ke-2 atau melebihi 30 booking/bulan, sistem akan membatasi penambahan dan memberikan opsi upgrade ke paket Basic atau Pro yang aktif secara instan.",
  },
  {
    q: "Di mana pengelola/owner lapangan mengakses dashboard?",
    a: "Owner dapat masuk melalui menu login pengelola untuk langsung mengakses dashboard manajemen lapangan, jadwal operasional, dan laporan omzet.",
  },
];

export default function PartnerFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 border-b border-gray-100 bg-[#f8f9ff]">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="mb-14 text-center space-y-2">
          <div className="text-[11px] font-bold text-[#006e2f] uppercase tracking-widest">
            PERTANYAAN UMUM
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0b1c30]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-500">
            Hal-hal yang sering ditanyakan oleh pengelola arena dan pemilik venue.
          </p>
        </div>

        {/* Accordion Card Container */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs divide-y divide-gray-100 overflow-hidden">
          {PARTNER_FAQS.map(({ q, a }, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-7 py-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
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
                  <div className="px-7 pb-6 pt-0 text-sm text-gray-500 leading-relaxed animate-in fade-in-50 duration-200">
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
