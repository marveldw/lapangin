<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourtRequest;
use App\Http\Requests\UpdateCourtRequest;
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
    // GET /api/courts (or /api/owner/courts) — owner sees only their own courts
    public function index(Request $request)
    {
        $perPage = min(50, max(1, (int) $request->query('per_page', 10)));
        $courts = Court::where('owner_id', $request->user()->user_id)
            ->with('operatingHours')
            ->paginate($perPage);

        $today = now()->toDateString();
        $currentTime = now()->toTimeString();

        $courts->getCollection()->transform(function ($court) use ($today, $currentTime) {
            $court->has_active_booking = $court->bookings()
                ->where('booking_date', $today)
                ->where('status', 'CONFIRMED')
                ->where('end_time', '>', $currentTime)
                ->exists();
            return $court;
        });

        return response()->json([
            'success' => true,
            'data'    => $courts,
        ]);
    }

    // POST /api/courts (or /api/owner/courts) — create court with plan limit check, secure image upload, and operating hours
    public function store(StoreCourtRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        // 1. Resolve operating hours from request or parsed description
        $openTime  = $validated['open_time'] ?? $request->input('open_time');
        $closeTime = $validated['close_time'] ?? $request->input('close_time');

        if ((!$openTime || !$closeTime) && !empty($validated['description'])) {
            if (preg_match('/Jam Operasional:\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/', $validated['description'], $matches)) {
                $openTime  = $openTime ?: $matches[1];
                $closeTime = $closeTime ?: $matches[2];
            }
        }

        $openTime  = $openTime ?: '08:00';
        $closeTime = $closeTime ?: '22:00';

        $openTimeStr  = strlen($openTime) === 5 ? "{$openTime}:00" : $openTime;
        $closeTimeStr = strlen($closeTime) === 5 ? "{$closeTime}:00" : $closeTime;

        // 2. Resolve image and remove transient fields
        $this->resolveImageUrl($request, $validated);
        unset($validated['open_time'], $validated['close_time']);

        return DB::transaction(function () use ($user, $validated, $openTimeStr, $closeTimeStr) {
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
                'name'           => $validated['name'],
                'sport_type'     => $validated['sport_type'],
                'description'    => $validated['description'] ?? null,
                'price_per_hour' => $validated['price_per_hour'],
                'address'        => $validated['address'],
                'city'           => $validated['city'],
                'district'       => $validated['district'] ?? null,
                'image_url'      => $validated['image_url'] ?? null,
                'owner_id'       => $lockedUser->user_id,
                'status'         => $validated['status'] ?? 'ACTIVE',
            ]);

            // Save actual operating hours for all 7 days (0=Sunday .. 6=Saturday)
            for ($day = 0; $day <= 6; $day++) {
                CourtOperatingHour::updateOrCreate(
                    [
                        'court_id'    => $court->court_id,
                        'day_of_week' => $day,
                    ],
                    [
                        'open_time'  => $openTimeStr,
                        'close_time' => $closeTimeStr,
                        'is_closed'  => false,
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Lapangan berhasil ditambahkan.',
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

    // PUT /api/courts/{id} (or /api/owner/courts/{id})
    public function update(UpdateCourtRequest $request, $id)
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

        $validated = $request->validated();

        // 1. Resolve operating hours
        $openTime  = $validated['open_time'] ?? $request->input('open_time');
        $closeTime = $validated['close_time'] ?? $request->input('close_time');

        if ((!$openTime || !$closeTime) && !empty($validated['description'])) {
            if (preg_match('/Jam Operasional:\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/', $validated['description'], $matches)) {
                $openTime  = $openTime ?: $matches[1];
                $closeTime = $closeTime ?: $matches[2];
            }
        }

        $openTimeStr  = $openTime ? (strlen($openTime) === 5 ? "{$openTime}:00" : $openTime) : null;
        $closeTimeStr = $closeTime ? (strlen($closeTime) === 5 ? "{$closeTime}:00" : $closeTime) : null;

        // 2. Resolve image and remove transient fields
        $this->resolveImageUrl($request, $validated);
        unset($validated['open_time'], $validated['close_time']);

        // Prevent deactivating court if it has ongoing/confirmed booking today (Item 11)
        if (isset($validated['status']) && $validated['status'] === 'INACTIVE' && $court->status === 'ACTIVE') {
            $today = now()->toDateString();
            $currentTime = now()->toTimeString();
            $hasActiveBooking = $court->bookings()
                ->where('booking_date', $today)
                ->where('status', 'CONFIRMED')
                ->where('end_time', '>', $currentTime)
                ->exists();

            if ($hasActiveBooking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menonaktifkan lapangan karena terdapat jadwal booking aktif hari ini.',
                ], 422);
            }
        }

        return DB::transaction(function () use ($court, $validated, $openTimeStr, $closeTimeStr) {
            $court->update([
                'name'           => $validated['name'] ?? $court->name,
                'sport_type'     => $validated['sport_type'] ?? $court->sport_type,
                'description'    => array_key_exists('description', $validated) ? $validated['description'] : $court->description,
                'price_per_hour' => $validated['price_per_hour'] ?? $court->price_per_hour,
                'address'        => $validated['address'] ?? $court->address,
                'city'           => $validated['city'] ?? $court->city,
                'district'       => array_key_exists('district', $validated) ? $validated['district'] : $court->district,
                'image_url'      => $validated['image_url'] ?? $court->image_url,
                'status'         => $validated['status'] ?? $court->status,
            ]);

            // If operating hours were provided or updated, synchronize all 7 days
            if ($openTimeStr && $closeTimeStr) {
                for ($day = 0; $day <= 6; $day++) {
                    CourtOperatingHour::updateOrCreate(
                        [
                            'court_id'    => $court->court_id,
                            'day_of_week' => $day,
                        ],
                        [
                            'open_time'  => $openTimeStr,
                            'close_time' => $closeTimeStr,
                            'is_closed'  => false,
                        ]
                    );
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Data lapangan berhasil diperbarui.',
                'data'    => $court->fresh('operatingHours'),
            ]);
        });
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
        $court->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lapangan berhasil dihapus (soft-delete). Riwayat pemesanan tetap tersimpan.',
        ]);
    }

    // POST /api/courts/upload-image — dedicated secure photo upload
    public function uploadImage(Request $request)
    {
        $maxSizeKb = (int) config('court.max_image_size_kb', env('MAX_COURT_IMAGE_SIZE_KB', 2048));

        $request->validate([
            'image' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,png,jpg,webp',
                "max:{$maxSizeKb}",
            ],
        ]);

        $file = $request->file('image');
        $this->validateImageContentSecurity($file);

        // Simpan dengan nama hash acak (keamanan: mencegah path traversal dan script eksekusi)
        $path = $file->store('courts', 'public');
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
            $file = $request->file('image');
            $this->validateImageContentSecurity($file);
            $path = $file->store('courts', 'public');
            $validated['image_url'] = url('storage/' . $path);
        }
        // 2. Base64 Data URL (misal dari FileReader JS frontend)
        elseif (!empty($validated['image_url']) && preg_match('/^data:image\/(jpeg|png|jpg|webp);base64,/', $validated['image_url'])) {
            $parts  = explode(',', $validated['image_url'], 2);
            $binary = base64_decode($parts[1] ?? '', true);
            $maxBytes = (int) config('court.max_image_size_kb', env('MAX_COURT_IMAGE_SIZE_KB', 2048)) * 1024;

            if ($binary !== false && strlen($binary) <= $maxBytes) {
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
        // 3. Fallback jika image_url kosong: gunakan preset olahraga
        elseif (empty($validated['image_url']) && !empty($validated['sport_type'])) {
            $validated['image_url'] = $this->getCourtFallbackImage($validated['sport_type']);
        }

        unset($validated['image']);
    }

    private function validateImageContentSecurity($file): void
    {
        $originalName = strtolower($file->getClientOriginalName());

        if (str_contains($originalName, "\0") || str_contains($originalName, '..')) {
            abort(422, 'Nama file tidak valid (terdeteksi karakter berbahaya).');
        }

        $dangerousExtensions = [
            'php', 'php3', 'php4', 'php5', 'phtml', 'phar',
            'exe', 'sh', 'bash', 'bat', 'cmd', 'js', 'py', 'pl', 'cgi',
            'asp', 'aspx', 'jsp', 'jar', 'vbs', 'scr', 'html', 'htm', 'svg'
        ];

        $extensionsInName = explode('.', $originalName);
        array_shift($extensionsInName);
        foreach ($extensionsInName as $ext) {
            if (in_array($ext, $dangerousExtensions, true)) {
                abort(422, 'File mengandung ekstensi berbahaya yang dilarang.');
            }
        }

        $realPath = $file->getRealPath();
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $realPath);
        finfo_close($finfo);

        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($mime, $allowedMimes, true)) {
            abort(422, 'Konten file bukan merupakan gambar yang valid (MIME tidak sesuai).');
        }

        $imageInfo = @getimagesize($realPath);
        if ($imageInfo === false || empty($imageInfo[0]) || empty($imageInfo[1])) {
            abort(422, 'File yang diunggah bukan gambar asli yang valid.');
        }

        $contents = @file_get_contents($realPath, false, null, 0, 4096);
        if ($contents && (
            stripos($contents, '<?php') !== false ||
            stripos($contents, '<?=') !== false ||
            stripos($contents, '<script') !== false
        )) {
            abort(422, 'File terdeteksi mengandung skrip kode terlarang.');
        }
    }

    private function getCourtFallbackImage(?string $sportType): string
    {
        $presets = [
            'Badminton'   => 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80',
            'Futsal'      => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
            'Basket'      => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
            'Tenis'       => 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
            'Mini Soccer' => 'https://images.unsplash.com/photo-1529900245534-47fbf8674971?w=800&q=80',
            'Voli'        => 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
        ];

        return $presets[$sportType] ?? 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80';
    }
}
