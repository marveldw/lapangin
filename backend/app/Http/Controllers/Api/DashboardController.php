<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $ownerId      = $request->user()->getTenantOwnerId();
        $today        = Carbon::today()->toDateString();
        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $endOfMonth   = Carbon::now()->endOfMonth()->toDateString();

        // Total courts milik owner ini
        $totalCourts = Court::where('owner_id', $ownerId)
            ->where('status', 'ACTIVE')
            ->count();

        // Court IDs milik owner ini (termasuk yang di-soft delete agar riwayat finansial dan statistik booking tetap akurat)
        $courtIds = Court::withTrashed()->where('owner_id', $ownerId)->pluck('court_id');

        if ($courtIds->isEmpty()) {
            return response()->json([
                'success' => true,
                'data'    => [
                    'total_courts'     => 0,
                    'total_bookings'   => 0,
                    'pending_bookings' => 0,
                    'today_bookings'   => 0,
                    'today_revenue'    => 0,
                    'monthly_revenue'  => 0,
                ],
            ]);
        }

        // Single optimized aggregate query for booking stats using sargable date ranges
        $stats = Booking::whereIn('court_id', $courtIds)
            ->selectRaw("
                COUNT(CASE WHEN status != 'CANCELLED' THEN 1 END) as total_bookings,
                COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_bookings,
                COUNT(CASE WHEN booking_date = ? AND status != 'CANCELLED' THEN 1 END) as today_bookings,
                COALESCE(SUM(CASE WHEN booking_date = ? AND status = 'CONFIRMED' THEN price ELSE 0 END), 0) as today_revenue,
                COALESCE(SUM(CASE WHEN booking_date >= ? AND booking_date <= ? AND status = 'CONFIRMED' THEN price ELSE 0 END), 0) as monthly_revenue
            ", [$today, $today, $startOfMonth, $endOfMonth])
            ->first();

        $isStaff = $request->user()->role === 'STAFF';

        $data = [
            'total_courts'     => $totalCourts,
            'total_bookings'   => (int) ($stats->total_bookings ?? 0),
            'pending_bookings' => (int) ($stats->pending_bookings ?? 0),
            'today_bookings'   => (int) ($stats->today_bookings ?? 0),
        ];

        if (!$isStaff) {
            $wallet = \App\Models\Wallet::firstOrCreate(['owner_id' => $ownerId]);
            $data['today_revenue']   = (int) ($stats->today_revenue ?? 0);
            $data['monthly_revenue'] = (int) ($stats->monthly_revenue ?? 0);
            $data['wallet_balance']  = (int) $wallet->balance;
            $data['locked_balance']  = (int) $wallet->locked_balance;
        }

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    /**
     * GET /api/owner/revenue — Dedicated financial dashboard & revenue summary.
     * Restricted strictly to OWNER and ADMIN.
     */
    public function revenue(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'STAFF') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Staf tidak memiliki izin untuk melihat data finansial.',
            ], 403);
        }

        $ownerId      = $user->getTenantOwnerId();
        $today        = Carbon::today()->toDateString();
        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $endOfMonth   = Carbon::now()->endOfMonth()->toDateString();

        $courtIds = Court::withTrashed()->where('owner_id', $ownerId)->pluck('court_id');

        $stats = Booking::whereIn('court_id', $courtIds)
            ->selectRaw("
                COUNT(CASE WHEN status != 'CANCELLED' THEN 1 END) as total_bookings,
                COALESCE(SUM(CASE WHEN booking_date = ? AND status = 'CONFIRMED' THEN price ELSE 0 END), 0) as today_revenue,
                COALESCE(SUM(CASE WHEN booking_date >= ? AND booking_date <= ? AND status = 'CONFIRMED' THEN price ELSE 0 END), 0) as monthly_revenue
            ", [$today, $startOfMonth, $endOfMonth])
            ->first();

        // Income per court breakdown
        $incomePerCourt = Court::withTrashed()
            ->where('owner_id', $ownerId)
            ->withSum(['bookings as total_revenue' => function ($query) {
                $query->where('status', 'CONFIRMED');
            }], 'price')
            ->get(['court_id', 'name', 'sport_type', 'deleted_at']);

        $wallet = \App\Models\Wallet::firstOrCreate(['owner_id' => $ownerId]);

        return response()->json([
            'success' => true,
            'data'    => [
                'today_revenue'    => (int) ($stats->today_revenue ?? 0),
                'monthly_revenue'  => (int) ($stats->monthly_revenue ?? 0),
                'wallet_balance'   => (int) $wallet->balance,
                'locked_balance'   => (int) $wallet->locked_balance,
                'income_per_court' => $incomePerCourt,
            ],
        ]);
    }
}