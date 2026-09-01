const STEPS = [
  {
    number: "1",
    title: "Daftarkan Lapangan",
    desc: "Buat akun owner, atur nama unit lapangan, lokasi kota/kecamatan, jam operasional, dan tarif per jam di sistem.",
  },
  {
    number: "2",
    title: "Bagikan Tautan Jadwal",
    desc: "Pasang tautan halaman pemesanan pada bio profil sosial media atau chat WhatsApp bisnis arena Anda.",
  },
  {
    number: "3",
    title: "Terima Reservasi",
    desc: "Pelanggan memilih slot kosong secara mandiri. Konfirmasi pemesanan dan pantau laporan omzet di dashboard.",
  },
];

export default function PartnerHowItWorks() {
  return (
    <section id="cara-kerja" className="py-24 border-b border-gray-100 bg-[#f8f9ff]">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="max-w-2xl mb-14 space-y-2">
          <div className="text-[11px] font-bold text-[#006e2f] uppercase tracking-widest">
            ALUR PENGGUNAAN
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0b1c30]">
            3 Langkah mudah memulai
          </h2>
          <p className="text-sm text-gray-500">
            Mulai digitalisasi reservasi lapangan Anda tanpa perlu instalasi rumit.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(({ number, title, desc }) => (
            <div
              key={number}
              className="rounded-2xl border border-gray-200/80 bg-white p-7 text-[#0b1c30] shadow-xs transition-all duration-200 hover:shadow-md hover:border-[#006e2f]/30 hover:-translate-y-1 space-y-4 group"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm font-extrabold text-[#006e2f] group-hover:bg-[#006e2f] group-hover:text-white transition-colors">
                {number}
              </div>
              <h3 className="text-lg font-bold tracking-tight text-[#0b1c30]">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
