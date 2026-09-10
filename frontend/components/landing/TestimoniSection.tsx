import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    rating: 5,
    tag: "PEMAIN",
    text: "“Dulu ribet WA sana-sini buat cari futsal kosong. Sekarang tinggal buka app, pilih jam, bayar. Selesai.”",
    name: "Rizky Pratama",
    role: "Kapten tim futsal, Jakarta",
  },
  {
    rating: 5,
    tag: "PARTNER",
    text: "“Jam sepi siang hari yang biasanya kosong sekarang terisi. Dasbornya gampang, laporan pendapatan jelas.”",
    name: "Ibu Retno",
    role: "Pemilik GOR Badminton, Yogyakarta",
  },
  {
    rating: 5,
    tag: "PEMAIN",
    text: "“Fitur open match-nya juara. Baru pindah kota, langsung dapat teman main basket tiap minggu.”",
    name: "Daniel Sitorus",
    role: "Anggota komunitas, Surabaya",
  },
];

export default function TestimoniSection() {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <p className="text-[11px] font-bold tracking-widest text-[#006e2f] uppercase mb-2">
            KATA MEREKA
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Dipercaya pemain &amp; pemilik lapangan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ rating, tag, text, name, role }) => (
            <div
              key={name}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 flex flex-col justify-between gap-6 shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex gap-1">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                    ))}
                  </div>
                  <span className="text-[9px] font-extrabold tracking-wider text-gray-400 uppercase bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                    {tag}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
                  {text}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-bold text-[#0b1c30]">{name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
