import Link from "next/link";
import { TrendingUp, Calendar, Wallet, ArrowRight } from "lucide-react";

const BENEFITS = [
  { icon: TrendingUp, text: "Tingkatkan okupansi hingga 40% di jam sepi" },
  { icon: Calendar, text: "Kelola jadwal & harga dari satu dasbor" },
  { icon: Wallet, text: "Terima pembayaran otomatis, cair tiap minggu" },
];

export default function OwnerSection() {
  return (
    <section className="py-20 bg-[#f8f9ff] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Unified Card Container */}
        <div className="bg-white rounded-3xl lg:rounded-[36px] border border-gray-200/80 shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-2 group">
          
          {/* Left Column: Content */}
          <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-between gap-8">
            <div>
              <p className="text-[11px] font-bold text-[#006e2f] tracking-widest uppercase mb-3">
                UNTUK PEMILIK LAPANGAN
              </p>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight leading-[1.2]">
                Punya lapangan? Jadikan lebih produktif.
              </h2>

              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mt-4 max-w-md">
                Daftarkan venue-mu dan jangkau ribuan pemain aktif setiap hari. Kami urus booking, pembayaran, dan promosi — kamu fokus kelola lapangan.
              </p>

              {/* Benefits List */}
              <div className="flex flex-col gap-4 mt-8">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#006e2f]" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons (Pills) */}
            <div className="flex flex-wrap items-center gap-3.5 pt-4">
              <Link
                href="/partner"
                className="inline-flex items-center gap-2 bg-[#006e2f] hover:bg-[#005321] text-white font-semibold px-7 py-3 rounded-full text-sm transition-all hover:gap-3 shadow-sm hover:shadow-md"
              >
                <span>Jadi Partner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/partner#hitung"
                className="inline-flex items-center border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#006e2f] hover:border-[#006e2f]/40 font-semibold px-6 py-3 rounded-full text-sm transition-colors"
              >
                Hitung potensi pendapatan
              </Link>
            </div>
          </div>

          {/* Right Column: Full Bleed Image with Floating Badge */}
          <div className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[480px] w-full overflow-hidden bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80"
              alt="Gelanggang Olahraga / Venue Lapangan"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

            {/* Floating Earnings Badge */}
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/80 p-4 sm:p-5 animate-in fade-in-50 duration-300">
              <p className="text-[10px] font-extrabold tracking-widest text-gray-400 uppercase">
                RATA-RATA PARTNER
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-1">
                +Rp 8,4jt<span className="text-xs sm:text-sm font-semibold text-gray-500">/bln</span>
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
