<?php

namespace App\Filament\Owner\Widgets;

use App\Models\Booking;
use App\Models\Court;
use App\Models\Subscription;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Carbon;

class OwnerStatsOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $userId = auth()->user()?->user_id;

        // 1. Subscription data
        $subscription = Subscription::with('plan')
            ->where('user_id', $userId)
            ->where('status', 'ACTIVE')
            ->latest('start_date')
            ->first();

        $planName = $subscription?->plan?->name ?? 'FREE';
        $maxCourts = $subscription?->plan?->max_courts ?? 'Unlimited';
        $maxBookings = $subscription?->plan?->max_bookings_per_month ?? 'Unlimited';

        // 2. Counts
        $courtCount = Court::where('owner_id', $userId)->where('status', 'ACTIVE')->count();

        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $endOfMonth = Carbon::now()->endOfMonth()->toDateString();

        $monthlyBookings = Booking::whereHas('court', function ($q) use ($userId) {
            $q->where('owner_id', $userId);
        })
            ->whereBetween('booking_date', [$startOfMonth, $endOfMonth]);

        $bookingCount = (clone $monthlyBookings)->count();

        $monthlyRevenue = (clone $monthlyBookings)
            ->where('status', 'CONFIRMED')
            ->sum('price');

        return [
            Stat::make('Paket Langganan', 'Paket ' . $planName)
                ->description("Kuota: {$courtCount}/{$maxCourts} unit • {$bookingCount}/{$maxBookings} booking")
                ->descriptionIcon('heroicon-o-sparkles')
                ->color('success')
                ->url('/owner/my-subscription'),

            Stat::make('Omzet Bulan Ini (' . date('M Y') . ')', 'Rp ' . number_format($monthlyRevenue, 0, ',', '.'))
                ->description('Dari booking berstatus CONFIRMED')
                ->descriptionIcon('heroicon-o-banknotes')
                ->color('success'),

            Stat::make('Total Booking Bulan Ini', $bookingCount . ' Transaksi')
                ->description('Reservasi masuk dari pelanggan')
                ->descriptionIcon('heroicon-o-calendar-days')
                ->color('primary'),

            Stat::make('Unit Lapangan Aktif', $courtCount . ' Lapangan')
                ->description('Batas paket: ' . $maxCourts . ' unit')
                ->descriptionIcon('heroicon-o-building-office-2')
                ->color('info'),
        ];
    }
}
