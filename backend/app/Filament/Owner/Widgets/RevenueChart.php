<?php

namespace App\Filament\Owner\Widgets;

use App\Models\Booking;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class RevenueChart extends ChartWidget
{
    protected static ?int $sort = 2;
    protected ?string $heading = 'Tren Omzet Bulanan (6 Bulan Terakhir)';
    protected int | string | array $columnSpan = [
        'md' => 2,
        'xl' => 2,
    ];

    protected function getData(): array
    {
        $userId = auth()->user()?->user_id;

        $labels = [];
        $data = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $labels[] = $month->format('M Y');

            $start = $month->copy()->startOfMonth()->toDateString();
            $end = $month->copy()->endOfMonth()->toDateString();

            $revenue = Booking::whereHas('court', function ($q) use ($userId) {
                $q->where('owner_id', $userId);
            })
                ->where('status', 'CONFIRMED')
                ->whereBetween('booking_date', [$start, $end])
                ->sum('price');

            $data[] = (int) $revenue;
        }

        return [
            'datasets' => [
                [
                    'label'           => 'Omzet (Rp)',
                    'data'            => $data,
                    'borderColor'     => '#10b981',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.15)',
                    'fill'            => true,
                    'tension'         => 0.35,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
