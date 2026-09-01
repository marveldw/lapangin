<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Customer;
use App\Models\Plan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    // GET /api/bookings — List bookings (Owner sees their venue bookings, Customer sees their own bookings)
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Booking::with(['court', 'customer'])
            ->orderBy('booking_date', 'desc')
            ->orderBy('start_time', 'asc');

        if ($user->role === 'OWNER') {
            $query->whereHas('court', function ($q) use ($user) {
                $q->where('owner_id', $user->user_id);
            });
        } else {
            // Customer / Regular user sees their own bookings
            $query->where('user_id', $user->user_id);
        }

        $bookings = $query->paginate(25);

        return response()->json([
            'success' => true,
            'data'    => $bookings,
        ]);
    }

    // POST /api/bookings — Authenticated user books a court slot
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'court_id'     => 'required|integer|exists:courts,court_id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time'   => 'required|date_format:H:i',
            'end_time'     => 'required|date_format:H:i|after:start_time',
            'notes'        => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($user, $validated) {
            // 1 — Check court exists and is active
            $court = Court::where('court_id', $validated['court_id'])
                ->where('status', 'ACTIVE')
                ->lockForUpdate()
                ->first();

            if (!$court) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lapangan tidak ditemukan atau sedang tidak aktif.',
                ], 404);
            }

            // 2 — Check venue owner's monthly booking quota
            $owner = $court->owner;
            if ($owner) {
                $subscription = $owner->subscriptions()
                    ->where('status', 'ACTIVE')
                    ->with('plan')
                    ->first();

                $maxBookingsPerMonth = 30; // default Free limit
                if ($subscription && $subscription->plan) {
                    $maxBookingsPerMonth = $subscription->plan->max_bookings_per_month;
                } else {
                    $freePlan = Plan::where('name', 'FREE')->first();
                    if ($freePlan) {
                        $maxBookingsPerMonth = $freePlan->max_bookings_per_month;
                    }
                }

                if ($maxBookingsPerMonth !== null) {
                    $currentMonthBookings = Booking::whereHas('court', function ($q) use ($owner) {
                        $q->where('owner_id', $owner->user_id);
                    })
                    ->whereMonth('booking_date', Carbon::parse($validated['booking_date'])->month)
                    ->whereYear('booking_date', Carbon::parse($validated['booking_date'])->year)
                    ->where('status', '!=', 'CANCELLED')
                    ->count();

                    if ($currentMonthBookings >= $maxBookingsPerMonth) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Venue ini sementara tidak dapat menerima pemesanan baru karena kuota bulanan telah tercapai.',
                        ], 403);
                    }
                }
            }

            // 3 — Automatically link or create customer record under venue owner
            $customer = Customer::firstOrCreate(
                [
                    'owner_id' => $court->owner_id,
                    'phone'    => $user->phone ?? '0000000000',
                ],
                [
                    'name'  => $user->name,
                    'email' => $user->email,
                ]
            );

            // 4 — Check operating hours
            $bookingDate = Carbon::parse($validated['booking_date']);
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

            if ($operatingHour && $operatingHour->open_time && $operatingHour->close_time) {
                $openTime  = Carbon::parse($operatingHour->open_time)->format('H:i');
                $closeTime = Carbon::parse($operatingHour->close_time)->format('H:i');

                if ($validated['start_time'] < $openTime || $validated['end_time'] > $closeTime) {
                    return response()->json([
                        'success' => false,
                        'message' => "Booking harus berada dalam jam operasional ({$openTime} - {$closeTime}).",
                    ], 422);
                }
            }

            // 5 — Check slot conflict (Anti-Bentrok) with lock
            $conflict = Booking::where('court_id', $validated['court_id'])
                ->where('booking_date', $validated['booking_date'])
                ->where('status', '!=', 'CANCELLED')
                ->where('start_time', '<', $validated['end_time'])
                ->where('end_time', '>', $validated['start_time'])
                ->lockForUpdate()
                ->exists();

            if ($conflict) {
                return response()->json([
                    'success' => false,
                    'message' => 'Slot waktu tersebut sudah dibooking. Silakan pilih slot lain.',
                ], 409);
            }

            // 6 — Calculate price
            $start = Carbon::createFromFormat('H:i', $validated['start_time']);
            $end   = Carbon::createFromFormat('H:i', $validated['end_time']);
            $hours = $end->diffInMinutes($start) / 60;
            $price = (int) round($court->price_per_hour * $hours);

            // 7 — Create booking record
            $bookingCode = $this->generateUniqueBookingCode();

            $booking = Booking::create([
                'booking_code' => $bookingCode,
                'court_id'     => $validated['court_id'],
                'customer_id'  => $customer->customer_id,
                'user_id'      => $user->user_id,
                'booking_date' => $validated['booking_date'],
                'start_time'   => $validated['start_time'],
                'end_time'     => $validated['end_time'],
                'price'        => $price,
                'status'       => 'PENDING',
                'notes'        => $validated['notes'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reservasi berhasil dibuat.',
                'data'    => $booking->load(['court', 'customer']),
            ], 201);
        });
    }

    // GET /api/bookings/{id} — View booking details (Owner or Customer)
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $booking = Booking::with(['court', 'customer', 'user'])->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan.',
            ], 404);
        }

        // Authorization check: User must be court owner or the booking creator
        $isOwner = $booking->court && $booking->court->owner_id === $user->user_id;
        $isCustomer = $booking->user_id === $user->user_id;

        if (!$isOwner && !$isCustomer && $user->role !== 'ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke data booking ini.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => $booking,
        ]);
    }

    // PUT /api/bookings/{id} — Update booking status
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::with('court')->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan.',
            ], 404);
        }

        $isOwner = $booking->court && $booking->court->owner_id === $user->user_id;
        $isCustomer = $booking->user_id === $user->user_id;

        if (!$isOwner && !$isCustomer && $user->role !== 'ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengubah booking ini.',
            ], 403);
        }

        // Customer can only cancel their own pending booking
        if ($isCustomer && !$isOwner && $user->role !== 'ADMIN') {
            if ($booking->status !== 'PENDING') {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking yang sudah dikonfirmasi atau dibatalkan tidak dapat diubah.',
                ], 422);
            }

            $validated = $request->validate([
                'status' => 'required|in:CANCELLED',
                'notes'  => 'nullable|string|max:1000',
            ]);

            $booking->update([
                'status' => 'CANCELLED',
                'notes'  => $validated['notes'] ?? $booking->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking berhasil dibatalkan.',
                'data'    => $booking->fresh(['court', 'customer']),
            ]);
        }

        // Owner / Admin can update to PENDING, CONFIRMED, or CANCELLED
        $validated = $request->validate([
            'status' => 'required|in:PENDING,CONFIRMED,CANCELLED',
            'notes'  => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($booking, $validated) {
            // If re-activating a CANCELLED booking, verify slot is still available
            if ($booking->status === 'CANCELLED' && in_array($validated['status'], ['PENDING', 'CONFIRMED'])) {
                $conflict = Booking::where('court_id', $booking->court_id)
                    ->where('booking_id', '!=', $booking->booking_id)
                    ->where('booking_date', $booking->booking_date)
                    ->where('status', '!=', 'CANCELLED')
                    ->where('start_time', '<', $booking->end_time)
                    ->where('end_time', '>', $booking->start_time)
                    ->lockForUpdate()
                    ->exists();

                if ($conflict) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Tidak dapat mengaktifkan booking kembali karena slot waktu sudah terisi booking lain.',
                    ], 409);
                }
            }

            $booking->update($validated);

            return response()->json([
                'success' => true,
                'data'    => $booking->fresh(['court', 'customer']),
            ]);
        });
    }

    // ==========================================
    // PUBLIC SLOTS CHECK (Tanpa Login)
    // ==========================================

    // GET /api/public/courts/{id}/slots?date=YYYY-MM-DD
    public function publicSlots(Request $request, $id)
    {
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
        ]);

        $court = Court::where('court_id', $id)
            ->where('status', 'ACTIVE')
            ->with('operatingHours')
            ->first();

        if (!$court) {
            return response()->json([
                'success' => false,
                'message' => 'Lapangan tidak ditemukan atau tidak aktif.',
            ], 404);
        }

        $bookingDate = Carbon::parse($validated['date']);
        $dayOfWeek   = $bookingDate->dayOfWeek;

        $operatingHour = $court->operatingHours
            ->where('day_of_week', $dayOfWeek)
            ->first();

        $isClosed  = $operatingHour ? (bool) $operatingHour->is_closed : false;
        $openTime  = $operatingHour && $operatingHour->open_time ? Carbon::parse($operatingHour->open_time)->format('H:i') : '08:00';
        $closeTime = $operatingHour && $operatingHour->close_time ? Carbon::parse($operatingHour->close_time)->format('H:i') : '23:00';

        // Return only booked start/end times and status (privacy preserved)
        $existingBookings = Booking::where('court_id', $court->court_id)
            ->where('booking_date', $validated['date'])
            ->where('status', '!=', 'CANCELLED')
            ->get(['start_time', 'end_time', 'status']);

        return response()->json([
            'success' => true,
            'data'    => [
                'court'            => [
                    'court_id'       => $court->court_id,
                    'name'           => $court->name,
                    'sport_type'     => $court->sport_type,
                    'price_per_hour' => $court->price_per_hour,
                    'address'        => $court->address,
                    'city'           => $court->city,
                ],
                'date'             => $validated['date'],
                'is_closed'        => $isClosed,
                'operating_hours'  => [
                    'open_time'  => $openTime,
                    'close_time' => $closeTime,
                ],
                'booked_slots'     => $existingBookings,
            ],
        ]);
    }

    // ==========================================
    // PRIVATE HELPERS
    // ==========================================

    private function generateUniqueBookingCode(int $maxRetries = 5): string
    {
        for ($i = 0; $i < $maxRetries; $i++) {
            $code = 'BK' . strtoupper(Str::random(8));
            if (!Booking::where('booking_code', $code)->exists()) {
                return $code;
            }
        }

        return 'BK' . strtoupper(dechex(time())) . strtoupper(Str::random(4));
    }
}