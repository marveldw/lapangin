import Link from "next/link";
import { ArrowRight } from "lucide-react";

const ROLES = [
  {
    tag: "UNTUK PENYEWA",
    title: ["Cari & booking lapangan ", "dalam", " hitungan detik."],
    cta: { label: "Booking Sekarang", href: "/lapangan" },
    image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80",
  },
  {
    tag: "UNTUK OWNER",
    title: ["Isi jam kosong, ubah ", "venue jadi", " penghasilan."],
    cta: { label: "Jadi Partner", href: "/partner" },
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80",
  },
];

export default function DualRoleSection() {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <p className="text-[11px] font-bold tracking-widest text-[#006e2f] uppercase mb-2">
            SATU PLATFORM, DUA SISI
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
            Apa pun peranmu, mulainya dari sini
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ROLES.map(({ tag, title, cta, image }) => (
            <Link
              key={tag}
              href={cta.href}
              className="relative rounded-3xl overflow-hidden h-72 sm:h-80 group cursor-pointer shadow-lg block"
            >
              <img
                src={image}
                alt={tag}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end gap-3.5">
                <span className="text-[10px] font-extrabold tracking-widest text-white/70 uppercase">
                  {tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug max-w-md">
                  {title[0]}
                  <span className="text-emerald-400 font-extrabold">{title[1]}</span>
                  {title[2]}
                </h3>
                <div className="inline-flex items-center gap-2 text-white text-sm font-semibold group-hover:gap-3 transition-all pt-1">
                  <span>{cta.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
