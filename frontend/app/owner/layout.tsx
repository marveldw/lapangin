import Sidebar from "../../components/Sidebar";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f8f9ff]"> 
      <Sidebar />
      
      {/* Area Kanan (Top Bar + Konten) */}
      <div className="pl-72 w-full flex flex-col overflow-hidden">
        
        {/* Top Bar (Navbar Atas) */}
        <header className="fixed top-0 left-72 right-0 h-20 bg-white/80 backdrop-blur-xl z-40 px-8 flex items-center justify-between border-b border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-[#006e2f] font-semibold">
            <span className="material-symbols-outlined">location_on</span>
            <span className="text-gray-800 text-lg font-bold">GOR Serbaguna</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-sm text-gray-800">Budi Santoso</p>
                <p className="text-xs text-gray-500">Venue Owner</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#006e2f] text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="relative pt-20 min-h-screen bg-[#f8f9ff] px-8 py-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}