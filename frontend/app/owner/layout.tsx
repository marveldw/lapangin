import Sidebar from "../../components/Sidebar";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] text-base min-h-screen">
      <Sidebar />
      
      <div className="pl-72 w-full">
        {/* Top Header */}
        <header className="fixed top-0 left-72 right-0 h-20 bg-[#f8f9ff]/80 backdrop-blur-xl z-40 px-8 flex items-center justify-between border-b border-[#bccbb9]/30 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#006e2f]">location_on</span>
            <span className="text-xl font-semibold">GOR Serbaguna</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative flex items-center p-2 text-[#3d4a3d] hover:bg-[#eff4ff] rounded-full transition-colors cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
              <div className="absolute top-1 right-1 w-2 h-2 bg-[#ba1a1a] rounded-full"></div>
            </div>
            
            <div className="flex items-center gap-4 pl-6 border-l border-[#bccbb9]/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold tracking-wide text-[#0b1c30]">Budi Santoso</p>
                <p className="text-xs font-medium text-[#3d4a3d]">Venue Owner</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#006e2f] flex items-center justify-center shadow-md border-2 border-[#ffffff]">
                <span className="material-symbols-outlined text-[#ffffff] text-[20px]">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Konten Utama */}
        <main className="relative pt-20 min-h-screen bg-[#f8f9ff] px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}