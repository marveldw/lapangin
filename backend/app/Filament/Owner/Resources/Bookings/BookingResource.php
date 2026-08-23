<?php

namespace App\Filament\Owner\Resources\Bookings;

use App\Filament\Owner\Resources\Bookings\Pages\CreateBooking;
use App\Filament\Owner\Resources\Bookings\Pages\EditBooking;
use App\Filament\Owner\Resources\Bookings\Pages\ListBookings;
use App\Filament\Owner\Resources\Bookings\Schemas\BookingForm;
use App\Filament\Owner\Resources\Bookings\Tables\BookingsTable;
use App\Models\Booking;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCalendar;

    protected static ?string $navigationLabel = 'Reservasi / Booking';
    protected static ?string $modelLabel = 'Booking';
    protected static ?string $pluralModelLabel = 'Daftar Booking';

    public static function form(Schema $schema): Schema
    {
        return BookingForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return BookingsTable::configure($table);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->whereHas('court', function ($q) {
            $q->where('owner_id', auth()->user()?->user_id);
        });
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => ListBookings::route('/'),
            'create' => CreateBooking::route('/create'),
            'edit'   => EditBooking::route('/{record}/edit'),
        ];
    }
}
