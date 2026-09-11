<?php

namespace Database\Factories;

use App\Models\Court;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Court>
 */
class CourtFactory extends Factory
{
    protected $model = Court::class;

    protected static array $sports = [
        [
            'type' => 'Badminton',
            'names' => [
                'GOR Bulutangkis Smash Arena',
                'Champion Badminton Hall',
                'Duta Badminton Court',
                'Mitra Badminton Center',
                'Galaxy Badminton Arena',
                'Tangki Badminton Hall',
                'Permata Badminton Club',
            ],
            'price_min' => 35000,
            'price_max' => 85000,
            'images' => [
                'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1613918431703-aa62244243ef?auto=format&fit=crop&w=800&q=80',
            ],
            'desc' => 'Lapangan badminton karpet vinyl standar PBSI dengan pencahayaan LED anti-silau dan sirkulasi udara baik.',
        ],
        [
            'type' => 'Futsal',
            'names' => [
                'Planet Futsal Stadium',
                'Kickoff Futsal Arena',
                'Viva Futsal Center',
                'Garuda Futsal Park',
                'Sentra Futsal Club',
                'Champion Futsal Hall',
            ],
            'price_min' => 100000,
            'price_max' => 180000,
            'images' => [
                'https://images.unsplash.com/photo-1529900240051-06c3960f703f?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80',
            ],
            'desc' => 'Lapangan futsal rumput sintetis lembut standar FIFA dilengkapi jaring pengaman dan papan skor digital.',
        ],
        [
            'type' => 'Basket',
            'names' => [
                'Hoops Basketball Hall',
                'Crossover Basket Arena',
                'Dunk Basketball Center',
                'All-Star Court Basket',
            ],
            'price_min' => 120000,
            'price_max' => 220000,
            'images' => [
                'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
            ],
            'desc' => 'Lapangan basket indoor lantai kayu parket dengan ring hidrolik dan scoreboard standar Perbasi.',
        ],
        [
            'type' => 'Tenis',
            'names' => [
                'Ace Tennis Club',
                'Grand Slam Tennis Court',
                'Centre Court Tennis',
                'Clay & Hard Tennis Arena',
            ],
            'price_min' => 80000,
            'price_max' => 180000,
            'images' => [
                'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
            ],
            'desc' => 'Lapangan tenis hard court premium dengan garis presisi dan pencahayaan lampu untuk main malam hari.',
        ],
        [
            'type' => 'Mini Soccer',
            'names' => [
                'Mega Mini Soccer Arena',
                'Stamford Mini Soccer',
                'Greenfield Mini Soccer',
                'Nusantara Mini Soccer Field',
            ],
            'price_min' => 250000,
            'price_max' => 450000,
            'images' => [
                'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
            ],
            'desc' => 'Mini soccer 7v7 rumput monofilament tebal dengan tribun penonton dan ruang ganti pemain.',
        ],
        [
            'type' => 'Padel',
            'names' => [
                'Padel Club Jakarta',
                'Sunset Padel Court',
                'Apex Padel Arena',
            ],
            'price_min' => 150000,
            'price_max' => 300000,
            'images' => [
                'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
            ],
            'desc' => 'Lapangan padel kaca tempered dengan karpet turf panoramic dan raket sewa berkualitas.',
        ],
        [
            'type' => 'Voli',
            'names' => [
                'Spike Volleyball Arena',
                'Mitra Voli Stadium',
            ],
            'price_min' => 60000,
            'price_max' => 120000,
            'images' => [
                'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
            ],
            'desc' => 'Lapangan bola voli indoor interlock berstandar nasional, net adjustable, dan fasilitas shower.',
        ],
    ];

    protected static array $locations = [
        ['city' => 'Jakarta Selatan', 'district' => 'Cilandak', 'address' => 'Jl. TB Simatupang No. 18, Cilandak'],
        ['city' => 'Jakarta Selatan', 'district' => 'Tebet', 'address' => 'Jl. Tebet Raya No. 42, Tebet'],
        ['city' => 'Jakarta Barat', 'district' => 'Kebon Jeruk', 'address' => 'Jl. Panjang No. 88, Kebon Jeruk'],
        ['city' => 'Jakarta Pusat', 'district' => 'Tanah Abang', 'address' => 'Jl. K.H. Mas Mansyur No. 25, Tanah Abang'],
        ['city' => 'Kota Bandung', 'district' => 'Coblong', 'address' => 'Jl. Dago No. 102, Coblong'],
        ['city' => 'Kota Bandung', 'district' => 'Sukajadi', 'address' => 'Jl. Sukajadi No. 55, Sukajadi'],
        ['city' => 'Kota Surabaya', 'district' => 'Gubeng', 'address' => 'Jl. Raya Gubeng No. 64, Gubeng'],
        ['city' => 'Kota Surabaya', 'district' => 'Wonokromo', 'address' => 'Jl. Mayjen Sungkono No. 12, Wonokromo'],
        ['city' => 'Kota Semarang', 'district' => 'Tembalang', 'address' => 'Jl. Prof. Soedarto No. 9, Tembalang'],
        ['city' => 'Depok', 'district' => 'Beji', 'address' => 'Jl. Margonda Raya No. 120, Beji'],
        ['city' => 'Depok', 'district' => 'Cinere', 'address' => 'Jl. Cinere Raya No. 34, Cinere'],
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sport = fake()->randomElement(self::$sports);
        $loc = fake()->randomElement(self::$locations);
        $name = fake()->randomElement($sport['names']) . ' ' . fake()->numerify('##');
        $createdAt = fake()->dateTimeBetween('-5 months', '-2 days');

        return [
            'owner_id' => User::where('role', 'OWNER')->inRandomOrder()->value('user_id') ?? 2,
            'name' => $name,
            'sport_type' => $sport['type'],
            'description' => $sport['desc'],
            'price_per_hour' => fake()->numberBetween($sport['price_min'] / 1000, $sport['price_max'] / 1000) * 1000,
            'address' => $loc['address'],
            'city' => $loc['city'],
            'district' => $loc['district'],
            'image_url' => fake()->randomElement($sport['images']),
            'status' => 'ACTIVE',
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }
}
