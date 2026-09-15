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
        $ownerId      = $request->user()->user_id;
        $today        = Carbon::today()->toDateString();
        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $endOfMonth   = Carbon::now()->endOfMonth()->toDateString();

        // Total courts milik owner ini
        $totalCourts = Court::where('owner_id', $ownerId)
            ->where('status', 'ACTIVE')
            ->count();

        // Court IDs milik owner ini
        $courtIds = Court::where('owner_id', $ownerId)->pluck('court_id');

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

        $wallet = \App\Models\Wallet::firstOrCreate(['owner_id' => $ownerId]);

        return response()->json([
            'success' => true,
            'data'    => [
                'total_courts'     => $totalCourts,
                'total_bookings'   => (int) ($stats->total_bookings ?? 0),
                'pending_bookings' => (int) ($stats->pending_bookings ?? 0),
                'today_bookings'   => (int) ($stats->today_bookings ?? 0),
                'today_revenue'    => (int) ($stats->today_revenue ?? 0),
                'monthly_revenue' => (int) ($stats->monthly_revenue ?? 0),
                'wallet_balance'  => (int) $wallet->balance,
                'locked_balance'  => (int) $wallet->locked_balance,
            ],
        ]);
    }
}