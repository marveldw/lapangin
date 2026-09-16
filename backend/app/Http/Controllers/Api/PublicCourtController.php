<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\District;
use App\Models\Regency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $like = DB::getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';

        // Filter by city (flexible matching: exact, LIKE/ILIKE, or with/without Kota/Kabupaten)
        if (!empty($validated['city'])) {
            $cityVal = trim($validated['city']);
            $query->where(function ($q) use ($cityVal, $like) {
                $q->where('city', $cityVal)
                  ->orWhere('city', $like, $cityVal);

                if (str_starts_with($cityVal, 'Kota ')) {
                    $stripped = substr($cityVal, 5);
                    $q->orWhere('city', $stripped)->orWhere('city', $like, $stripped);
                } elseif (str_starts_with($cityVal, 'Kabupaten ')) {
                    $stripped = substr($cityVal, 10);
                    $q->orWhere('city', $stripped)->orWhere('city', $like, $stripped);
                } else {
                    $q->orWhere('city', "Kota {$cityVal}")
                      ->orWhere('city', "Kabupaten {$cityVal}")
                      ->orWhere('city', $like, "Kota {$cityVal}")
                      ->orWhere('city', $like, "Kabupaten {$cityVal}");
                }
            });
        }

        // Filter by district (optional, more specific)
        if (!empty($validated['district'])) {
            $query->where(function ($q) use ($validated, $like) {
                $q->where('district', $validated['district'])
                  ->orWhere('district', $like, $validated['district']);
            });
        }

        // Filter by sport type
        if (!empty($validated['sport_type'])) {
            $query->where('sport_type', $validated['sport_type']);
        }

        // Search by name or address
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search, $like) {
                $q->where('name', $like, "%{$search}%")
                  ->orWhere('address', $like, "%{$search}%");
            });
        }

        $perPage = min(50, max(1, (int) $request->query('per_page', 10)));

        $courts = $query
            ->select([
                'court_id', 'name', 'sport_type', 'description',
                'price_per_hour', 'address', 'city', 'district',
                'image_url',
            ])
            ->orderBy('name')
            ->paginate($perPage);

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

    // GET /api/public/cities — daftar kota yang tersedia (untuk dropdown, mendukung ?search=...)
    public function cities(Request $request)
    {
        $like = DB::getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';

        // Support ?has_courts=1 filter if requested
        if ($request->boolean('has_courts')) {
            $query = Court::where('status', 'ACTIVE')
                ->whereNotNull('city')
                ->where('city', '!=', '');

            if ($request->filled('search')) {
                $query->where('city', $like, '%' . trim($request->search) . '%');
            }

            $cities = $query->select('city')
                ->distinct()
                ->orderBy('city')
                ->pluck('city');

            return response()->json([
                'success' => true,
                'data'    => $cities,
            ]);
        }

        // Query comprehensive regencies from database
        $regencyQuery = Regency::query();
        if ($request->filled('search')) {
            $search = trim($request->search);
            $regencyQuery->where(function ($q) use ($search, $like) {
                $q->where('name', $like, "%{$search}%")
                  ->orWhere('alt_name', $like, "%{$search}%");
            });
        }
        $cities = $regencyQuery->orderBy('name')->pluck('name');

        // If regencies table is empty for some reason, fallback to courts table
        if ($cities->isEmpty()) {
            $courtQuery = Court::where('status', 'ACTIVE')
                ->whereNotNull('city')
                ->where('city', '!=', '');

            if ($request->filled('search')) {
                $courtQuery->where('city', $like, '%' . trim($request->search) . '%');
            }

            $cities = $courtQuery->select('city')
                ->distinct()
                ->orderBy('city')
                ->pluck('city');
        }

        return response()->json([
            'success' => true,
            'data'    => $cities,
        ]);
    }

    // GET /api/public/cities/{city}/districts — daftar kecamatan per kota (mendukung ?search=...)
    public function districts(Request $request, $city)
    {
        $cityDecoded = trim(urldecode($city));
        $like = DB::getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';

        // 1. Match regency in database by name, alt_name, or case-insensitive prefix
        $regency = Regency::where('name', $cityDecoded)
            ->orWhere('alt_name', $cityDecoded)
            ->orWhere('name', $like, $cityDecoded)
            ->orWhere('alt_name', $like, $cityDecoded)
            ->first();

        if (!$regency) {
            $regency = Regency::where('name', $like, "Kota {$cityDecoded}")
                ->orWhere('name', $like, "Kabupaten {$cityDecoded}")
                ->first();
        }

        if ($regency) {
            $districtQuery = District::where('regency_id', $regency->id);
            if ($request->filled('search')) {
                $districtQuery->where('name', $like, '%' . trim($request->search) . '%');
            }
            $districts = $districtQuery->orderBy('name')->pluck('name');

            return response()->json([
                'success' => true,
                'data'    => $districts,
            ]);
        }

        // 2. Fallback to courts table
        $fallbackQuery = Court::where('status', 'ACTIVE')
            ->where(function ($q) use ($cityDecoded, $like) {
                $q->where('city', $cityDecoded)
                  ->orWhere('city', $like, $cityDecoded);
            })
            ->whereNotNull('district');

        if ($request->filled('search')) {
            $fallbackQuery->where('district', $like, '%' . trim($request->search) . '%');
        }

        $districts = $fallbackQuery->select('district')
            ->distinct()
            ->orderBy('district')
            ->pluck('district');

        return response()->json([
            'success' => true,
            'data'    => $districts,
        ]);
    }

    // GET /api/public/districts — pencarian kecamatan server-side global (?search=...)
    public function allDistricts(Request $request)
    {
        $search = trim($request->query('search', ''));
        if (strlen($search) < 2) {
            return response()->json([
                'success' => true,
                'data'    => [],
                'message' => 'Masukkan minimal 2 karakter untuk mencari kecamatan.',
            ]);
        }

        $like = DB::getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
        $districts = District::with('regency:id,name')
            ->where('name', $like, "%{$search}%")
            ->orderBy('name')
            ->limit(30)
            ->get(['id', 'regency_id', 'name'])
            ->map(function ($d) {
                return [
                    'district' => $d->name,
                    'city'     => $d->regency?->name,
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $districts,
        ]);
    }

    // GET /api/public/sport-types — daftar jenis olahraga dari master config (mendukung ?has_courts=1 & ?detailed=1)
    public function sportTypes(Request $request)
    {
        $allConfigSports = config('sports.types', []);

        // Filter hanya yang memiliki lapangan aktif jika diminta
        if ($request->boolean('has_courts')) {
            $activeTypes = Court::where('status', 'ACTIVE')
                ->whereNotNull('sport_type')
                ->where('sport_type', '!=', '')
                ->select('sport_type')
                ->distinct()
                ->orderBy('sport_type')
                ->pluck('sport_type');

            return response()->json([
                'success' => true,
                'data'    => $activeTypes,
            ]);
        }

        if ($request->boolean('detailed')) {
            $detailed = [];
            foreach ($allConfigSports as $name => $meta) {
                $detailed[] = array_merge(['name' => $name], $meta);
            }
            return response()->json([
                'success' => true,
                'data'    => $detailed,
            ]);
        }

        $types = array_keys($allConfigSports);

        return response()->json([
            'success' => true,
            'data'    => $types,
        ]);
    }
}
