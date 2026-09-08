<?php

namespace App\Filament\Resources\ActivityLogs\Tables;

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
                    ->label('Pelaku')
                    ->default('Sistem')
                    ->searchable(),

                TextColumn::make('event')
                    ->label('Event')
                    ->badge()
                    ->colors([
                        'success' => 'created',
                        'info'    => 'updated',
                        'danger'  => 'deleted',
                        'warning' => 'login',
                        'gray'    => 'logout',
                    ]),

                TextColumn::make('description')
                    ->label('Deskripsi')
                    ->searchable()
                    ->wrap(),

                TextColumn::make('subject_type')
                    ->label('Entitas')
                    ->formatStateUsing(function ($state) {
                        if (!$state) return '-';
                        return match (class_basename($state)) {
                            'Court'        => 'Lapangan',
                            'Booking'      => 'Booking',
                            'User'         => 'Pengguna',
                            'Subscription' => 'Langganan',
                            'Plan'         => 'Paket',
                            'Customer'     => 'Pelanggan',
                            default        => class_basename($state),
                        };
                    })
                    ->badge(),

                TextColumn::make('subject_id')
                    ->label('ID')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('event')
                    ->label('Filter Event')
                    ->options([
                        'created' => 'Created (Dibuat)',
                        'updated' => 'Updated (Diperbarui)',
                        'deleted' => 'Deleted (Dihapus)',
                        'login'   => 'Login',
                        'logout'  => 'Logout',
                    ]),
            ])
            ->recordActions([
                ViewAction::make(),
            ])
            ->toolbarActions([]);
    }
}
