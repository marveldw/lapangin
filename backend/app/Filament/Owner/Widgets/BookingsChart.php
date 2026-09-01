<?php

namespace App\Filament\Owner\Widgets;

use App\Models\Booking;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class BookingsChart extends ChartWidget
{
    protected static ?int $sort = 3;
    protected ?string $heading = 'Distribusi Status Booking (Bulan Ini)';
    protected int | string | array $columnSpan = [
        'md' => 1,
        'xl' => 1,
    ];

    protected function getData(): array
    {
        $userId = auth()->user()?->user_id;

        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $endOfMonth = Carbon::now()->endOfMonth()->toDateString();

        $query = Booking::whereHas('court', function ($q) use ($userId) {
            $q->where('owner_id', $userId);
        })->whereBetween('booking_date', [$startOfMonth, $endOfMonth]);

        $confirmed = (clone $query)->where('status', 'CONFIRMED')->count();
        $pending = (clone $query)->where('status', 'PENDING')->count();
        $cancelled = (clone $query)->where('status', 'CANCELLED')->count();

        return [
            'datasets' => [
                [
                    'label'           => 'Jumlah Booking',
                    'data'            => [$confirmed, $pending, $cancelled],
                    'backgroundColor' => [
                        '#10b981', // Confirmed - Emerald
                        '#f59e0b', // Pending - Amber
                        '#ef4444', // Cancelled - Red
                    ],
                ],
            ],
            'labels' => ['Confirmed', 'Pending', 'Cancelled'],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
