import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "FREE",
    subtitle: "Paket Percobaan",
    price: "Rp 0",
    period: "/bulan",
    popular: false,
    features: [
      { text: "Maksimal 1 Lapangan", highlight: true },
      { text: "Hingga 30 booking/bulan", highlight: true },
      { text: "Dashboard ringkasan dasar", highlight: false },
      { text: "Validasi jadwal anti-bentrok", highlight: false },
    ],
    cta: {
      label: "Mulai Free",
      href: "/register?role=owner&plan=free",
      variant: "outline",
    },
  },
  {
    name: "BASIC",
    subtitle: "Paket Standar",
    price: "Rp 49.000",
    period: "/bulan",
    popular: true,
    features: [
      { text: "Hingga 5 Lapangan", highlight: true },
      { text: "Unlimited Booking", highlight: true },
      { text: "Dashboard performa lengkap", highlight: false },
      { text: "Laporan omzet harian & bulanan", highlight: false },
      { text: "Manajemen status reservasi", highlight: false },
    ],
    cta: {
      label: "Pilih Basic",
      href: "/register?role=owner&plan=basic",
      variant: "primary",
    },
  },
  {
    name: "PRO",
    subtitle: "Paket Komplit",
    price: "Rp 99.000",
    period: "/bulan",
    popular: false,
    features: [
      { text: "Unlimited Lapangan", highlight: true },
      { text: "Unlimited Booking", highlight: true },
      { text: "Laporan omzet & rekap data", highlight: false },
      { text: "Customer Management", highlight: false },
      { text: "Advanced Analytics", highlight: false },
    ],
    cta: {
      label: "Pilih Pro",
      href: "/register?role=owner&plan=pro",
      variant: "outline",
    },
  },
];

export default function PartnerPricing() {
  return (
    <section id="pricing" className="py-24 border-b border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-gray-50 px-3.5 py-1 text-xs font-semibold text-gray-700">
            Pilihan Paket
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0b1c30]">
            Pilih paket sesuai skala arena Anda
          </h2>
          <p className="text-sm text-gray-500">
            Mulai gratis tanpa komitmen. Upgrade kapan saja saat unit lapangan bertambah.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular
                  ? "border-2 border-[#006e2f] bg-white shadow-xl shadow-emerald-950/5 md:-translate-y-2"
                  : "border border-gray-200/80 bg-white shadow-sm hover:shadow-md hover:border-gray-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 right-6">
                  <span className="inline-flex items-center rounded-full bg-[#006e2f] text-white px-3.5 py-1 text-[11px] font-bold shadow-xs tracking-wide uppercase">
                    Rekomendasi
                  </span>
                </div>
              )}

              <div className="p-7 sm:p-8">
                <span
                  className={`text-[11px] font-bold tracking-widest uppercase block ${
                    plan.popular ? "text-[#006e2f]" : "text-gray-400"
                  }`}
                >
                  {plan.name}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-[#0b1c30] mt-1">
                  {plan.subtitle}
                </h3>

                <div className="my-6">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0b1c30]">
                    {plan.price}
                  </span>
                  <span className="text-xs text-gray-400 font-medium ml-1">
                    {plan.period}
                  </span>
                </div>

                <div className="h-px w-full bg-gray-100 my-6" />

                <ul className="space-y-3.5 text-xs sm:text-sm">
                  {plan.features.map(({ text, highlight }) => (
                    <li key={text} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-[#006e2f] flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span className={highlight ? "font-semibold text-[#0b1c30]" : "text-gray-500"}>
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-7 sm:p-8 pt-0">
                <Link
                  href={plan.cta.href}
                  className={`w-full inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all h-11 px-5 shadow-xs ${
                    plan.popular
                      ? "bg-[#006e2f] hover:bg-[#005321] text-white shadow-md hover:shadow-lg"
                      : "border border-gray-200 bg-white hover:bg-gray-50 text-[#0b1c30] hover:text-[#006e2f] hover:border-[#006e2f]/30"
                  }`}
                >
                  {plan.cta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
