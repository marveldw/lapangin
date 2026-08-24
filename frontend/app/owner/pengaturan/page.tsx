export default function PengaturanPage() {
  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      
      {/* Header Halaman */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#0b1c30]">Pengaturan</h1>
        <p className="text-base text-[#3d4a3d]">Kelola profil venue, rekening pencairan, dan keamanan akun Anda.</p>
      </div>

      {/* Tab Navigasi */}
      <div className="flex items-center gap-8 border-b border-[#bccbb9]/30">
        <button className="pb-3 border-b-2 border-[#006e2f] text-[#006e2f] font-semibold text-sm transition-colors">Profil Venue</button>
        <button className="pb-3 border-b-2 border-transparent text-[#3d4a3d] hover:text-[#0b1c30] font-semibold text-sm transition-colors">Rekening Bank</button>
        <button className="pb-3 border-b-2 border-transparent text-[#3d4a3d] hover:text-[#0b1c30] font-semibold text-sm transition-colors">Keamanan Akun</button>
      </div>

      {/* Container Utama dengan Background Biru Muda (#e5eeff) */}
      <div className="bg-[#e5eeff] rounded-xl shadow-sm p-8 flex flex-col gap-8 border border-white">
        
        {/* Bagian Logo Venue */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-sm relative group cursor-pointer border-2 border-white shrink-0">
            <img 
              alt="GOR Serbaguna Logo" 
              className="w-full h-full object-cover" 
              src="/logo.png"
            />
            <div className="absolute inset-0 bg-[#0b1c30]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white">edit</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <button className="px-4 py-2 rounded-lg font-semibold text-sm text-[#006e2f] bg-white border border-[#006e2f]/30 hover:bg-[#006e2f]/5 transition-colors shadow-sm w-fit">
              Ubah Logo
            </button>
            <p className="text-xs text-[#3d4a3d]">Format JPG, PNG max 2MB.</p>
          </div>
        </div>

        {/* Form Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#3d4a3d] uppercase tracking-wide">Nama Venue</label>
            <input 
              className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-lg text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#006e2f]/50 transition-all shadow-sm" 
              type="text" 
              defaultValue="GOR Serbaguna" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#3d4a3d] uppercase tracking-wide">Email Venue</label>
            <input 
              className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-lg text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#006e2f]/50 transition-all shadow-sm" 
              type="email" 
              defaultValue="admin@gorserbaguna.com" 
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-[#3d4a3d] uppercase tracking-wide">Nomor Telepon</label>
            <input 
              className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-lg text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#006e2f]/50 transition-all shadow-sm md:w-1/2" 
              type="tel" 
              defaultValue="081234567890" 
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-[#3d4a3d] uppercase tracking-wide">Alamat Lengkap</label>
            <textarea 
              className="px-4 py-2.5 bg-white border border-[#bccbb9]/40 rounded-lg text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#006e2f]/50 transition-all shadow-sm resize-none" 
              rows={3} 
              defaultValue="Jl. Sudirman No. 123, Jakarta Selatan"
            ></textarea>
          </div>

        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end pt-2">
          <button className="px-6 py-2.5 rounded-lg bg-[#006e2f] text-white font-semibold text-sm hover:bg-[#005321] transition-colors shadow-md hover:shadow-lg">
            Simpan Profil
          </button>
        </div>

      </div>
    </div>
  );
}