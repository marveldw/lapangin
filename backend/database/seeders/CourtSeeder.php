<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\CourtOperatingHour;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourtSeeder extends Seeder
{
    /**
     * Total courts to generate via factory if needed.
     */
    public const FACTORY_COURTS_COUNT = 15;

    /**
     * Operating hour profiles to test varied scheduling logic.
     */
    protected static array $scheduleProfiles = [
        // Profile A: Standard (08:00 - 22:00 every day)
        'standard' => [
            'default' => ['open' => '08:00:00', 'close' => '22:00:00', 'closed' => false],
        ],
        // Profile B: Early Bird (06:00 - 20:00 every day)
        'early' => [
            'default' => ['open' => '06:00:00', 'close' => '20:00:00', 'closed' => false],
        ],
        // Profile C: Late Night (09:00 - 23:00 every day)
        'late' => [
            'default' => ['open' => '09:00:00', 'close' => '23:00:00', 'closed' => false],
        ],
        // Profile D: Extended Hours (07:00 - 23:00 every day)
        'extended' => [
            'default' => ['open' => '07:00:00', 'close' => '23:00:00', 'closed' => false],
        ],
        // Profile E: Closed on Monday (Day 1 is closed for maintenance)
        'monday_off' => [
            'default' => ['open' => '08:00:00', 'close' => '22:00:00', 'closed' => false],
            'overrides' => [
                1 => ['open' => '08:00:00', 'close' => '22:00:00', 'closed' => true],
            ],
        ],
        // Profile F: Weekend Extended (Weekdays 09:00-21:00, Sat & Sun 06:00-23:00)
        'weekend_extended' => [
            'default' => ['open' => '09:00:00', 'close' => '21:00:00', 'closed' => false],
            'overrides' => [
                0 => ['open' => '06:00:00', 'close' => '23:00:00', 'closed' => false], // Sun
                6 => ['open' => '06:00:00', 'close' => '23:00:00', 'closed' => false], // Sat
            ],
        ],
    ];

    /**
     * Curated list of courts representing every sport with accurate photos and pricing.
     */
    protected static array $curatedCourts = [
        [
            'name' => 'GOR Senayan Badminton Center',
            'sport_type' => 'Badminton',
            'description' => 'Lapangan bulutangkis karpet Li-Ning standar internasional dengan pencahayaan anti-glare.',
            'price_per_hour' => 60000,
            'address' => 'Jl. Asia Afrika No. 8, Gelora',
            'city' => 'Jakarta Pusat',
            'district' => 'Tanah Abang',
            'image_url' => 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
            'profile' => 'extended',
        ],
        [
            'name' => 'Mega Futsal Arena Cilandak',
            'sport_type' => 'Futsal',
            'description' => 'Lapangan futsal vinyl interlock empuk dengan ruang ganti, kantin, dan tribune penonton.',
            'price_per_hour' => 150000,
            'address' => 'Jl. TB Simatupang No. 33, Cilandak',
            'city' => 'Jakarta Selatan',
            'district' => 'Cilandak',
            'image_url' => 'https://images.unsplash.com/photo-1529900240051-06c3960f703f?auto=format&fit=crop&w=800&q=80',
            'profile' => 'late',
        ],
        [
            'name' => 'Dunkers Basketball Court Dago',
            'sport_type' => 'Basket',
            'description' => 'Lapangan bola basket indoor parket kayu jati dengan ring hidrolik dan scoreboard digital.',
            'price_per_hour' => 180000,
            'address' => 'Jl. Ir. H. Juanda No. 112, Dago',
            'city' => 'Kota Bandung',
            'district' => 'Coblong',
            'image_url' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
            'profile' => 'standard',
        ],
        [
            'name' => 'Prima Tennis Club Surabaya',
            'sport_type' => 'Tenis',
            'description' => 'Lapangan tenis outdoor hard court permukaan DecoTurf dengan penerangan lampu malam.',
            'price_per_hour' => 120000,
            'address' => 'Jl. Raya Kertajaya Indah No. 45, Manyar',
            'city' => 'Kota Surabaya',
            'district' => 'Gubeng',
            'image_url' => 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
            'profile' => 'early',
        ],
        [
            'name' => 'Champions Mini Soccer Arena',
            'sport_type' => 'Mini Soccer',
            'description' => 'Mini soccer 7v7 rumput sintetis monofilament 5cm, standar FIFA dengan fasilitas shower air hangat.',
            'price_per_hour' => 350000,
            'address' => 'Jl. Raya Sawangan No. 78, Pancoran Mas',
            'city' => 'Depok',
            'district' => 'Pancoran Mas',
            'image_url' => 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
            'profile' => 'weekend_extended',
        ],
        [
            'name' => 'Padel Hub Kemang',
            'sport_type' => 'Padel',
            'description' => 'Lapangan padel modern dinding kaca tempered panoramic dengan raket sewa standar pro.',
            'price_per_hour' => 220000,
            'address' => 'Jl. Kemang Raya No. 19, Bangka',
            'city' => 'Jakarta Selatan',
            'district' => 'Mampang Prapatan',
            'image_url' => 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
            'profile' => 'late',
        ],
        [
            'name' => 'Mitra Voli Indoor Stadium',
            'sport_type' => 'Voli',
            'description' => 'Lapangan voli indoor taraflex empuk dengan net resmi PBVSI dan tribun penonton.',
            'price_per_hour' => 90000,
            'address' => 'Jl. Fatmawati No. 89, Cilandak',
            'city' => 'Jakarta Selatan',
            'district' => 'Cilandak',
            'image_url' => 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
            'profile' => 'monday_off',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fetch eligible owners
        $demoOwner = User::where('email', 'owner@lapangin.id')->first();
        $proOwners = User::where('role', 'OWNER')->where('email', 'like', 'owner.pro%')->get();
        $basicOwners = User::where('role', 'OWNER')->where('email', 'like', 'owner.basic%')->get();
        $freeOwners = User::where('role', 'OWNER')->where('email', 'like', 'owner.free%')->get();

        $allOwners = collect([$demoOwner])->merge($proOwners)->merge($basicOwners)->filter();

        // 1. Seed Curated Courts (ensuring high-quality test data for each sport)
        foreach (self::$curatedCourts as $index => $courtData) {
            $profileKey = $courtData['profile'];
            unset($courtData['profile']);

            // Distribute ownership: First two go to demo owner, rest distributed to active pro/basic owners
            $assignedOwner = ($index < 2 && $demoOwner)
                ? $demoOwner
                : ($allOwners->isNotEmpty() ? $allOwners->random() : $demoOwner);

            $court = Court::firstOrCreate(
                [
                    'name' => $courtData['name'],
                ],
                array_merge($courtData, [
                    'owner_id' => $assignedOwner ? $assignedOwner->user_id : 2,
                    'status' => 'ACTIVE',
                    'created_at' => now()->subMonths(rand(1, 4))->subDays(rand(1, 20)),
                    'updated_at' => now()->subDays(rand(1, 10)),
                ])
            );

            $this->seedOperatingHours($court, $profileKey);
        }

        // 2. Seed additional courts using Factory for diverse scale testing
        $profileKeys = array_keys(self::$scheduleProfiles);
        for ($i = 0; $i < self::FACTORY_COURTS_COUNT; $i++) {
            $randomOwner = $allOwners->isNotEmpty() ? $allOwners->random() : $demoOwner;
            $profileKey = $profileKeys[$i % count($profileKeys)];

            $court = Court::factory()->create([
                'owner_id' => $randomOwner ? $randomOwner->user_id : 2,
            ]);

            $this->seedOperatingHours($court, $profileKey);
        }
    }

    /**
     * Seed 7-day operating hours for a court based on chosen schedule profile.
     */
    private function seedOperatingHours(Court $court, string $profileKey): void
    {
        $profile = self::$scheduleProfiles[$profileKey] ?? self::$scheduleProfiles['standard'];
        $default = $profile['default'];
        $overrides = $profile['overrides'] ?? [];

        for ($day = 0; $day <= 6; $day++) {
            $config = $overrides[$day] ?? $default;

            CourtOperatingHour::updateOrCreate(
                [
                    'court_id' => $court->court_id,
                    'day_of_week' => $day,
                ],
                [
                    'open_time' => $config['open'],
                    'close_time' => $config['close'],
                    'is_closed' => $config['closed'],
                ]
            );
        }
    }
}
