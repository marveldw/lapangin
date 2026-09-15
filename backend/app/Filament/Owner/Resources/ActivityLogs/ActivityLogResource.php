<?php

namespace App\Filament\Owner\Resources\ActivityLogs;

use App\Filament\Owner\Resources\ActivityLogs\Pages\ListActivityLogs;
use App\Filament\Owner\Resources\ActivityLogs\Pages\ViewActivityLog;
use App\Filament\Owner\Resources\ActivityLogs\Schemas\ActivityLogForm;
use App\Filament\Owner\Resources\ActivityLogs\Tables\ActivityLogsTable;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Activity;

class ActivityLogResource extends Resource
{
    protected static ?string $model = Activity::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClock;

    protected static ?string $navigationLabel = 'Riwayat Aktivitas';
    protected static ?string $modelLabel = 'Riwayat Aktivitas';
    protected static ?string $pluralModelLabel = 'Riwayat Aktivitas';
    protected static ?int $navigationSort = 50;

    public static function form(Schema $schema): Schema
    {
        return ActivityLogForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ActivityLogsTable::configure($table);
    }

    public static function getEloquentQuery(): Builder
    {
        $user = auth()->user();
        if (!$user) {
            return parent::getEloquentQuery()->whereRaw('1=0');
        }

        $courtIds = \App\Models\Court::withTrashed()->where('owner_id', $user->user_id)->pluck('court_id');
        $bookingIds = \App\Models\Booking::whereIn('court_id', $courtIds)->pluck('booking_id');

        return parent::getEloquentQuery()
            ->where(function (Builder $query) use ($user, $courtIds, $bookingIds) {
                $query->where(function ($q) use ($user) {
                    $q->where('causer_type', \App\Models\User::class)
                      ->where('causer_id', $user->user_id);
                })->orWhere(function ($q) use ($courtIds) {
                    $q->where('subject_type', \App\Models\Court::class)
                      ->whereIn('subject_id', $courtIds);
                })->orWhere(function ($q) use ($bookingIds) {
                    $q->where('subject_type', \App\Models\Booking::class)
                      ->whereIn('subject_id', $bookingIds);
                });
            });
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListActivityLogs::route('/'),
            'view'  => ViewActivityLog::route('/{record}'),
        ];
    }
}
