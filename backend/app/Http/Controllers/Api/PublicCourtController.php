<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Court;
use Illuminate\Http\Request;

class PublicCourtController extends Controller
{
    // GET /api/public/courts?city=Bandung&district=Coblong&sport_type=futsal
    public function index(Request $request)
    {
        $validated = $request->validate([
            'city'       => 'nullable|string|max:100',
            'district'   => 'nullable|string|max:100',
            'sport_type' => 'nullable|string|max:255',
            'search'     => 'nullable|string|max:255',
        ]);

        $query = Court::where('status', 'ACTIVE')
            ->with('operatingHours');

        // Filter by city (from user location or manual selection)
        if (!empty($validated['city'])) {
            $query->where('city', $validated['city']);
        }

        // Filter by district (optional, more specific)
        if (!empty($validated['district'])) {
            $query->where('district', $validated['district']);
        }

        // Filter by sport type
        if (!empty($validated['sport_type'])) {
            $query->where('sport_type', $validated['sport_type']);
        }

        // Search by name or address
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('address', 'ILIKE', "%{$search}%");
            });
        }

        $courts = $query
            ->select([
                'court_id', 'name', 'sport_type', 'description',
                'price_per_hour', 'address', 'city', 'district',
                'image_url',
            ])
            ->orderBy('name')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $courts,
        ]);
    }

    // GET /api/public/courts/{id} — detail lapangan untuk halaman booking
    public function show(Request $request, $id)
    {
        $court = Court::where('court_id', $id)
            ->where('status', 'ACTIVE')
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
            'data'    => [
                'court_id'       => $court->court_id,
                'name'           => $court->name,
                'sport_type'     => $court->sport_type,
                'description'    => $court->description,
                'price_per_hour' => $court->price_per_hour,
                'address'        => $court->address,
                'city'           => $court->city,
                'district'       => $court->district,
                'image_url'      => $court->image_url,
                'operating_hours' => $court->operatingHours,
            ],
        ]);
    }

    // GET /api/public/cities — daftar kota yang tersedia (untuk dropdown)
    public function cities()
    {
        $cities = Court::where('status', 'ACTIVE')
            ->select('city')
            ->distinct()
            ->orderBy('city')
            ->pluck('city');

        return response()->json([
            'success' => true,
            'data'    => $cities,
        ]);
    }

    // GET /api/public/cities/{city}/districts — daftar kecamatan per kota
    public function districts(Request $request, $city)
    {
        $districts = Court::where('status', 'ACTIVE')
            ->where('city', $city)
            ->whereNotNull('district')
            ->select('district')
            ->distinct()
            ->orderBy('district')
            ->pluck('district');

        return response()->json([
            'success' => true,
            'data'    => $districts,
        ]);
    }

    // GET /api/public/sport-types — daftar jenis olahraga yang tersedia
    public function sportTypes()
    {
        $types = Court::where('status', 'ACTIVE')
            ->select('sport_type')
            ->distinct()
            ->orderBy('sport_type')
            ->pluck('sport_type');

        return response()->json([
            'success' => true,
            'data'    => $types,
        ]);
    }
}
