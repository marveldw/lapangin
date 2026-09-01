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
        $ownerId = $request->user()->user_id;
        $today   = Carbon::today()->toDateString();
        $month   = Carbon::now()->month;
        $year    = Carbon::now()->year;

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
                    'total_courts'    => 0,
                    'total_bookings'  => 0,
                    'today_bookings'  => 0,
                    'today_revenue'   => 0,
                    'monthly_revenue' => 0,
                ],
            ]);
        }

        // Single optimized aggregate query for booking stats
        $stats = Booking::whereIn('court_id', $courtIds)
            ->selectRaw("
                COUNT(CASE WHEN status != 'CANCELLED' THEN 1 END) as total_bookings,
                COUNT(CASE WHEN booking_date = ? AND status != 'CANCELLED' THEN 1 END) as today_bookings,
                COALESCE(SUM(CASE WHEN booking_date = ? AND status = 'CONFIRMED' THEN price ELSE 0 END), 0) as today_revenue,
                COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM booking_date) = ? AND EXTRACT(YEAR FROM booking_date) = ? AND status = 'CONFIRMED' THEN price ELSE 0 END), 0) as monthly_revenue
            ", [$today, $today, $month, $year])
            ->first();

        return response()->json([
            'success' => true,
            'data'    => [
                'total_courts'    => $totalCourts,
                'total_bookings'  => (int) ($stats->total_bookings ?? 0),
                'today_bookings'  => (int) ($stats->today_bookings ?? 0),
                'today_revenue'   => (int) ($stats->today_revenue ?? 0),
                'monthly_revenue' => (int) ($stats->monthly_revenue ?? 0),
            ],
        ]);
    }
}