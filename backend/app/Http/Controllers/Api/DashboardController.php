<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $ownerId = $request->user()->user_id;
        $today   = now()->toDateString();
        $month   = now()->month;
        $year    = now()->year;

        // Total courts milik owner ini
        $totalCourts = Court::where('owner_id', $ownerId)->count();

        // Court IDs milik owner ini
        $courtIds = Court::where('owner_id', $ownerId)
            ->pluck('court_id');

        // Total semua booking
        $totalBookings = Booking::whereIn('court_id', $courtIds)
            ->where('status', '!=', 'CANCELLED')
            ->count();

        // Booking hari ini
        $todayBookings = Booking::whereIn('court_id', $courtIds)
            ->where('booking_date', $today)
            ->where('status', '!=', 'CANCELLED')
            ->count();

        // Pendapatan hari ini
        $todayRevenue = Booking::whereIn('court_id', $courtIds)
            ->where('booking_date', $today)
            ->where('status', 'CONFIRMED')
            ->sum('price');

        // Pendapatan bulan ini
        $monthlyRevenue = Booking::whereIn('court_id', $courtIds)
            ->whereMonth('booking_date', $month)
            ->whereYear('booking_date', $year)
            ->where('status', 'CONFIRMED')
            ->sum('price');

        return response()->json([
            'success' => true,
            'data'    => [
                'total_courts'    => $totalCourts,
                'total_bookings'  => $totalBookings,
                'today_bookings'  => $todayBookings,
                'today_revenue'   => $todayRevenue,
                'monthly_revenue' => $monthlyRevenue,
            ],
        ]);
    }
}