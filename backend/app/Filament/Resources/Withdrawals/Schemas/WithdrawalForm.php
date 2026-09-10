<?php

namespace App\Filament\Resources\Withdrawals\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class WithdrawalForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('withdrawal_code')
                    ->label('Kode Penarikan')
                    ->disabled(),

                TextInput::make('amount')
                    ->label('Nominal Penarikan (Rp)')
                    ->numeric()
                    ->disabled(),

                TextInput::make('bank_name')
                    ->label('Bank Tujuan')
                    ->disabled(),

                TextInput::make('account_number')
                    ->label('Nomor Rekening')
                    ->disabled(),

                TextInput::make('account_holder')
                    ->label('Atas Nama')
                    ->disabled(),

                Select::make('status')
                    ->label('Status')
                    ->options([
                        'PENDING'    => 'Menunggu Diproses (Pending)',
                        'PROCESSING' => 'Sedang Ditransfer (Processing)',
                        'COMPLETED'  => 'Selesai Ditransfer (Completed)',
                        'REJECTED'   => 'Ditolak (Rejected)',
                    ])
                    ->required(),

                TextInput::make('proof_url')
                    ->label('Link Bukti Transfer')
                    ->url()
                    ->placeholder('https://...'),

                Textarea::make('admin_notes')
                    ->label('Catatan Admin')
                    ->rows(3),
            ]);
    }
}
