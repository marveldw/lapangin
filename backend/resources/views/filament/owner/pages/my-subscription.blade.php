<x-filament-panels::page>

    <div style="display: flex; flex-direction: column; gap: 1.5rem;">

        <!-- 1. NOTIFIKASI PENGAJUAN PENDING (Jika Ada Pengajuan Menunggu Approval Admin) -->
        @if($pendingSubscription)
            <div style="border-radius: 0.75rem; border: 2px solid rgb(245, 158, 11); background-color: rgba(245, 158, 11, 0.08); padding: 1.25rem;">
                <div style="display: flex; flex-direction: column; md:flex-row; justify-content: space-between; gap: 1rem;">
                    <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                        <div style="color: rgb(245, 158, 11); width: 24px; height: 24px; min-width: 24px; margin-top: 0.125rem;">
                            <x-filament::icon icon="heroicon-o-clock" style="width: 24px; height: 24px;" />
                        </div>
                        <div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-size: 0.875rem; font-weight: 700; color: inherit;">
                                    Pengajuan Upgrade ke Paket {{ $pendingSubscription->plan?->name }} Sedang Diproses
                                </span>
                                <x-filament::badge color="warning" size="sm">
                                    MENUNGGU PERSETUJUAN ADMIN
                                </x-filament::badge>
                            </div>
                            <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; line-height: 1.4;">
                                Total Tagihan: <strong style="color: inherit;">Rp {{ number_format($pendingSubscription->plan?->price ?? 0, 0, ',', '.') }}</strong>.<br>
                                Silakan transfer ke rekening: <strong>Bank BCA 123-456-7890 a.n PT Lapangin Indonesia</strong>.<br>
                                Paket akan otomatis aktif setelah pembayaran diverifikasi dan disetujui oleh Super Admin.
                            </p>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center;">
                        <x-filament::button 
                            color="danger" 
                            size="sm"
                            wire:click="cancelPendingRequest"
                            wire:confirm="Apakah Anda yakin ingin membatalkan pengajuan upgrade ini?">
                            Batalkan Pengajuan
                        </x-filament::button>
                    </div>
                </div>
            </div>
        @endif

        <!-- 2. Ringkasan Status & Kuota Aktif (Sleek Banner) -->
        <x-filament::section>
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
                
                <!-- Info Paket Aktif -->
                <div style="display: flex; align-items: center; gap: 0.875rem;">
                    <div style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; min-width: 44px; border-radius: 0.5rem; background-color: rgba(16, 185, 129, 0.1); color: rgb(16, 185, 129);">
                        <x-filament::icon icon="heroicon-o-sparkles" style="width: 24px; height: 24px;" />
                    </div>
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Status Langganan</span>
                            <x-filament::badge color="success" size="sm">
                                {{ $subscription?->status ?? 'ACTIVE' }}
                            </x-filament::badge>
                        </div>
                        <div style="font-size: 1.125rem; font-weight: 700; color: inherit; margin-top: 0.125rem;">
                            Paket {{ $subscription?->plan?->name ?? 'FREE' }} — {{ $subscription?->plan?->description ?? 'Paket Percobaan' }}
                        </div>
                        <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.125rem;">
                            Aktif sejak {{ $subscription ? \Illuminate\Support\Carbon::parse($subscription->start_date)->format('d M Y') : date('d M Y') }}
                        </div>
                    </div>
                </div>

                <!-- Pemakaian Kuota (Metric Pills) -->
                <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem;">
                    
                    <!-- Kuota Lapangan -->
                    <div style="border-radius: 0.5rem; padding: 0.5rem 1rem; border: 1px solid rgba(156, 163, 175, 0.2); background-color: rgba(156, 163, 175, 0.05);">
                        <div style="font-size: 0.6875rem; font-weight: 500; color: #6b7280;">Unit Lapangan</div>
                        <div style="font-size: 0.875rem; font-weight: 700; margin-top: 0.125rem;">
                            {{ $usageStats['court_count'] }} <span style="font-size: 0.75rem; font-weight: 400; color: #6b7280;">/ {{ $usageStats['court_max'] }} unit</span>
                        </div>
                    </div>

                    <!-- Kuota Booking -->
                    <div style="border-radius: 0.5rem; padding: 0.5rem 1rem; border: 1px solid rgba(156, 163, 175, 0.2); background-color: rgba(156, 163, 175, 0.05);">
                        <div style="font-size: 0.6875rem; font-weight: 500; color: #6b7280;">Booking Bulan Ini</div>
                        <div style="font-size: 0.875rem; font-weight: 700; margin-top: 0.125rem;">
                            {{ $usageStats['booking_count'] }} <span style="font-size: 0.75rem; font-weight: 400; color: #6b7280;">/ {{ $usageStats['booking_max'] }}</span>
                        </div>
                    </div>

                </div>

            </div>
        </x-filament::section>

        <!-- 3. Pilihan Upgrade Paket -->
        <div>
            <div style="margin-bottom: 0.875rem;">
                <h3 style="font-size: 1rem; font-weight: 700;">Pilihan Paket Langganan</h3>
                <p style="font-size: 0.75rem; color: #6b7280;">Pilih paket yang sesuai untuk meningkatkan kapasitas unit lapangan dan kuota reservasi.</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
                @foreach($plans as $plan)
                    @php
                        $isCurrent = ($subscription?->plan_id === $plan->plan_id) || (!$subscription && $plan->name === 'FREE');
                        $isPending = ($pendingSubscription?->plan_id === $plan->plan_id);
                    @endphp

                    <div style="border-radius: 0.75rem; border: {{ $isCurrent ? '2px solid rgb(16, 185, 129)' : ($isPending ? '2px solid rgb(245, 158, 11)' : '1px solid rgba(156, 163, 175, 0.2)') }}; background-color: {{ $isCurrent ? 'rgba(16, 185, 129, 0.03)' : ($isPending ? 'rgba(245, 158, 11, 0.03)' : 'rgba(255, 255, 255, 0.02)') }}; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                        
                        <!-- Top Badge -->
                        @if($isCurrent)
                            <div style="position: absolute; top: -0.625rem; right: 1rem;">
                                <x-filament::badge color="success" size="sm">
                                    Paket Aktif
                                </x-filament::badge>
                            </div>
                        @elseif($isPending)
                            <div style="position: absolute; top: -0.625rem; right: 1rem;">
                                <x-filament::badge color="warning" size="sm">
                                    Menunggu Persetujuan
                                </x-filament::badge>
                            </div>
                        @elseif($plan->name === 'BASIC')
                            <div style="position: absolute; top: -0.625rem; right: 1rem;">
                                <x-filament::badge color="primary" size="sm">
                                    Rekomendasi
                                </x-filament::badge>
                            </div>
                        @endif

                        <div>
                            <!-- Header -->
                            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">
                                {{ $plan->name }}
                            </div>
                            <div style="font-size: 0.875rem; font-weight: 700; margin-top: 0.125rem;">
                                {{ $plan->description }}
                            </div>

                            <!-- Price -->
                            <div style="margin: 0.875rem 0; display: flex; align-items: baseline; gap: 0.25rem;">
                                <span style="font-size: 1.5rem; font-weight: 800;">
                                    Rp {{ number_format($plan->price, 0, ',', '.') }}
                                </span>
                                <span style="font-size: 0.75rem; color: #6b7280;">/bulan</span>
                            </div>

                            <div style="height: 1px; width: 100%; background-color: rgba(156, 163, 175, 0.15); margin: 0.75rem 0;"></div>

                            <!-- Features List -->
                            <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.75rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <div style="width: 14px; height: 14px; min-width: 14px; color: rgb(16, 185, 129); display: flex; align-items: center;">
                                        <x-filament::icon icon="heroicon-m-check" style="width: 14px; height: 14px;" />
                                    </div>
                                    <span>
                                        @if($plan->max_courts)
                                            Maksimal <strong>{{ $plan->max_courts }} Lapangan</strong>
                                        @else
                                            <strong>Unlimited Lapangan</strong>
                                        @endif
                                    </span>
                                </div>

                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <div style="width: 14px; height: 14px; min-width: 14px; color: rgb(16, 185, 129); display: flex; align-items: center;">
                                        <x-filament::icon icon="heroicon-m-check" style="width: 14px; height: 14px;" />
                                    </div>
                                    <span>
                                        @if($plan->max_bookings_per_month)
                                            Hingga <strong>{{ $plan->max_bookings_per_month }} booking/bln</strong>
                                        @else
                                            <strong>Unlimited Booking</strong>
                                        @endif
                                    </span>
                                </div>

                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <div style="width: 14px; height: 14px; min-width: 14px; color: rgb(16, 185, 129); display: flex; align-items: center;">
                                        <x-filament::icon icon="heroicon-m-check" style="width: 14px; height: 14px;" />
                                    </div>
                                    <span>Laporan omzet & performa</span>
                                </div>

                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <div style="width: 14px; height: 14px; min-width: 14px; color: rgb(16, 185, 129); display: flex; align-items: center;">
                                        <x-filament::icon icon="heroicon-m-check" style="width: 14px; height: 14px;" />
                                    </div>
                                    <span>Validasi jadwal anti-bentrok</span>
                                </div>
                            </div>
                        </div>

                        <!-- Action Button -->
                        <div style="margin-top: 1.25rem; padding-top: 0.75rem; border-top: 1px solid rgba(156, 163, 175, 0.15);">
                            @if($isCurrent)
                                <x-filament::button color="gray" disabled size="sm" style="width: 100%;">
                                    ✓ Sedang Digunakan
                                </x-filament::button>
                            @elseif($isPending)
                                <x-filament::button color="warning" disabled size="sm" style="width: 100%;">
                                    ⏳ Menunggu Persetujuan
                                </x-filament::button>
                            @else
                                <x-filament::button 
                                    color="{{ $plan->name === 'PRO' ? 'primary' : 'success' }}"
                                    wire:click="requestUpgrade({{ $plan->plan_id }})" 
                                    wire:loading.attr="disabled"
                                    size="sm"
                                    style="width: 100%;">
                                    <span wire:loading.remove wire:target="requestUpgrade({{ $plan->plan_id }})">
                                        {{ $plan->price > 0 ? 'Ajukan Upgrade' : 'Ganti ke Free' }}
                                    </span>
                                    <span wire:loading wire:target="requestUpgrade({{ $plan->plan_id }})">
                                        Memproses...
                                    </span>
                                </x-filament::button>
                            @endif
                        </div>

                    </div>
                @endforeach
            </div>
        </div>

    </div>

</x-filament-panels::page>
