import Link from 'next/link';

export default function TambahBookingManual() {
  return (
    <div className="w-full h-full pb-24">
      <div className="max-w-[800px] mx-auto w-full">
        
        {/* Tombol Kembali */}
        <Link 
          href="/owner/booking" 
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#3d4a3d] hover:text-[#006e2f] transition-colors mb-6 group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Kembali ke Manajemen Booking
        </Link>

        {/* Header Halaman */}
        <div className="mb-10 relative pl-6">
          {/* Garis Hijau di Kiri */}
          <div className="absolute left-0 top-1 h-full w-1.5 bg-[#006e2f] rounded-r-full"></div>
          <h1 className="text-3xl font-bold text-[#0b1c30] mb-2">Buat Booking Manual</h1>
          <p className="text-base text-[#3d4a3d] max-w-2xl">
            Masukkan data pemesanan lapangan dari pelanggan yang walk-in atau via WhatsApp.
          </p>
        </div>

        {/* Area Form */}
        <div className="flex flex-col gap-8">
          
          {/* Card 1: Data Pelanggan */}
          <section className="bg-[#ffffff] rounded-xl shadow-sm ring-1 ring-[#bccbb9]/30 overflow-hidden">
            <div className="p-6 flex items-center gap-4 bg-[#f8f9ff] border-b border-[#bccbb9]/30">
              <div className="w-10 h-10 rounded-full bg-[#e5eeff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#006e2f]">person</span>
              </div>
              <h2 className="text-xl font-bold text-[#0b1c30]">Data Pelanggan</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#3d4a3d]" htmlFor="nama_pelanggan">Nama Pelanggan</label>
                <input 
                  className="w-full bg-[#f8f9ff] px-4 py-2.5 rounded-lg border-none ring-1 ring-[#bccbb9]/50 focus:ring-2 focus:ring-[#006e2f] text-base text-[#0b1c30] placeholder:text-[#3d4a3d]/50 transition-shadow outline-none" 
                  id="nama_pelanggan" 
                  placeholder="Contoh: Budi Mulyono" 
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#3d4a3d]" htmlFor="no_wa">Nomor WhatsApp</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-[#3d4a3d]">+62</span>
                  <input 
                    className="w-full bg-[#f8f9ff] pl-12 pr-4 py-2.5 rounded-lg border-none ring-1 ring-[#bccbb9]/50 focus:ring-2 focus:ring-[#006e2f] text-base text-[#0b1c30] placeholder:text-[#3d4a3d]/50 transition-shadow outline-none" 
                    id="no_wa" 
                    placeholder="81234567890" 
                    type="tel"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Detail Lapangan & Jadwal */}
          <section className="bg-[#ffffff] rounded-xl shadow-sm ring-1 ring-[#bccbb9]/30 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#006e2f]/5 rounded-bl-full blur-2xl pointer-events-none"></div>
            <div className="p-6 flex items-center gap-4 bg-[#f8f9ff] border-b border-[#bccbb9]/30 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#e5eeff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#006e2f]">stadium</span>
              </div>
              <h2 className="text-xl font-bold text-[#0b1c30]">Detail Lapangan & Jadwal</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-[#3d4a3d]" htmlFor="lapangan">Pilih Lapangan</label>
                <div className="relative">
                  <select 
                    defaultValue=""
                    className="w-full bg-[#f8f9ff] px-4 py-2.5 rounded-lg border-none ring-1 ring-[#bccbb9]/50 focus:ring-2 focus:ring-[#006e2f] text-base text-[#0b1c30] appearance-none outline-none cursor-pointer transition-shadow" 
                    id="lapangan"
                  >
                    <option disabled value="">Pilih salah satu...</option>
                    <option value="1">Lapangan A (Futsal Vinyl)</option>
                    <option value="2">Lapangan B (Basket Semi-Indoor)</option>
                    <option value="3">Lapangan C (Badminton)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#3d4a3d]" htmlFor="tanggal">Tanggal Main</label>
                <input 
                  className="w-full bg-[#f8f9ff] px-4 py-2.5 rounded-lg border-none ring-1 ring-[#bccbb9]/50 focus:ring-2 focus:ring-[#006e2f] text-base text-[#0b1c30] transition-shadow outline-none" 
                  id="tanggal" 
                  type="date"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#3d4a3d]" htmlFor="jam_mulai">Jam Mulai</label>
                <div className="relative">
                  <select 
                    defaultValue=""
                    className="w-full bg-[#f8f9ff] px-4 py-2.5 rounded-lg border-none ring-1 ring-[#bccbb9]/50 focus:ring-2 focus:ring-[#006e2f] text-base text-[#0b1c30] appearance-none outline-none cursor-pointer transition-shadow" 
                    id="jam_mulai"
                  >
                    <option disabled value="">Pilih Jam</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                    <option value="21:00">21:00</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">schedule</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-[#3d4a3d]" htmlFor="durasi">Durasi Main</label>
                <div className="relative">
                  <select 
                    defaultValue="2"
                    className="w-full bg-[#f8f9ff] px-4 py-2.5 rounded-lg border-none ring-1 ring-[#bccbb9]/50 focus:ring-2 focus:ring-[#006e2f] text-base text-[#0b1c30] appearance-none outline-none cursor-pointer transition-shadow" 
                    id="durasi"
                  >
                    <option value="1">1 Jam</option>
                    <option value="2">2 Jam</option>
                    <option value="3">3 Jam</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">timelapse</span>
                </div>
              </div>
            </div>
          </section>

          {/* Card 3: Rincian Pembayaran */}
          <section className="bg-[#ffffff] rounded-xl shadow-sm ring-1 ring-[#bccbb9]/30 overflow-hidden">
            <div className="p-6 flex items-center gap-4 bg-[#f8f9ff] border-b border-[#bccbb9]/30">
              <div className="w-10 h-10 rounded-full bg-[#e5eeff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#006e2f]">payments</span>
              </div>
              <h2 className="text-xl font-bold text-[#0b1c30]">Rincian Pembayaran</h2>
            </div>
            <div className="p-6 flex flex-col md:flex-row gap-8 md:items-center">
              
              {/* Total Harga */}
              <div className="flex-1 bg-[#f8f9ff] p-6 rounded-xl flex flex-col justify-center items-center md:items-start text-center md:text-left h-full border border-[#bccbb9]/30">
                <span className="text-xs font-bold text-[#3d4a3d] uppercase tracking-widest mb-2 block">Total Tagihan</span>
                <span className="text-4xl font-bold text-[#0b1c30] tracking-tight">Rp 300.000</span>
              </div>
              
              {/* Status & Metode */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-[#3d4a3d]">Status Pembayaran</span>
                  <div className="grid grid-cols-3 gap-3">
                    <label className="cursor-pointer group">
                      <input className="peer sr-only" name="status_bayar" type="radio" value="lunas" />
                      <div className="text-center px-2 py-2.5 rounded-lg ring-1 ring-[#bccbb9]/50 peer-checked:ring-2 peer-checked:ring-[#006e2f] peer-checked:bg-[#22c55e]/10 transition-all">
                        <span className="text-sm font-bold text-[#3d4a3d] peer-checked:text-[#006e2f] group-hover:text-[#006e2f]">Lunas</span>
                      </div>
                    </label>
                    <label className="cursor-pointer group">
                      <input defaultChecked className="peer sr-only" name="status_bayar" type="radio" value="dp" />
                      <div className="text-center px-2 py-2.5 rounded-lg ring-1 ring-[#bccbb9]/50 peer-checked:ring-2 peer-checked:ring-[#006e2f] peer-checked:bg-[#22c55e]/10 transition-all">
                        <span className="text-sm font-bold text-[#3d4a3d] peer-checked:text-[#006e2f] group-hover:text-[#006e2f]">DP 50%</span>
                      </div>
                    </label>
                    <label className="cursor-pointer group">
                      <input className="peer sr-only" name="status_bayar" type="radio" value="belum" />
                      <div className="text-center px-2 py-2.5 rounded-lg ring-1 ring-[#bccbb9]/50 peer-checked:ring-2 peer-checked:ring-[#ba1a1a] peer-checked:bg-[#ffdad6]/30 transition-all">
                        <span className="text-sm font-bold text-[#3d4a3d] peer-checked:text-[#ba1a1a] group-hover:text-[#ba1a1a]">Belum</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#3d4a3d]" htmlFor="metode_bayar">Metode Pembayaran</label>
                  <div className="relative">
                    <select 
                      defaultValue="qris"
                      className="w-full bg-[#f8f9ff] px-4 py-2.5 rounded-lg border-none ring-1 ring-[#bccbb9]/50 focus:ring-2 focus:ring-[#006e2f] text-base text-[#0b1c30] appearance-none outline-none cursor-pointer transition-shadow" 
                      id="metode_bayar"
                    >
                      <option value="transfer">Transfer Bank</option>
                      <option value="qris">QRIS</option>
                      <option value="cash">Cash / Tunai</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3d4a3d] pointer-events-none">account_balance_wallet</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-72 right-0 bg-[#ffffff]/95 backdrop-blur-md border-t border-[#bccbb9]/30 p-4 px-8 shadow-[0_-4px_16px_rgba(0,0,0,0.02)] z-40 flex items-center justify-end gap-4">
        <Link 
          href="/owner/booking" 
          className="px-6 py-2.5 rounded-lg font-bold text-sm text-[#3d4a3d] hover:bg-[#f8f9ff] hover:text-[#0b1c30] transition-colors"
        >
          Batal
        </Link>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#006e2f] hover:bg-[#005321] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0">
          <span className="material-symbols-outlined text-[20px]">save</span>
          Buat Booking
        </button>
      </div>

    </div>
  );
}