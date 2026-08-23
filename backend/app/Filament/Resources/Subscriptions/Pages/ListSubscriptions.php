<?php

namespace App\Filament\Resources\Subscriptions\Pages;

use App\Filament\Resources\Subscriptions\SubscriptionResource;
use App\Models\Subscription;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListSubscriptions extends ListRecords
{
    protected static string $resource = SubscriptionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }

    public function getTabs(): array
    {
        $pendingCount = Subscription::where('status', 'PENDING')->count();
        $activeCount = Subscription::where('status', 'ACTIVE')->count();

        return [
            'all' => Tab::make('Semua'),

            'pending' => Tab::make('Menunggu Persetujuan')
                ->badge($pendingCount > 0 ? (string) $pendingCount : null)
                ->badgeColor('warning')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'PENDING')),

            'active' => Tab::make('Sedang Aktif')
                ->badge($activeCount > 0 ? (string) $activeCount : null)
                ->badgeColor('success')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'ACTIVE')),

            'history' => Tab::make('Riwayat / Selesai')
                ->modifyQueryUsing(fn (Builder $query) => $query->whereIn('status', ['EXPIRED', 'CANCELLED'])),
        ];
    }
}
