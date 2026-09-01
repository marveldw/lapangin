import Link from 'next/link';

export default function TambahLapangan() {
  return (
    <div className="flex flex-col w-full gap-8 max-w-5xl mx-auto pb-24">
      
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <Link 
          href="/owner/lapangan" 
          className="flex items-center text-[#3d4a3d] hover:text-[#006e2f] transition-colors text-sm font-semibold w-fit group"
        >
          <span className="material-symbols-outlined mr-1 text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Kembali ke Manajemen Lapangan
        </Link>
        <h1 className="text-3xl font-bold text-[#0b1c30] tracking-tight mt-2">Tambah Lapangan Baru</h1>
        <p className="text-base text-[#3d4a3d] max-w-2xl">
          Lengkapi detail informasi lapangan olahraga di bawah ini. Pastikan harga dan ketersediaan sesuai dengan kebijakan operasional venue Anda.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Card 1: Informasi Umum */}
        <section className="bg-[#ffffff] rounded-xl shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[#006e2f]">
              <span className="material-symbols-outlined text-[20px]">info</span>
            </div>
            <h2 className="text-xl font-semibold text-[#0b1c30]">Informasi Umum</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#0b1c30]" htmlFor="nama_lapangan">
                Nama Lapangan <span className="text-[#ba1a1a]">*</span>
              </label>
              <input 
                className="bg-[#f8f9ff] text-[#0b1c30] placeholder:text-[#3d4a3d]/50 px-4 py-2 rounded-lg ring-1 ring-[#bccbb9]/30 focus:ring-2 focus:ring-[#006e2f] focus:outline-none transition-all text-base h-12 shadow-[0_1px_2px_rgba(15,23,42,0.04)]" 
                id="nama_lapangan" 
                placeholder="Contoh: Lapangan Bulutangkis A" 
                type="text"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#0b1c30]" htmlFor="jenis_olahraga">
                Jenis Olahraga <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <select 
                  defaultValue=""
                  className="appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-2 rounded-lg ring-1 ring-[#bccbb9]/30 focus:ring-2 focus:ring-[#006e2f] focus:outline-none transition-all text-base h-12 shadow-[0_1px_2px_rgba(15,23,42,0.04)]" 
                  id="jenis_olahraga"
                >
                  <option disabled value="">Pilih jenis olahraga</option>
                  <option value="bulutangkis">Bulutangkis</option>
                  <option value="futsal">Futsal</option>
                  <option value="basket">Basket</option>
                  <option value="tenis">Tenis Meja</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#0b1c30]" htmlFor="harga">
              Harga per Jam <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#3d4a3d] font-semibold select-none">Rp</span>
              <input 
                className="w-full bg-[#f8f9ff] text-[#0b1c30] placeholder:text-[#3d4a3d]/50 pl-12 pr-4 py-2 rounded-lg ring-1 ring-[#bccbb9]/30 focus:ring-2 focus:ring-[#006e2f] focus:outline-none transition-all text-base h-12 shadow-[0_1px_2px_rgba(15,23,42,0.04)]" 
                id="harga" 
                placeholder="0" 
                type="number"
              />
            </div>
            <p className="text-xs font-medium text-[#3d4a3d] mt-1">Harga dasar penyewaan. Anda dapat mengatur harga khusus (weekend/malam) di menu Jadwal.</p>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#0b1c30]" htmlFor="deskripsi">Deskripsi Fasilitas</label>
            <textarea 
              className="w-full bg-[#f8f9ff] text-[#0b1c30] placeholder:text-[#3d4a3d]/50 px-4 py-3 rounded-lg ring-1 ring-[#bccbb9]/30 focus:ring-2 focus:ring-[#006e2f] focus:outline-none transition-all text-base shadow-[0_1px_2px_rgba(15,23,42,0.04)] resize-y" 
              id="deskripsi" 
              placeholder="Jelaskan fasilitas lapangan, jenis lantai (karpet/vinyl/parket), ketersediaan bola, dll." 
              rows={3}
            ></textarea>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-lg mt-2 ring-1 ring-[#bccbb9]/20">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#0b1c30]">Status Lapangan</span>
              <span className="text-xs text-[#3d4a3d]">Tentukan apakah lapangan ini aktif dan bisa dibooking oleh pelanggan.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer group">
              <input defaultChecked className="sr-only peer" type="checkbox" />
              <div className="w-11 h-6 bg-[#bec6e0] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#006e2f]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006e2f]"></div>
              <span className="ml-3 text-sm font-semibold text-[#006e2f] peer-checked:text-[#006e2f] transition-colors">Aktif</span>
            </label>
          </div>
        </section>

        {/* Card 2: Lokasi Lapangan */}
        <section className="bg-[#ffffff] rounded-xl shadow-sm p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-64 h-64 bg-[#006e2f]/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-[#dae2fd] flex items-center justify-center text-[#131b2e]">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
            </div>
            <h2 className="text-xl font-semibold text-[#0b1c30]">Lokasi Lapangan</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#0b1c30]" htmlFor="provinsi">Provinsi</label>
              <div className="relative">
                <select defaultValue="" className="appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-2 rounded-lg ring-1 ring-[#bccbb9]/30 focus:ring-2 focus:ring-[#006e2f] focus:outline-none transition-all text-base h-12 shadow-[0_1px_2px_rgba(15,23,42,0.04)]" id="provinsi">
                  <option disabled value="">Pilih Provinsi</option>
                  <option value="dki_jakarta">DKI Jakarta</option>
                  <option value="jawa_barat">Jawa Barat</option>
                  <option value="banten">Banten</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#0b1c30]" htmlFor="kota">Kota/Kabupaten</label>
              <div className="relative">
                <select defaultValue="" className="appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-2 rounded-lg ring-1 ring-[#bccbb9]/30 focus:ring-2 focus:ring-[#006e2f] focus:outline-none transition-all text-base h-12 shadow-[0_1px_2px_rgba(15,23,42,0.04)]" id="kota">
                  <option disabled value="">Pilih Kota</option>
                  <option value="jakarta_selatan">Jakarta Selatan</option>
                  <option value="jakarta_pusat">Jakarta Pusat</option>
                  <option value="depok">Depok</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#0b1c30]" htmlFor="kecamatan">Kecamatan</label>
              <div className="relative">
                <select defaultValue="" className="appearance-none w-full bg-[#f8f9ff] text-[#0b1c30] px-4 py-2 rounded-lg ring-1 ring-[#bccbb9]/30 focus:ring-2 focus:ring-[#006e2f] focus:outline-none transition-all text-base h-12 shadow-[0_1px_2px_rgba(15,23,42,0.04)]" id="kecamatan">
                  <option disabled value="">Pilih Kecamatan</option>
                  <option value="tebet">Tebet</option>
                  <option value="kebayoran_baru">Kebayoran Baru</option>
                  <option value="pancoran">Pancoran</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 relative z-10">
            <label className="text-sm font-semibold text-[#0b1c30]" htmlFor="alamat">Alamat Lengkap</label>
            <textarea 
              className="w-full bg-[#f8f9ff] text-[#0b1c30] placeholder:text-[#3d4a3d]/50 px-4 py-3 rounded-lg ring-1 ring-[#bccbb9]/30 focus:ring-2 focus:ring-[#006e2f] focus:outline-none transition-all text-base shadow-[0_1px_2px_rgba(15,23,42,0.04)] resize-y" 
              id="alamat" 
              placeholder="Masukkan nama jalan, nomor bangunan, dan patokan terdekat." 
              rows={2}
            ></textarea>
          </div>
          
          {/* Map Visualization */}
          <div className="w-full h-32 mt-1 rounded-lg overflow-hidden bg-[#e5eeff] relative z-10 shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] ring-1 ring-[#bccbb9]/20 flex items-center justify-center">
            <span className="text-[#3d4a3d] font-semibold text-sm flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-[#006e2f] text-3xl">map</span>
              Pratinjau Lokasi Peta
            </span>
          </div>
        </section>

        {/* Card 3: Media Visual */}
        <section className="bg-[#ffffff] rounded-xl shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#82abff]/30 flex items-center justify-center text-[#005ac2]">
              <span className="material-symbols-outlined text-[20px]">imagesmode</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-[#0b1c30]">Media Visual</h2>
              <p className="text-xs font-medium text-[#3d4a3d]">Unggah foto lapangan yang menarik. Foto utama akan ditampilkan pertama kali di halaman pelanggan.</p>
            </div>
          </div>
          
          {/* Upload Zone */}
          <div className="w-full h-48 rounded-xl border-2 border-dashed border-[#bccbb9] hover:border-[#006e2f] bg-[#f8f9ff] hover:bg-[#eff4ff] transition-all flex flex-col items-center justify-center cursor-pointer group">
            <div className="w-16 h-16 mb-4 rounded-full bg-[#e5eeff] group-hover:bg-[#006e2f]/10 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-[32px] text-[#3d4a3d] group-hover:text-[#006e2f] transition-colors">cloud_upload</span>
            </div>
            <p className="text-sm font-semibold text-[#0b1c30] group-hover:text-[#006e2f] transition-colors">Klik untuk unggah atau seret gambar ke sini</p>
            <p className="text-xs text-[#3d4a3d] mt-1">Mendukung format JPG, PNG (Maksimal 5MB)</p>
          </div>
          
          {/* Image Previews */}
          <div className="flex gap-4 mt-2 overflow-x-auto pb-2">
            <div className="relative w-40 h-28 rounded-lg overflow-hidden group shrink-0 ring-2 ring-[#006e2f]">
              <img alt="Lapangan" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1XLWxE-oVF1ZJoQjq1MOddR1eO920rWZ_YTeuIX-CLSYklJ6Rwy5TfJdNX5maBP2CDBnsMXzKdQGDyZspNVL7tX9P0gWujQuKYEDHq-9NFLA_rGkUXRhqYI69XH20nFoJ3ff4Lv1zeDl2BOBTPb7xqPB-8Epk80bTE5_8ESjQhNzxIkg4-dSov6dsGJHRDle55-v4ARwXxzZPm3o81VEgWZFZqdNPRa7pmSx_S49oaVeN2bSMvXBZGdIgpq"/>
              <div className="absolute inset-0 bg-[#213145]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button aria-label="Lihat Gambar" className="w-8 h-8 rounded-full bg-[#ffffff] text-[#0b1c30] flex items-center justify-center hover:bg-[#e5eeff] transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                </button>
                <button aria-label="Hapus Gambar" className="w-8 h-8 rounded-full bg-[#ba1a1a] text-[#ffffff] flex items-center justify-center hover:bg-[#ba1a1a]/90 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#213145]/80 to-transparent p-2 pt-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#006e2f] text-[#ffffff] shadow-sm">Foto Utama</span>
              </div>
            </div>
            
            <div className="relative w-40 h-28 rounded-lg overflow-hidden group shrink-0 ring-1 ring-[#bccbb9]/30">
              <img alt="Lapangan" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VbCBUOpjYgNxvxoJla1gyoLEOpZ0a2Vk4a-H1G0gwqTo64ce414vKwW7sYk1pS-wYobX-WbW_8gV6nylulivSiU64jqbOYvkN3hiAF09fgilkcIQF9tCpK0G97YJTuUUU8KpWPGicnCPlN8j7YtU39q2glmLHHr4cWzpmU6BPlF0h5M_JvUXnIG5FhZhxVyYJbf5C37PynDYANHocFH9HxzF_pbCldI4u96v2aKDWZmHBNAxP1cZDNCMg"/>
              <div className="absolute inset-0 bg-[#213145]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button aria-label="Lihat Gambar" className="w-8 h-8 rounded-full bg-[#ffffff] text-[#0b1c30] flex items-center justify-center hover:bg-[#e5eeff] transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                </button>
                <button aria-label="Hapus Gambar" className="w-8 h-8 rounded-full bg-[#ba1a1a] text-[#ffffff] flex items-center justify-center hover:bg-[#ba1a1a]/90 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
            
            <div className="w-40 h-28 rounded-lg border border-dashed border-[#bccbb9] bg-[#f8f9ff] flex flex-col items-center justify-center text-[#3d4a3d]/50 shrink-0 cursor-pointer hover:bg-[#eff4ff] hover:text-[#006e2f] transition-colors">
              <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
              <span className="text-[10px] font-semibold mt-1">Tambah Lagi</span>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-8 mt-6 self-end flex items-center gap-4 bg-[#ffffff]/80 backdrop-blur-md p-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] ring-1 ring-[#bccbb9]/10 z-30">
        <Link href="/owner/lapangan" className="px-6 py-2.5 rounded-lg font-semibold text-sm text-[#565e74] hover:bg-[#565e74]/10 transition-colors flex items-center justify-center">
          Batal
        </Link>
        <button className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-[#006e2f] text-[#ffffff] hover:bg-[#006e2f]/90 transition-all shadow-[0_2px_8px_rgba(0,110,47,0.3)] hover:shadow-[0_4px_12px_rgba(0,110,47,0.4)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">save</span>
          Simpan Lapangan
        </button>
      </div>
    </div>
  );
}