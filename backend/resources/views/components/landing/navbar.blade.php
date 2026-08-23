<header class="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <!-- Brand -->
        <div class="flex items-center gap-8">
            <a href="/" class="flex items-center gap-2.5 transition-transform hover:scale-105">
                <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="7" height="7" x="3" y="3" rx="1" />
                        <rect width="7" height="7" x="14" y="3" rx="1" />
                        <rect width="7" height="7" x="14" y="14" rx="1" />
                        <rect width="7" height="7" x="3" y="14" rx="1" />
                    </svg>
                </div>
                <span class="font-bold text-base tracking-tight">Lapangin</span>
            </a>

            <!-- Desktop Navigation Links -->
            <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <a href="#fitur" class="transition-colors hover:text-foreground">Fitur</a>
                <a href="#cara-kerja" class="transition-colors hover:text-foreground">Cara Kerja</a>
                <a href="#pricing" class="transition-colors hover:text-foreground">Harga</a>
                <a href="#faq" class="transition-colors hover:text-foreground">FAQ</a>
            </nav>
        </div>

        <!-- Desktop Action Buttons -->
        <div class="hidden md:flex items-center gap-2.5">
            <a href="/login" class="inline-flex items-center justify-center rounded-md text-xs font-semibold text-muted-foreground transition-all hover:text-foreground hover:bg-muted/60 h-9 px-3 gap-1.5 border border-transparent hover:border-border">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" x2="3" y1="12" y2="12" />
                </svg>
                <span>Masuk</span>
            </a>
            
            <a href="/register?plan=free" class="inline-flex items-center justify-center rounded-md text-xs font-medium transition-all bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 h-9 px-4 gap-1.5">
                <span>Mulai Free</span>
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                </svg>
            </a>
        </div>

        <!-- Mobile Hamburger Button -->
        <div class="flex md:hidden items-center">
            <button id="mobile-menu-btn" type="button" class="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring" aria-expanded="false">
                <span class="sr-only">Buka menu utama</span>
                <svg id="hamburger-icon" class="h-5 w-5 block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
                <svg id="close-icon" class="h-5 w-5 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </button>
        </div>

    </div>

    <!-- Mobile Drawer Menu -->
    <div id="mobile-menu" class="hidden md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
        <nav class="flex flex-col space-y-3 pt-2 text-sm font-medium text-muted-foreground">
            <a href="#fitur" class="px-2 py-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors">Fitur</a>
            <a href="#cara-kerja" class="px-2 py-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors">Cara Kerja</a>
            <a href="#pricing" class="px-2 py-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors">Harga</a>
            <a href="#faq" class="px-2 py-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors">FAQ</a>
        </nav>
        
        <div class="flex flex-col gap-2 pt-2 border-t border-border">
            <a href="/login" class="w-full inline-flex items-center justify-center rounded-md text-xs font-semibold border border-border bg-background hover:bg-muted h-9 px-3 gap-1.5">
                <svg class="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" x2="3" y1="12" y2="12" />
                </svg>
                <span>Masuk Akun</span>
            </a>
            <a href="/register?plan=free" class="w-full inline-flex items-center justify-center rounded-md text-xs font-semibold bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-3.5 gap-1.5">
                <span>Daftar Gratis</span>
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
            </a>
        </div>
    </div>
</header>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const hamburgerIcon = document.getElementById('hamburger-icon');
        const closeIcon = document.getElementById('close-icon');

        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
                menuBtn.setAttribute('aria-expanded', !isExpanded);
                mobileMenu.classList.toggle('hidden');
                hamburgerIcon.classList.toggle('hidden');
                closeIcon.classList.toggle('hidden');
            });

            // Close on link click
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                    hamburgerIcon.classList.remove('hidden');
                    closeIcon.classList.add('hidden');
                    menuBtn.setAttribute('aria-expanded', 'false');
                });
            });
        }
    });
</script>
