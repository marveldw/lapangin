<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    // GET /api/bookings — owner sees only their courts' bookings
    public function index(Request $request)
    {
        $bookings = Booking::whereHas('court', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->user_id);
        })->with(['court', 'customer'])->get();

        return response()->json([
            'success' => true,
            'data'    => $bookings,
        ]);
    }

    // POST /api/bookings
    public function store(Request $request)
    {
        $validated = $request->validate([
            'court_id'     => 'required|integer',
            'customer_id'  => 'required|integer',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time'   => 'required|date_format:H:i',
            'end_time'     => 'required|date_format:H:i|after:start_time',
            'notes'        => 'nullable|string',
        ]);

        // 1 — Check court exists and belongs to this owner
        $court = Court::where('court_id', $validated['court_id'])
            ->where('owner_id', $request->user()->user_id)
            ->where('status', 'ACTIVE')
            ->first();

        if (!$court) {
            return response()->json([
                'success' => false,
                'message' => 'Lapangan tidak ditemukan atau tidak aktif.',
            ], 404);
        }

        // 2 — Check customer belongs to this owner
        $customer = Customer::where('customer_id', $validated['customer_id'])
            ->where('owner_id', $request->user()->user_id)
            ->first();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer tidak ditemukan.',
            ], 404);
        }

        // 3 — Check operating hours
        $bookingDate = \Carbon\Carbon::parse($validated['booking_date']);
        $dayOfWeek   = $bookingDate->dayOfWeek; // 0=Sunday, 6=Saturday

        $operatingHour = $court->operatingHours()
            ->where('day_of_week', $dayOfWeek)
            ->first();

        if ($operatingHour && $operatingHour->is_closed) {
            return response()->json([
                'success' => false,
                'message' => 'Lapangan tutup pada hari tersebut.',
            ], 422);
        }

        if ($operatingHour) {
            if ($validated['start_time'] < $operatingHour->open_time ||
                $validated['end_time'] > $operatingHour->close_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking harus berada dalam jam operasional ' .
                        $operatingHour->open_time . ' - ' . $operatingHour->close_time . '.',
                ], 422);
            }
        }

        // 4 — Check booking conflict
        $conflict = Booking::where('court_id', $validated['court_id'])
            ->where('booking_date', $validated['booking_date'])
            ->where('status', '!=', 'CANCELLED')
            ->where('start_time', '<', $validated['end_time'])
            ->where('end_time', '>', $validated['start_time'])
            ->exists();

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => 'Lapangan sudah dibooking pada waktu tersebut.',
            ], 409);
        }

        // 5 — Calculate price (snapshot from court)
        $start    = \Carbon\Carbon::createFromFormat('H:i', $validated['start_time']);
        $end      = \Carbon\Carbon::createFromFormat('H:i', $validated['end_time']);
        $hours    = $end->diffInMinutes($start) / 60;
        $price    = $court->price_per_hour * $hours;

        // 6 — Create booking
        $booking = Booking::create([
            'booking_code' => 'BK' . strtoupper(Str::random(6)),
            'court_id'     => $validated['court_id'],
            'customer_id'  => $validated['customer_id'],
            'booking_date' => $validated['booking_date'],
            'start_time'   => $validated['start_time'],
            'end_time'     => $validated['end_time'],
            'price'        => $price,
            'status'       => 'PENDING',
            'notes'        => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $booking->load(['court', 'customer']),
        ], 201);
    }

    // GET /api/bookings/{id}
    public function show(Request $request, $id)
    {
        $booking = Booking::whereHas('court', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->user_id);
        })->with(['court', 'customer'])->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $booking,
        ]);
    }

    // PUT /api/bookings/{id} — owner updates status only
    public function update(Request $request, $id)
    {
        $booking = Booking::whereHas('court', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->user_id);
        })->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:PENDING,CONFIRMED,CANCELLED',
        ]);

        $booking->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $booking,
        ]);
    }
}