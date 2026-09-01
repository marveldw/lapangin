import Link from "next/link";
import Image from "next/image";

const FOOTER_LINKS = {
  Platform: [
    { label: "Sewa Lapangan", href: "/lapangan" },
    { label: "Open Match", href: "#" },
    { label: "Kota & Area", href: "#" },
    { label: "Aplikasi Mobile", href: "#" },
  ],
  "Untuk Owner": [
    { label: "Partner With Us", href: "/partner" },
    { label: "Cara Kerja Partner", href: "/partner#cara-kerja" },
    { label: "Hubungi Penjualan", href: "#" },
    { label: "Login Owner", href: "/owner/dashboard" },
  ],
  Perusahaan: [
    { label: "Tentang Kami", href: "#" },
    { label: "Karir", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Kontak", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 border-b border-gray-100 pb-12">
          
          {/* Brand Column */}
          <div className="sm:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                <Image
                  src="/logo.png"
                  alt="Lapangin Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-bold text-[#0b1c30] tracking-tight">Lapangin</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              Platform booking lapangan olahraga untuk pemain dan pemilik venue di seluruh Indonesia.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="flex flex-col gap-3.5">
              <h4 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
                {title}
              </h4>
              <div className="flex flex-col gap-2.5">
                {links.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="text-sm text-gray-500 hover:text-[#006e2f] transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 Lapangin Indonesia. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-[#006e2f] transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="hover:text-[#006e2f] transition-colors">
              Syarat &amp; Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
