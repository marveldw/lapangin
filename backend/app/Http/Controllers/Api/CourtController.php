<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\Plan;
use Illuminate\Http\Request;

class CourtController extends Controller
{
    // GET /api/courts — owner sees only their own courts
    public function index(Request $request)
    {
        $courts = Court::where('owner_id', $request->user()->user_id)
            ->with('operatingHours')
            ->paginate(25);

        return response()->json([
            'success' => true,
            'data'    => $courts,
        ]);
    }

    // POST /api/courts — create court with plan limit check
    public function store(Request $request)
    {
        $user = $request->user();

        // Get active subscription and plan, or fallback to default Free plan
        $subscription = $user->subscriptions()
            ->where('status', 'ACTIVE')
            ->with('plan')
            ->first();

        $maxCourts = 1; // default limit
        $planName  = 'FREE';

        if ($subscription && $subscription->plan) {
            $maxCourts = $subscription->plan->max_courts;
            $planName  = $subscription->plan->name;
        } else {
            $freePlan = Plan::where('name', 'FREE')->first();
            if ($freePlan) {
                $maxCourts = $freePlan->max_courts;
            }
        }

        $currentCourts = Court::where('owner_id', $user->user_id)
            ->where('status', 'ACTIVE')
            ->count();

        if ($maxCourts !== null && $currentCourts >= $maxCourts) {
            return response()->json([
                'success' => false,
                'message' => 'Batas maksimal lapangan untuk paket ' . $planName . ' (' . $maxCourts . ' lapangan) telah tercapai. Silakan upgrade paket Anda.',
            ], 403);
        }

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'sport_type'     => 'required|string|max:255',
            'description'    => 'nullable|string|max:2000',
            'price_per_hour' => 'required|integer|min:1',
            'address'        => 'required|string|max:255',
            'city'           => 'required|string|max:100',
            'district'       => 'nullable|string|max:100',
            'image_url'      => 'nullable|url|max:255',
            'status'         => 'in:ACTIVE,INACTIVE',
        ]);

        $court = Court::create([
            ...$validated,
            'owner_id' => $user->user_id,
            'status'   => $validated['status'] ?? 'ACTIVE',
        ]);

        return response()->json([
            'success' => true,
            'data'    => $court,
        ], 201);
    }

    // GET /api/courts/{id}
    public function show(Request $request, $id)
    {
        $court = Court::where('court_id', $id)
            ->where('owner_id', $request->user()->user_id)
            ->with('operatingHours')
            ->first();

        if (!$court) {
            return response()->json([
                'success' => false,
                'message' => 'Lapangan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $court,
        ]);
    }

    // PUT /api/courts/{id}
    public function update(Request $request, $id)
    {
        $court = Court::where('court_id', $id)
            ->where('owner_id', $request->user()->user_id)
            ->first();

        if (!$court) {
            return response()->json([
                'success' => false,
                'message' => 'Lapangan tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'sport_type'     => 'sometimes|string|max:255',
            'description'    => 'nullable|string|max:2000',
            'price_per_hour' => 'sometimes|integer|min:1',
            'address'        => 'sometimes|string|max:255',
            'city'           => 'sometimes|string|max:100',
            'district'       => 'nullable|string|max:100',
            'image_url'      => 'nullable|url|max:255',
            'status'         => 'sometimes|in:ACTIVE,INACTIVE',
        ]);

        $court->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $court,
        ]);
    }

    // DELETE /api/courts/{id} — soft delete via status
    public function destroy(Request $request, $id)
    {
        $court = Court::where('court_id', $id)
            ->where('owner_id', $request->user()->user_id)
            ->first();

        if (!$court) {
            return response()->json([
                'success' => false,
                'message' => 'Lapangan tidak ditemukan.',
            ], 404);
        }

        $court->update(['status' => 'INACTIVE']);

        return response()->json([
            'success' => true,
            'message' => 'Lapangan berhasil dinonaktifkan.',
        ]);
    }
}