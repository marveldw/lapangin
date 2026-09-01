import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PartnerCta() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center space-y-6">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 w-fit mx-auto">
          <span className="text-[11px] font-bold text-[#006e2f] tracking-wide uppercase">
            SIAP UNTUK MEMULAI?
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0b1c30] sm:leading-tight max-w-2xl mx-auto">
          Tingkatkan efisiensi dan omzet arena olahraga Anda sekarang
        </h2>

        <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
          Daftarkan unit lapangan Anda dalam hitungan menit dan biarkan sistem menangani reservasi mandiri dari pelanggan secara otomatis.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3.5">
          <Link
            href="/register?role=owner&plan=free"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full text-sm font-bold bg-[#006e2f] hover:bg-[#005321] text-white shadow-md hover:shadow-lg transition-all h-12 px-8 gap-2"
          >
            <span>Daftar Gratis Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-[#0b1c30] hover:text-[#006e2f] hover:border-[#006e2f]/30 transition-all h-12 px-7"
          >
            Masuk Dashboard
          </Link>
        </div>

      </div>
    </section>
  );
}
