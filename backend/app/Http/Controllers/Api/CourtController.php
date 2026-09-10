<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\CourtOperatingHour;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'sport_type'     => 'required|string|max:255',
            'description'    => 'nullable|string|max:2000',
            'price_per_hour' => 'required|integer|min:1',
            'address'        => 'required|string|max:255',
            'city'           => 'required|string|max:100',
            'district'       => 'nullable|string|max:100',
            'image'          => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:2048',
            'image_url'      => 'nullable|string|max:5000000',
            'status'         => 'in:ACTIVE,INACTIVE',
        ]);

        $this->resolveImageUrl($request, $validated);

        return DB::transaction(function () use ($user, $validated) {
            // Lock user row untuk menserialisasi pengecekan kuota paket dan mencegah race condition
            $lockedUser = User::where('user_id', $user->user_id)
                ->lockForUpdate()
                ->first();

            // Get active subscription and plan, or fallback to default Free plan
            $subscription = $lockedUser->subscriptions()
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

            $currentCourts = Court::where('owner_id', $lockedUser->user_id)
                ->where('status', 'ACTIVE')
                ->count();

            if ($maxCourts !== null && $currentCourts >= $maxCourts) {
                return response()->json([
                    'success' => false,
                    'message' => 'Batas maksimal lapangan untuk paket ' . $planName . ' (' . $maxCourts . ' lapangan) telah tercapai. Silakan upgrade paket Anda.',
                ], 403);
            }

            $court = Court::create([
                ...$validated,
                'owner_id' => $lockedUser->user_id,
                'status'   => $validated['status'] ?? 'ACTIVE',
            ]);

            // Auto-create default operating hours (Senin-Minggu 08:00 - 22:00) agar langsung bisa dibooking
            for ($day = 0; $day <= 6; $day++) {
                CourtOperatingHour::firstOrCreate(
                    [
                        'court_id'    => $court->court_id,
                        'day_of_week' => $day,
                    ],
                    [
                        'open_time'  => '08:00',
                        'close_time' => '22:00',
                        'is_closed'  => false,
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'data'    => $court->load('operatingHours'),
            ], 201);
        });
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
            'image'          => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:2048',
            'image_url'      => 'nullable|string|max:5000000',
            'status'         => 'sometimes|in:ACTIVE,INACTIVE',
        ]);

        $this->resolveImageUrl($request, $validated);

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

    // POST /api/courts/upload-image — dedicated secure photo upload
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|file|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Simpan dengan nama hash acak (keamanan: mencegah path traversal dan script eksekusi)
        $path = $request->file('image')->store('courts', 'public');
        $url  = url('storage/' . $path);

        return response()->json([
            'success'   => true,
            'message'   => 'Foto lapangan berhasil diunggah.',
            'image_url' => $url,
            'path'      => $path,
        ]);
    }

    // Helper: Validasi & ekstrak file upload fisik / Base64 Data URL menjadi URL Storage aman
    private function resolveImageUrl(Request $request, array &$validated): void
    {
        // 1. File fisik diunggah via multipart/form-data
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('courts', 'public');
            $validated['image_url'] = url('storage/' . $path);
        }
        // 2. Base64 Data URL (misal dari FileReader JS frontend)
        elseif (!empty($validated['image_url']) && preg_match('/^data:image\/(jpeg|png|jpg|webp);base64,/', $validated['image_url'])) {
            $parts  = explode(',', $validated['image_url'], 2);
            $binary = base64_decode($parts[1] ?? '', true);

            // Batasi ukuran maksimal 2MB (2 * 1024 * 1024 bytes)
            if ($binary !== false && strlen($binary) <= 2 * 1024 * 1024) {
                // Verifikasi MIME type asli dari binary (keamanan: cegah spoofing file script/virus)
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mime  = finfo_buffer($finfo, $binary);
                finfo_close($finfo);

                $allowedMimes = [
                    'image/jpeg' => 'jpg',
                    'image/png'  => 'png',
                    'image/webp' => 'webp',
                ];

                if (isset($allowedMimes[$mime])) {
                    $filename = 'courts/' . Str::random(40) . '.' . $allowedMimes[$mime];
                    Storage::disk('public')->put($filename, $binary);
                    $validated['image_url'] = url('storage/' . $filename);
                }
            }
        }

        unset($validated['image']);
    }
}