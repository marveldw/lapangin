import { Calendar, LayoutGrid, Users, CheckCircle2, Wallet, Layers } from "lucide-react";

const FEATURES = [
  {
    icon: Calendar,
    title: "Manajemen Jadwal",
    desc: "Tampilan slot per jam operasional. Membedakan status ketersediaan (Available / Booked) secara real-time.",
  },
  {
    icon: LayoutGrid,
    title: "Kelola Lapangan",
    desc: "Konfigurasi unit lapangan secara mandiri: nama unit, tipe olahraga, lokasi kota/kecamatan, deskripsi, dan tarif per jam.",
  },
  {
    icon: Users,
    title: "Portal Pemesan",
    desc: "Pelanggan memilih slot jam dan reservasi langsung secara instan tanpa proses formulir yang rumit.",
  },
  {
    icon: CheckCircle2,
    title: "Siklus Reservasi",
    desc: "Kelola status booking secara terstruktur: PENDING, CONFIRMED, dan CANCELLED dengan pembaruan jadwal otomatis.",
  },
  {
    icon: Wallet,
    title: "Laporan Omzet Ringkas",
    desc: "Dashboard menyajikan ringkasan omzet harian, pendapatan bulanan, dan total booking dalam satu tampilan.",
  },
  {
    icon: Layers,
    title: "Pembatasan Kuota Paket",
    desc: "Pembatasan jumlah unit lapangan dan kuota pemesanan bulanan diatur secara otomatis sesuai paket langganan aktif.",
  },
];

export default function PartnerFeatures() {
  return (
    <section id="fitur" className="py-24 border-b border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14 space-y-2">
          <div className="text-[11px] font-bold text-[#006e2f] uppercase tracking-widest">
            MODUL FUNGSIONAL
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0b1c30]">
            Dirancang untuk operasional yang efisien
          </h2>
          <p className="text-sm text-gray-500 pt-1">
            Seluruh modul terintegrasi untuk mendukung aktivitas harian pemilik dan pemesan lapangan.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200/80 bg-white text-[#0b1c30] shadow-xs transition-all duration-200 hover:shadow-md hover:border-[#006e2f]/30 hover:-translate-y-1 p-7 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#006e2f] mb-4 group-hover:bg-[#006e2f] group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold tracking-tight text-[#0b1c30]">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
