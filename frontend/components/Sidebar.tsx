import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-2xl font-bold text-green-600">Lapangin</h1>
      </div>

      {/* Menu Area */}
      <nav className="flex-1 p-4 space-y-2">
        <Link 
          href="/owner/dashboard" 
          className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition"
        >
          📊 Dashboard
        </Link>
        <Link 
          href="/owner/lapangan" 
          className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition"
        >
          🏟️ Data Lapangan
        </Link>
        <Link 
          href="/owner/pelanggan" 
          className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition"
        >
          👥 Data Pelanggan
        </Link>
      </nav>

      {/* Logout Area */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full px-4 py-2 text-left text-red-600 rounded-lg hover:bg-red-50 transition">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}