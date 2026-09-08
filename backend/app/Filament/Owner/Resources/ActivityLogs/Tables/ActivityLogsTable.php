<?php

namespace App\Filament\Owner\Resources\ActivityLogs\Tables;

use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ActivityLogsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('created_at')
                    ->label('Waktu')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),

                TextColumn::make('causer.name')
                    ->label('Oleh')
                    ->default('Sistem')
                    ->searchable(),

                TextColumn::make('event')
                    ->label('Aksi')
                    ->badge()
                    ->colors([
                        'success' => 'created',
                        'info'    => 'updated',
                        'danger'  => 'deleted',
                        'warning' => 'login',
                    ]),

                TextColumn::make('description')
                    ->label('Aktivitas')
                    ->searchable()
                    ->wrap(),

                TextColumn::make('subject_type')
                    ->label('Entitas')
                    ->formatStateUsing(function ($state) {
                        if (!$state) return '-';
                        return match (class_basename($state)) {
                            'Court'   => 'Lapangan',
                            'Booking' => 'Booking',
                            'User'    => 'Akun Anda',
                            default   => class_basename($state),
                        };
                    })
                    ->badge(),
            ])
            ->filters([
                SelectFilter::make('event')
                    ->label('Filter Aksi')
                    ->options([
                        'created' => 'Created (Dibuat)',
                        'updated' => 'Updated (Diubah)',
                        'deleted' => 'Deleted (Dihapus)',
                    ]),
            ])
            ->recordActions([
                ViewAction::make(),
            ])
            ->toolbarActions([]);
    }
}
