<?php

namespace App\Filament\Owner\Widgets;

use App\Models\Booking;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Database\Eloquent\Builder;

class LatestBookings extends TableWidget
{
    protected static ?int $sort = 4;
    protected static ?string $heading = 'Daftar Reservasi Terbaru';
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        $userId = auth()->user()?->user_id;

        return $table
            ->query(
                Booking::query()
                    ->whereHas('court', function (Builder $q) use ($userId) {
                        $q->where('owner_id', $userId);
                    })
                    ->latest('created_at')
            )
            ->columns([
                TextColumn::make('booking_code')
                    ->label('Kode Booking')
                    ->weight('bold')
                    ->searchable(),

                TextColumn::make('customer.name')
                    ->label('Pemesan')
                    ->searchable(),

                TextColumn::make('court.name')
                    ->label('Lapangan'),

                TextColumn::make('booking_date')
                    ->label('Tanggal Main')
                    ->date('d M Y'),

                TextColumn::make('start_time')
                    ->label('Jam')
                    ->formatStateUsing(fn ($record) => substr($record->start_time, 0, 5) . ' - ' . substr($record->end_time, 0, 5)),

                TextColumn::make('price')
                    ->label('Total Tarif')
                    ->money('IDR'),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'CONFIRMED' => 'success',
                        'PENDING'   => 'warning',
                        'CANCELLED' => 'danger',
                        default     => 'gray',
                    }),
            ])
            ->paginated([5]);
    }
}
