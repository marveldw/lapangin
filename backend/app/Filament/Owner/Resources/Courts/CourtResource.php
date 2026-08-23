<?php

namespace App\Filament\Owner\Resources\Courts;

use App\Filament\Owner\Resources\Courts\Pages\CreateCourt;
use App\Filament\Owner\Resources\Courts\Pages\EditCourt;
use App\Filament\Owner\Resources\Courts\Pages\ListCourts;
use App\Filament\Owner\Resources\Courts\Schemas\CourtForm;
use App\Filament\Owner\Resources\Courts\Tables\CourtsTable;
use App\Models\Court;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class CourtResource extends Resource
{
    protected static ?string $model = Court::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $navigationLabel = 'Kelola Lapangan';
    protected static ?string $modelLabel = 'Lapangan';
    protected static ?string $pluralModelLabel = 'Daftar Lapangan';

    public static function form(Schema $schema): Schema
    {
        return CourtForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CourtsTable::configure($table);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('owner_id', auth()->user()?->user_id);
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
            'index'  => ListCourts::route('/'),
            'create' => CreateCourt::route('/create'),
            'edit'   => EditCourt::route('/{record}/edit'),
        ];
    }
}
