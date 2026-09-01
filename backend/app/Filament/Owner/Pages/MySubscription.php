<?php

namespace App\Filament\Owner\Pages;

use App\Models\Booking;
use App\Models\Court;
use App\Models\Plan;
use App\Models\Subscription;
use BackedEnum;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class MySubscription extends Page
{
    protected static ?string $navigationLabel = 'Paket Langganan';
    protected static ?string $title = 'Paket Langganan & Kuota';
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSparkles;
    protected static ?int $navigationSort = 10;

    protected string $view = 'filament.owner.pages.my-subscription';

    public function getSubscription()
    {
        $userId = auth()->user()?->user_id;

        return Subscription::with('plan')
            ->where('user_id', $userId)
            ->where('status', 'ACTIVE')
            ->latest('start_date')
            ->first();
    }

    public function getPendingSubscription()
    {
        $userId = auth()->user()?->user_id;

        return Subscription::with('plan')
            ->where('user_id', $userId)
            ->where('status', 'PENDING')
            ->latest('created_at')
            ->first();
    }

    public function getPlans()
    {
        return Plan::where('is_active', true)->orderBy('price', 'asc')->get();
    }

    public function getUsageStats()
    {
        $userId = auth()->user()?->user_id;
        $currentPlan = $this->getSubscription()?->plan;

        $courtCount = Court::where('owner_id', $userId)
            ->where('status', 'ACTIVE')
            ->count();

        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $endOfMonth = Carbon::now()->endOfMonth()->toDateString();

        $bookingCount = Booking::whereHas('court', function ($q) use ($userId) {
            $q->where('owner_id', $userId);
        })
            ->whereBetween('booking_date', [$startOfMonth, $endOfMonth])
            ->count();

        return [
            'court_count'   => $courtCount,
            'court_max'     => $currentPlan?->max_courts ?? 'Unlimited',
            'booking_count' => $bookingCount,
            'booking_max'   => $currentPlan?->max_bookings_per_month ?? 'Unlimited',
        ];
    }

    protected function getViewData(): array
    {
        return [
            'subscription'        => $this->getSubscription(),
            'pendingSubscription' => $this->getPendingSubscription(),
            'plans'               => $this->getPlans(),
            'usageStats'          => $this->getUsageStats(),
        ];
    }

    public function requestUpgrade(int $planId): void
    {
        $userId = auth()->user()?->user_id;
        $targetPlan = Plan::findOrFail($planId);
        $currentSub = $this->getSubscription();

        if ($currentSub && $currentSub->plan_id === $planId) {
            Notification::make()
                ->title('Informasi Paket')
                ->body('Anda sudah berlangganan paket ' . $targetPlan->name . ' saat ini.')
                ->info()
                ->send();
            return;
        }

        // If target plan is FREE, allow instant switch
        if ($targetPlan->price == 0) {
            DB::transaction(function () use ($userId, $targetPlan, $currentSub) {
                if ($currentSub) {
                    $currentSub->update(['status' => 'EXPIRED', 'end_date' => now()]);
                }

                Subscription::create([
                    'user_id'    => $userId,
                    'plan_id'    => $targetPlan->plan_id,
                    'start_date' => now(),
                    'end_date'   => null,
                    'status'     => 'ACTIVE',
                ]);
            });

            Notification::make()
                ->title('Paket Berhasil Diubah! 🎉')
                ->body('Paket langganan Anda berhasil dialihkan ke ' . $targetPlan->name . '.')
                ->success()
                ->send();

            return;
        }

        // For paid plans (BASIC / PRO), create PENDING subscription request for Admin Approval
        $pendingSub = $this->getPendingSubscription();

        if ($pendingSub) {
            $pendingSub->update([
                'plan_id'    => $targetPlan->plan_id,
                'start_date' => now(),
            ]);
        } else {
            Subscription::create([
                'user_id'    => $userId,
                'plan_id'    => $targetPlan->plan_id,
                'start_date' => now(),
                'end_date'   => null,
                'status'     => 'PENDING',
            ]);
        }

        Notification::make()
            ->title('Pengajuan Upgrade Terkirim! ⏳')
            ->body('Pengajuan paket ' . $targetPlan->name . ' telah dikirim ke Super Admin. Silakan lakukan pembayaran dan tunggu persetujuan.')
            ->warning()
            ->send();
    }

    public function cancelPendingRequest(): void
    {
        $pendingSub = $this->getPendingSubscription();

        if ($pendingSub) {
            $pendingSub->update([
                'status'   => 'CANCELLED',
                'end_date' => now(),
            ]);

            Notification::make()
                ->title('Pengajuan Dibatalkan')
                ->body('Pengajuan upgrade paket telah dibatalkan.')
                ->info()
                ->send();
        }
    }
}
