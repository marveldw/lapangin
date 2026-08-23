<?php

namespace App\Filament\Resources\Subscriptions\Tables;

use App\Models\Subscription;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\DB;

class SubscriptionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('Pemilik Venue')
                    ->searchable()
                    ->sortable()
                    ->description(fn (Subscription $record) => $record->user?->email ?? '-'),

                TextColumn::make('plan.name')
                    ->label('Paket')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'PRO'   => 'primary',
                        'BASIC' => 'info',
                        'FREE'  => 'gray',
                        default => 'gray',
                    })
                    ->description(fn (Subscription $record) => $record->plan ? 'Rp ' . number_format($record->plan->price, 0, ',', '.') . '/bln' : '-'),

                TextColumn::make('start_date')
                    ->label('Tanggal Mulai')
                    ->date('d M Y')
                    ->sortable(),

                TextColumn::make('end_date')
                    ->label('Tanggal Berakhir')
                    ->date('d M Y')
                    ->placeholder('Langganan Aktif'),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'ACTIVE'    => 'success',
                        'PENDING'   => 'warning',
                        'CANCELLED' => 'danger',
                        'EXPIRED'   => 'gray',
                        default     => 'gray',
                    }),

                TextColumn::make('created_at')
                    ->label('Diajukan')
                    ->dateTime('d M Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'PENDING'   => 'Pending Approval',
                        'ACTIVE'    => 'Active',
                        'EXPIRED'   => 'Expired',
                        'CANCELLED' => 'Cancelled',
                    ]),

                SelectFilter::make('plan_id')
                    ->label('Paket')
                    ->relationship('plan', 'name'),
            ])
            ->recordActions([
                // 1. APPROVE ACTION
                Action::make('approve')
                    ->label('Setujui')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (Subscription $record): bool => $record->status === 'PENDING')
                    ->requiresConfirmation()
                    ->modalHeading('Setujui Pengajuan Langganan')
                    ->modalDescription(fn (Subscription $record) => "Apakah Anda yakin ingin menyetujui paket {$record->plan?->name} untuk {$record->user?->name}? Paket aktif sebelumnya akan otomatis diubah menjadi EXPIRED.")
                    ->modalSubmitActionLabel('Ya, Setujui & Aktifkan')
                    ->action(function (Subscription $record) {
                        DB::transaction(function () use ($record) {
                            // Deactivate old active subscriptions for this user
                            Subscription::where('user_id', $record->user_id)
                                ->where('status', 'ACTIVE')
                                ->update([
                                    'status'   => 'EXPIRED',
                                    'end_date' => now(),
                                ]);

                            // Activate this subscription
                            $record->update([
                                'status'     => 'ACTIVE',
                                'start_date' => now(),
                                'end_date'   => null,
                            ]);
                        });

                        Notification::make()
                            ->title('Pengajuan Langganan Disetujui')
                            ->body("Paket {$record->plan?->name} untuk {$record->user?->name} sekarang telah aktif.")
                            ->success()
                            ->send();
                    }),

                // 2. REJECT ACTION
                Action::make('reject')
                    ->label('Tolak')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn (Subscription $record): bool => $record->status === 'PENDING')
                    ->requiresConfirmation()
                    ->modalHeading('Tolak Pengajuan Langganan')
                    ->modalDescription(fn (Subscription $record) => "Apakah Anda yakin ingin menolak pengajuan paket {$record->plan?->name} untuk {$record->user?->name}?")
                    ->modalSubmitActionLabel('Ya, Tolak')
                    ->action(function (Subscription $record) {
                        $record->update([
                            'status'   => 'CANCELLED',
                            'end_date' => now(),
                        ]);

                        Notification::make()
                            ->title('Pengajuan Langganan Ditolak')
                            ->body("Pengajuan paket {$record->plan?->name} telah dibatalkan/ditolak.")
                            ->warning()
                            ->send();
                    }),

                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
