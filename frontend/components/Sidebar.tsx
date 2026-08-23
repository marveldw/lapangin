import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col shadow-[1px_0_8px_rgba(0,0,0,0.02)] border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 mb-6">
        <div className="h-8 w-8 bg-[#22c55e] text-white flex items-center justify-center rounded-lg font-bold text-lg">L</div>
        <span className="text-xl font-bold text-[#006e2f] tracking-tight">Lapangin</span>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 px-4 space-y-1">
        <Link href="/owner/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#22c55e] text-white font-semibold transition-all">
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </Link>
        <Link href="/owner/lapangan" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-gray-900 transition-all">
          <span className="material-symbols-outlined">stadium</span>
          <span>Lapangan</span>
        </Link>
        <Link href="/owner/jadwal" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-gray-900 transition-all">
          <span className="material-symbols-outlined">calendar_month</span>
          <span>Jadwal</span>
        </Link>
        <Link href="/owner/booking" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-gray-900 transition-all">
          <span className="material-symbols-outlined">confirmation_number</span>
          <span>Booking</span>
        </Link>
        <Link href="/owner/pendapatan" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-gray-900 transition-all">
          <span className="material-symbols-outlined">payments</span>
          <span>Pendapatan</span>
        </Link>
        <Link href="/owner/pelanggan" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-gray-900 transition-all">
          <span className="material-symbols-outlined">group</span>
          <span>Pelanggan</span>
        </Link>
        <Link href="/owner/pengaturan" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-gray-900 transition-all">
          <span className="material-symbols-outlined">settings</span>
          <span>Pengaturan</span>
        </Link>
      </nav>

      {/* Footer Sidebar (Upgrade Plan) */}
      <div className="p-6 mt-auto">
        <div className="bg-[#e5eeff] rounded-2xl p-4">
          <p className="text-xs text-gray-600 mb-2 font-medium">Plan: Pro Elite</p>
          <button className="w-full bg-[#006e2f] text-white py-2 rounded-xl font-semibold hover:bg-[#005321] transition-colors shadow-sm">
            Upgrade Plan
          </button>
        </div>
      </div>
    </aside>
  );
}