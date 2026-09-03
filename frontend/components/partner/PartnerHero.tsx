import Link from "next/link";
import { ShieldCheck, Smartphone, TrendingUp, ArrowRight } from "lucide-react";

const VALUE_CARDS = [
  {
    icon: ShieldCheck,
    title: "Validasi Anti-Bentrok",
    desc: "Pemeriksaan ketersediaan slot jam secara atomik sebelum reservasi disimpan.",
  },
  {
    icon: Smartphone,
    title: "Booking Mandiri",
    desc: "Pelanggan memilih slot jam dan reservasi langsung dari smartphone secara mandiri.",
  },
  {
    icon: TrendingUp,
    title: "Rekapitulasi Omzet",
    desc: "Pantau omzet harian dan bulanan otomatis dari dashboard terpadu tanpa rekap manual.",
  },
];

export default function PartnerHero() {
  return (
    <section className="pt-28 pb-20 border-b border-gray-100 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-6 relative z-10">

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0b1c30] sm:leading-[1.15] max-w-3xl mx-auto">
          Kelola jadwal &amp; reservasi lapangan secara otomatis.
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Platform terpadu untuk pemilik arena futsal, badminton, basket, dan mini soccer. Atur slot jam, terima booking mandiri dari pelanggan, dan pantau rekapitulasi omzet tanpa risiko jadwal bentrok.
        </p>

        {/* CTA Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/register?role=owner&plan=free"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full text-sm font-bold bg-[#006e2f] hover:bg-[#005321] text-white shadow-md hover:shadow-lg transition-all h-12 px-7 gap-2"
          >
            <span>Daftar Akun Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-[#0b1c30] hover:text-[#006e2f] hover:border-[#006e2f]/30 transition-all h-12 px-7"
          >
            Lihat Pilihan Paket
          </a>
        </div>

        {/* 3 Mini Value Cards */}
        <div className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {VALUE_CARDS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200/80 bg-white p-5 text-[#0b1c30] shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-[#006e2f]/30 space-y-2 group"
            >
              <div className="flex items-center gap-2.5 font-bold text-xs text-[#0b1c30] group-hover:text-[#006e2f] transition-colors">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-[#006e2f]">
                  <Icon className="h-4 w-4" />
                </div>
                <span>{title}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
