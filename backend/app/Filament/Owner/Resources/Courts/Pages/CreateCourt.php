<?php

namespace App\Filament\Owner\Resources\Courts\Pages;

use App\Filament\Owner\Resources\Courts\CourtResource;
use App\Models\Court;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;

class CreateCourt extends CreateRecord
{
    protected static string $resource = CourtResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['owner_id'] = auth()->user()->user_id;

        return $data;
    }

    protected function beforeCreate(): void
    {
        $user = auth()->user();
        $subscription = $user->subscriptions()
            ->where('status', 'ACTIVE')
            ->with('plan')
            ->first();

        $maxCourts = $subscription?->plan?->max_courts ?? 1;
        $planName = $subscription?->plan?->name ?? 'FREE';

        if ($maxCourts !== null) {
            $currentCount = Court::where('owner_id', $user->user_id)->count();

            if ($currentCount >= $maxCourts) {
                Notification::make()
                    ->title('Batas Kuota Lapangan Tercapai')
                    ->body("Paket langganan Anda ({$planName}) hanya mengizinkan maksimal {$maxCourts} unit lapangan. Silakan upgrade paket langganan Anda.")
                    ->danger()
                    ->persistent()
                    ->send();

                $this->halt();
            }
        }
    }
}
