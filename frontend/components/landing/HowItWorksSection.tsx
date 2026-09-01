import { Search, CalendarCheck, QrCode, Store, Calendar, Wallet } from "lucide-react";

const PLAYER_STEPS = [
  {
    icon: Search,
    number: "01",
    title: "Cari lapangan",
    desc: "Filter berdasarkan olahraga, lokasi, tanggal, dan harga — lengkap dengan foto, rating, dan fasilitas asli.",
  },
  {
    icon: CalendarCheck,
    number: "02",
    title: "Booking & bayar",
    desc: "Pilih slot kosong secara real-time dan bayar aman lewat e-wallet, VA, atau kartu.",
  },
  {
    icon: QrCode,
    number: "03",
    title: "Datang & main",
    desc: "Tunjukkan e-ticket di lokasi. Selesai main, tinggalkan ulasan untuk pemain lain.",
  },
];

const OWNER_STEPS = [
  {
    icon: Store,
    number: "01",
    title: "Daftarkan venue",
    desc: "Buat listing lapangan lengkap dengan foto, jam operasional, dan harga per jam dalam hitungan menit.",
  },
  {
    icon: Calendar,
    number: "02",
    title: "Terima booking",
    desc: "Jadwal terisi otomatis dari ribuan pemain aktif. Kelola ketersediaan langsung dari satu dashboard.",
  },
  {
    icon: Wallet,
    number: "03",
    title: "Terima pembayaran",
    desc: "Dana masuk otomatis ke rekeningmu setelah booking selesai, transparan dan tepat waktu.",
  },
];

type Step = {
  icon: React.ComponentType<{ className?: string }>;
  number: string;
  title: string;
  desc: string;
};

function StepCard({ steps, label }: { steps: Step[]; label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#006e2f] inline-block" />
        <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{label}</p>
      </div>
      <div className="flex flex-col gap-6">
        {steps.map(({ icon: Icon, number, title, desc }, idx) => (
          <div key={title} className="flex gap-4 items-start">
            <div className="flex flex-col items-center gap-1.5 shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-xl bg-[#f8f9ff] border border-gray-200/80 flex items-center justify-center shadow-xs">
                <Icon className="w-4 h-4 text-[#006e2f]" />
              </div>
              {idx < steps.length - 1 && (
                <div className="w-px h-8 bg-gray-200" />
              )}
            </div>
            <div className="pt-0.5">
              <span className="text-[10px] font-bold text-[#006e2f] uppercase tracking-wider block mb-0.5">
                {number}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-[#0b1c30]">{title}</h4>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mt-1">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <p className="text-[11px] font-bold tracking-widest text-[#006e2f] uppercase mb-2">
            Cara Kerja
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
            Satu platform, dua sisi yang saling terhubung
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-2xl leading-relaxed">
            Pemain menemukan lapangan, owner mengisi jam kosong — semuanya lewat alur yang sama sederhananya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <StepCard steps={PLAYER_STEPS} label="Untuk Penyewa" />
          <StepCard steps={OWNER_STEPS} label="Untuk Owner" />
        </div>
      </div>
    </section>
  );
}
