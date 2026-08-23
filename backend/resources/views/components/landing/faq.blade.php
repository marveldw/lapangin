<section id="faq" class="py-20 border-b border-border bg-muted/20">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="mb-12 text-center space-y-1">
            <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pertanyaan Umum</div>
            <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
        </div>

        <div class="divide-y divide-border border-y border-border text-sm">
            
            <!-- FAQ 1 -->
            <div class="py-4">
                <button onclick="toggleFaq(this)" class="w-full text-left font-medium text-foreground flex justify-between items-center py-2 group cursor-pointer">
                    <span class="text-sm font-semibold group-hover:text-primary transition-colors">Bagaimana mekanisme pencegahan jadwal bentrok bekerja?</span>
                    <svg class="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground shrink-0 ml-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
                <div class="faq-content hidden pt-1 pb-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Setiap reservasi yang diajukan akan melalui validasi ketersediaan di backend. Sistem memeriksa tanggal, jam mulai, jam selesai, dan ID unit lapangan secara atomik dengan database lock sebelum transaksi disimpan.
                </div>
            </div>

            <!-- FAQ 2 -->
            <div class="py-4">
                <button onclick="toggleFaq(this)" class="w-full text-left font-medium text-foreground flex justify-between items-center py-2 group cursor-pointer">
                    <span class="text-sm font-semibold group-hover:text-primary transition-colors">Apakah pelanggan bisa melihat lapangan berdasarkan lokasi terdekat?</span>
                    <svg class="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground shrink-0 ml-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
                <div class="faq-content hidden pt-1 pb-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Ya! Pelanggan dapat menjelajahi seluruh lapangan di kota atau kecamatan mereka tanpa harus login terlebih dahulu. Namun saat ingin melakukan reservasi slot jam, pelanggan akan diarahkan untuk login terlebih dahulu agar data booking terdata rapi.
                </div>
            </div>

            <!-- FAQ 3 -->
            <div class="py-4">
                <button onclick="toggleFaq(this)" class="w-full text-left font-medium text-foreground flex justify-between items-center py-2 group cursor-pointer">
                    <span class="text-sm font-semibold group-hover:text-primary transition-colors">Bagaimana batasan kuota paket Free diterapkan?</span>
                    <svg class="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground shrink-0 ml-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
                <div class="faq-content hidden pt-1 pb-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Ketika Owner pada paket Free mencoba menambahkan unit lapangan ke-2, sistem akan menghitung jumlah lapangan aktif dan menolak permintaan jika batas telah tercapai, disertai petunjuk upgrade ke paket Basic atau Pro.
                </div>
            </div>

            <!-- FAQ 4 -->
            <div class="py-4">
                <button onclick="toggleFaq(this)" class="w-full text-left font-medium text-foreground flex justify-between items-center py-2 group cursor-pointer">
                    <span class="text-sm font-semibold group-hover:text-primary transition-colors">Di mana pengelola/owner lapangan mengakses dashboard?</span>
                    <svg class="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground shrink-0 ml-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
                <div class="faq-content hidden pt-1 pb-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Owner dapat masuk melalui tombol "Area Pengelola" di bagian navigasi atas atau langsung ke halaman login Filament di portal khusus pengelola.
                </div>
            </div>

        </div>

    </div>
</section>

<script>
    function toggleFaq(btn) {
        const content = btn.nextElementSibling;
        const icon = btn.querySelector('svg');
        const isHidden = content.classList.contains('hidden');
        
        // Close all other open faqs
        document.querySelectorAll('.faq-content').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('#faq button svg').forEach(el => el.classList.remove('rotate-180'));

        if (isHidden) {
            content.classList.remove('hidden');
            if (icon) icon.classList.add('rotate-180');
        }
    }
</script>
