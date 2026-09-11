<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Number of users to seed per category.
     */
    public const FREE_OWNERS_COUNT = 6;
    public const BASIC_OWNERS_COUNT = 6;
    public const PRO_OWNERS_COUNT = 6;
    public const CUSTOMERS_COUNT = 10;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure Spatie Roles exist
        $ownerRole = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
        $customerRole = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

        // 2. Fetch Plans
        $plans = Plan::all()->keyBy('name');
        $freePlan = $plans->get('FREE');
        $basicPlan = $plans->get('BASIC');
        $proPlan = $plans->get('PRO');

        // 3. Seed Free Tier Owners
        $this->seedOwnersWithPlan($freePlan, self::FREE_OWNERS_COUNT, 'free', $ownerRole);

        // 4. Seed Basic Tier Owners (mix of active & expired)
        $this->seedOwnersWithPlan($basicPlan, self::BASIC_OWNERS_COUNT, 'basic', $ownerRole);

        // 5. Seed Pro Tier Owners (mix of active & expired)
        $this->seedOwnersWithPlan($proPlan, self::PRO_OWNERS_COUNT, 'pro', $ownerRole);

        // 6. Seed Renter / Tenant Users (Role: CUSTOMER)
        $this->seedCustomers(self::CUSTOMERS_COUNT, $customerRole);
    }

    /**
     * Seed owner users and assign them a subscription plan with mixed statuses.
     */
    private function seedOwnersWithPlan(?Plan $plan, int $count, string $prefix, Role $role): void
    {
        if (!$plan) {
            return;
        }

        for ($i = 1; $i <= $count; $i++) {
            $email = "owner.{$prefix}{$i}@lapangin.id";
            $createdAt = now()->subMonths(rand(1, 6))->subDays(rand(1, 28));

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => fake('id_ID')->name() . " ({$plan->name})",
                    'password_hash' => Hash::make('password123'),
                    'phone' => '08' . fake()->numerify('##########'),
                    'role' => 'OWNER',
                    'status' => 'ACTIVE',
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]
            );

            if (!$user->hasRole('owner')) {
                $user->assignRole($role);
            }

            // Ensure Owner has a Wallet
            Wallet::firstOrCreate(
                ['owner_id' => $user->user_id],
                [
                    'balance' => rand(2, 20) * 100000,
                    'locked_balance' => rand(0, 5) * 50000,
                ]
            );

            // Seed Subscription: ~80% Active, ~20% Expired to test subscription gating
            $isExpired = ($i % 5 === 0 && $plan->name !== 'FREE');
            $startDate = $isExpired ? $createdAt : now()->subDays(rand(5, 30));
            $endDate = $isExpired ? now()->subDays(rand(1, 15)) : now()->addMonths(rand(1, 11));
            $subStatus = $isExpired ? 'EXPIRED' : 'ACTIVE';

            Subscription::firstOrCreate(
                [
                    'user_id' => $user->user_id,
                    'plan_id' => $plan->plan_id,
                ],
                [
                    'status' => $subStatus,
                    'start_date' => $startDate,
                    'end_date' => ($plan->name === 'FREE' ? null : $endDate),
                ]
            );
        }
    }

    /**
     * Seed customer renter users who book courts.
     */
    private function seedCustomers(int $count, Role $role): void
    {
        for ($i = 1; $i <= $count; $i++) {
            $email = "customer{$i}@lapangin.id";
            $createdAt = now()->subMonths(rand(1, 5))->subDays(rand(1, 25));

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => fake('id_ID')->name(),
                    'password_hash' => Hash::make('password123'),
                    'phone' => '08' . fake()->numerify('##########'),
                    'role' => 'CUSTOMER',
                    'status' => 'ACTIVE',
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]
            );

            if (!$user->hasRole('customer')) {
                $user->assignRole($role);
            }
        }
    }
}
