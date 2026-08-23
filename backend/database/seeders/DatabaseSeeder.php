<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'FREE',
                'description' => 'Paket Percobaan',
                'price' => 0,
                'max_courts' => 1,
                'max_bookings_per_month' => 30,
                'is_active' => true,
            ],
            [
                'name' => 'BASIC',
                'description' => 'Paket Standar',
                'price' => 49000,
                'max_courts' => 5,
                'max_bookings_per_month' => null,
                'is_active' => true,
            ],
            [
                'name' => 'PRO',
                'description' => 'Paket Komplit',
                'price' => 99000,
                'max_courts' => null,
                'max_bookings_per_month' => null,
                'is_active' => true,
            ],
        ];

        foreach ($plans as $planData) {
            Plan::firstOrCreate(
                ['name' => $planData['name']],
                $planData
            );
        }
    }
}
