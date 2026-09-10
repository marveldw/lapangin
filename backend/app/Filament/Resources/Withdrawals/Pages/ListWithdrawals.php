<?php

namespace App\Filament\Resources\Withdrawals\Pages;

use App\Filament\Resources\Withdrawals\WithdrawalResource;
use App\Models\Withdrawal;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListWithdrawals extends ListRecords
{
    protected static string $resource = WithdrawalResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }

    public function getTabs(): array
    {
        $pendingCount = Withdrawal::where('status', 'PENDING')->count();
        $completedCount = Withdrawal::where('status', 'COMPLETED')->count();

        return [
            'all' => Tab::make('Semua'),

            'pending' => Tab::make('Menunggu Ditransfer')
                ->badge($pendingCount > 0 ? (string) $pendingCount : null)
                ->badgeColor('warning')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'PENDING')),

            'completed' => Tab::make('Selesai Ditransfer')
                ->badge($completedCount > 0 ? (string) $completedCount : null)
                ->badgeColor('success')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'COMPLETED')),

            'rejected' => Tab::make('Ditolak')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'REJECTED')),
        ];
    }
}
