<?php

namespace App\Filament\Owner\Resources\Courts\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class CourtsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image_url')
                    ->label('Foto')
                    ->circular()
                    ->defaultImageUrl(url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&q=80')),

                TextColumn::make('name')
                    ->label('Nama Lapangan')
                    ->weight('bold')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('sport_type')
                    ->label('Cabang Olahraga')
                    ->badge()
                    ->searchable()
                    ->sortable(),

                TextColumn::make('price_per_hour')
                    ->label('Tarif / Jam')
                    ->money('IDR')
                    ->sortable(),

                TextColumn::make('city')
                    ->label('Kota')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'ACTIVE'   => 'success',
                        'INACTIVE' => 'danger',
                        default    => 'gray',
                    }),

                TextColumn::make('created_at')
                    ->label('Dibuat Pada')
                    ->dateTime('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('sport_type')
                    ->label('Cabang Olahraga')
                    ->options([
                        'Futsal'      => 'Futsal',
                        'Badminton'   => 'Badminton',
                        'Basketball'  => 'Basketball',
                        'Mini Soccer' => 'Mini Soccer',
                        'Tennis'      => 'Tennis',
                        'Volleyball'  => 'Volleyball',
                        'Padel'       => 'Padel',
                    ]),

                SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'ACTIVE'   => 'Aktif',
                        'INACTIVE' => 'Nonaktif',
                    ]),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
