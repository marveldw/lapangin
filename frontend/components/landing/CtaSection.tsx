import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-14 sm:py-16 bg-[#006e2f] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
        <div className="max-w-xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Siap main hari ini?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/90 mt-2 leading-relaxed">
            Temukan lapangan terdekat dan booking dalam hitungan detik.
          </p>
        </div>
        <Link
          href="/lapangan"
          className="inline-flex items-center gap-2 bg-white text-[#006e2f] hover:bg-emerald-50 font-bold px-7 py-3.5 rounded-full text-sm shadow-md transition-all hover:gap-3 shrink-0"
        >
          <span>Cari Lapangan</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
