<?php

namespace Database\Seeders;

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
    }
}
