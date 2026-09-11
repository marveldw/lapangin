<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\CourtOperatingHour;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Plans
        $plans = [
            [
                'name'                   => 'FREE',
                'description'            => 'Paket Percobaan',
                'price'                  => 0,
                'max_courts'             => 1,
                'max_bookings_per_month' => 30,
                'is_active'              => true,
            ],
            [
                'name'                   => 'BASIC',
                'description'            => 'Paket Standar',
                'price'                  => 49000,
                'max_courts'             => 5,
                'max_bookings_per_month' => null,
                'is_active'              => true,
            ],
            [
                'name'                   => 'PRO',
                'description'            => 'Paket Komplit',
                'price'                  => 99000,
                'max_courts'             => null,
                'max_bookings_per_month' => null,
                'is_active'              => true,
            ],
        ];

        foreach ($plans as $planData) {
            Plan::firstOrCreate(
                ['name' => $planData['name']],
                $planData
            );
        }

        // 2. Seed Standard Roles (super_admin, owner, customer)
        $roles = ['super_admin', 'owner', 'customer'];
        foreach ($roles as $roleName) {
            \Spatie\Permission\Models\Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // Give super_admin all permissions if any exist
        $superAdmin = \Spatie\Permission\Models\Role::where('name', 'super_admin')->first();
        if ($superAdmin) {
            $superAdmin->syncPermissions(\Spatie\Permission\Models\Permission::all());
        }

        // 3. Seed Super Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@lapangin.id'],
            [
                'name'          => 'Super Admin Lapangin',
                'password_hash' => Hash::make('password123'),
                'phone'         => '081122334455',
                'role'          => 'ADMIN',
                'status'        => 'ACTIVE',
            ]
        );
        if ($admin && !$admin->hasRole('super_admin')) {
            $admin->assignRole('super_admin');
        }

        // 4. Seed Demo Owner User
        $owner = User::firstOrCreate(
            ['email' => 'owner@lapangin.id'],
            [
                'name'          => 'Shafa Owner',
                'password_hash' => Hash::make('password123'),
                'phone'         => '081234567890',
                'role'          => 'OWNER',
                'status'        => 'ACTIVE',
            ]
        );

        // Assign PRO subscription to Demo Owner
        $proPlan = Plan::where('name', 'PRO')->first();
        if ($proPlan && $owner) {
            Subscription::firstOrCreate(
                [
                    'user_id' => $owner->user_id,
                    'status'  => 'ACTIVE',
                ],
                [
                    'plan_id'    => $proPlan->plan_id,
                    'start_date' => now(),
                    'end_date'   => null,
                ]
            );
        }

        // 5. Seed Demo Customer User
        $customer = User::firstOrCreate(
            ['email' => 'customer@lapangin.id'],
            [
                'name'          => 'Budi Customer',
                'password_hash' => Hash::make('password123'),
                'phone'         => '081298765432',
                'role'          => 'CUSTOMER',
                'status'        => 'ACTIVE',
            ]
        );
        if ($customer && !$customer->hasRole('customer')) {
            $customer->assignRole('customer');
        }

        // 6. Seed Demo Courts for Owner
        if ($owner) {
            $courts = [
                [
                    'name'           => 'GOR Bulutangkis Shafa Arena',
                    'sport_type'     => 'Badminton',
                    'description'    => 'Lapangan badminton karpet vinyl standar PBSI dengan sirkulasi udara sejuk.',
                    'price_per_hour' => 45000,
                    'address'        => 'Jl. Margonda Raya No. 45',
                    'city'           => 'Depok',
                    'district'       => 'Beji',
                    'image_url'      => 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
                    'status'         => 'ACTIVE',
                ],
                [
                    'name'           => 'Shafa Futsal Stadium',
                    'sport_type'     => 'Futsal',
                    'description'    => 'Lapangan futsal rumput sintetis lembut dengan pencahayaan LED terang.',
                    'price_per_hour' => 120000,
                    'address'        => 'Jl. Cinere Raya No. 88',
                    'city'           => 'Depok',
                    'district'       => 'Cinere',
                    'image_url'      => 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80',
                    'status'         => 'ACTIVE',
                ],
            ];

            foreach ($courts as $courtData) {
                $court = Court::firstOrCreate(
                    [
                        'owner_id' => $owner->user_id,
                        'name'     => $courtData['name'],
                    ],
                    $courtData
                );

                // Operating Hours: 7 days a week (0 = Sunday ... 6 = Saturday), 08:00 - 23:00
                for ($day = 0; $day <= 6; $day++) {
                    CourtOperatingHour::firstOrCreate(
                        [
                            'court_id'    => $court->court_id,
                            'day_of_week' => $day,
                        ],
                        [
                            'open_time'  => '08:00',
                            'close_time' => '23:00',
                            'is_closed'  => false,
                        ]
                    );
                }
            }
        }

        // 7. Seed Tiered Owners, Subscriptions, Customers, and Diverse Courts
        $this->call([
            UserSeeder::class,
            CourtSeeder::class,
        ]);
    }
}
