<?php

namespace App\Filament\Resources\Subscriptions\Schemas;

use App\Models\Plan;
use App\Models\User;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Schemas\Schema;

class SubscriptionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->label('Pemilik Venue (Owner)')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),

                Select::make('plan_id')
                    ->label('Paket Langganan')
                    ->relationship('plan', 'name')
                    ->preload()
                    ->required(),

                DatePicker::make('start_date')
                    ->label('Tanggal Mulai')
                    ->default(now())
                    ->required(),

                DatePicker::make('end_date')
                    ->label('Tanggal Berakhir'),

                Select::make('status')
                    ->label('Status Langganan')
                    ->options([
                        'ACTIVE'    => 'Active (Sedang Aktif)',
                        'PENDING'   => 'Pending (Menunggu Persetujuan Admin)',
                        'EXPIRED'   => 'Expired (Kedaluwarsa)',
                        'CANCELLED' => 'Cancelled (Dibatalkan/Ditolak)',
                    ])
                    ->default('ACTIVE')
                    ->required(),
            ]);
    }
}
