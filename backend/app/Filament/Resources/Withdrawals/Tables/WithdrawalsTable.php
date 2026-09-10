<?php

namespace App\Filament\Resources\Withdrawals\Tables;

use App\Models\WalletMutation;
use App\Models\Withdrawal;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\DB;

class WithdrawalsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('withdrawal_code')
                    ->label('Kode')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->weight('bold'),

                TextColumn::make('wallet.owner.name')
                    ->label('Pemilik Venue')
                    ->searchable()
                    ->sortable()
                    ->description(fn (Withdrawal $record) => $record->wallet?->owner?->email ?? '-'),

                TextColumn::make('amount')
                    ->label('Nominal')
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format($state, 0, ',', '.'))
                    ->sortable()
                    ->weight('extrabold')
                    ->color('success'),

                TextColumn::make('bank_name')
                    ->label('Bank')
                    ->badge()
                    ->color('info'),

                TextColumn::make('account_number')
                    ->label('No. Rekening')
                    ->copyable()
                    ->description(fn (Withdrawal $record) => $record->account_holder),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'COMPLETED'  => 'success',
                        'PENDING'    => 'warning',
                        'PROCESSING' => 'info',
                        'REJECTED'   => 'danger',
                        default      => 'gray',
                    }),

                TextColumn::make('created_at')
                    ->label('Waktu Pengajuan')
                    ->dateTime('d M Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'PENDING'    => 'Pending (Menunggu Ditransfer)',
                        'PROCESSING' => 'Processing',
                        'COMPLETED'  => 'Completed (Selesai)',
                        'REJECTED'   => 'Rejected (Ditolak)',
                    ]),
            ])
            ->recordActions([
                // 1. APPROVE & TRANSFER SELESAI
                Action::make('approve')
                    ->label('Selesai Ditransfer')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (Withdrawal $record): bool => in_array($record->status, ['PENDING', 'PROCESSING']))
                    ->form([
                        TextInput::make('proof_url')
                            ->label('Link Bukti Transfer')
                            ->placeholder('https://...')
                            ->nullable(),
                        Textarea::make('admin_notes')
                            ->label('Catatan Tambahan')
                            ->placeholder('Contoh: Berhasil ditransfer via Internet Banking BCA')
                            ->nullable(),
                    ])
                    ->requiresConfirmation()
                    ->modalHeading('Konfirmasi Pencairan Dana')
                    ->modalDescription(fn (Withdrawal $record) => "Pastikan Anda sudah mentransfer sejumlah Rp " . number_format($record->amount, 0, ',', '.') . " ke rekening {$record->bank_name} {$record->account_number} a.n {$record->account_holder}.")
                    ->modalSubmitActionLabel('Ya, Sudah Ditransfer')
                    ->action(function (Withdrawal $record, array $data) {
                        DB::transaction(function () use ($record, $data) {
                            $record->update([
                                'status'      => 'COMPLETED',
                                'proof_url'   => $data['proof_url'] ?? null,
                                'admin_notes' => $data['admin_notes'] ?? null,
                            ]);

                            // Kurangi locked_balance dari dompet owner
                            $wallet = $record->wallet;
                            if ($wallet) {
                                $wallet->decrement('locked_balance', $record->amount);
                            }
                        });

                        Notification::make()
                            ->title('Pencairan Dana Selesai')
                            ->body("Pengajuan #{$record->withdrawal_code} telah ditandai selesai.")
                            ->success()
                            ->send();
                    }),

                // 2. REJECT & KEMBALIKAN SALDO
                Action::make('reject')
                    ->label('Tolak')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn (Withdrawal $record): bool => in_array($record->status, ['PENDING', 'PROCESSING']))
                    ->form([
                        Textarea::make('admin_notes')
                            ->label('Alasan Penolakan')
                            ->placeholder('Contoh: Nomor rekening tidak valid / nama tidak sesuai')
                            ->required(),
                    ])
                    ->requiresConfirmation()
                    ->modalHeading('Tolak Pengajuan Penarikan Dana')
                    ->modalDescription('Saldo yang ditahan akan otomatis dikembalikan ke saldo aktif dompet owner.')
                    ->modalSubmitActionLabel('Ya, Tolak & Kembalikan Saldo')
                    ->action(function (Withdrawal $record, array $data) {
                        DB::transaction(function () use ($record, $data) {
                            $record->update([
                                'status'      => 'REJECTED',
                                'admin_notes' => $data['admin_notes'] ?? 'Ditolak oleh admin',
                            ]);

                            $wallet = $record->wallet;
                            if ($wallet) {
                                $balanceBefore = $wallet->balance;

                                // Pindahkan dari locked_balance kembali ke balance aktif
                                $wallet->decrement('locked_balance', $record->amount);
                                $wallet->increment('balance', $record->amount);

                                WalletMutation::create([
                                    'wallet_id'      => $wallet->wallet_id,
                                    'type'           => 'CREDIT',
                                    'amount'         => $record->amount,
                                    'balance_before' => $balanceBefore,
                                    'balance_after'  => $wallet->balance,
                                    'description'    => "Pengembalian saldo: Penarikan #{$record->withdrawal_code} ditolak",
                                    'reference_type' => 'WITHDRAWAL',
                                    'reference_id'   => $record->withdrawal_id,
                                ]);
                            }
                        });

                        Notification::make()
                            ->title('Penarikan Dana Ditolak')
                            ->body("Saldo telah dikembalikan ke dompet owner.")
                            ->warning()
                            ->send();
                    }),
            ])
            ->toolbarActions([]);
    }
}
