<?php

namespace Tests\Feature;

use App\Models\Court;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffSubscriptionInheritanceTest extends TestCase
{
    use RefreshDatabase;

    private Plan $freePlan;
    private Plan $basicPlan;
    private Plan $proPlan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->freePlan = Plan::create([
            'name'                   => 'FREE',
            'description'            => 'Paket Percobaan',
            'price'                  => 0,
            'max_courts'             => 1,
            'max_bookings_per_month' => 30,
            'is_active'              => true,
        ]);

        $this->basicPlan = Plan::create([
            'name'                   => 'BASIC',
            'description'            => 'Paket Standar',
            'price'                  => 49000,
            'max_courts'             => 5,
            'max_bookings_per_month' => null,
            'is_active'              => true,
        ]);

        $this->proPlan = Plan::create([
            'name'                   => 'PRO',
            'description'            => 'Paket Komplit',
            'price'                  => 99000,
            'max_courts'             => null, // Unlimited
            'max_bookings_per_month' => null,
            'is_active'              => true,
        ]);
    }

    private function createOwnerWithPlan(Plan $plan, string $email): User
    {
        $owner = User::create([
            'name'          => "Owner {$plan->name}",
            'email'         => $email,
            'password_hash' => Hash::make('password123'),
            'phone'         => '08' . rand(1000000000, 9999999999),
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        Subscription::create([
            'user_id'    => $owner->user_id,
            'plan_id'    => $plan->plan_id,
            'start_date' => now(),
            'end_date'   => now()->addDays(30),
            'status'     => 'ACTIVE',
        ]);

        return $owner;
    }

    /**
     * Requirement: create a staff account under a Pro owner -> confirm staff sees Pro-level access.
     */
    public function test_staff_created_under_pro_owner_sees_pro_level_access(): void
    {
        $owner = $this->createOwnerWithPlan($this->proPlan, 'owner_pro@lapangin.id');

        // Owner creates staff
        Sanctum::actingAs($owner);
        $createRes = $this->postJson('/api/owner/staff', [
            'name'     => 'Staf Pro Venue',
            'email'    => 'staff_pro@lapangin.id',
            'password' => 'password123',
            'phone'    => '081234567801',
        ]);
        $createRes->assertStatus(201);
        $staffId = $createRes->json('data.user_id');
        $staff = User::find($staffId);

        // Confirm staff record itself has no subscription records in DB (no duplicated plan)
        $this->assertEquals(0, Subscription::where('user_id', $staffId)->count());

        // Acting as staff, verify /api/me returns inherited PRO subscription
        Sanctum::actingAs($staff);
        $meRes = $this->getJson('/api/me');
        $meRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user'    => [
                    'user_id'      => $staffId,
                    'role'         => 'STAFF',
                    'subscription' => [
                        'plan_id'      => $this->proPlan->plan_id,
                        'plan_name'    => 'PRO',
                        'max_courts'   => null,
                        'status'       => 'ACTIVE',
                        'is_inherited' => true,
                    ],
                ],
            ]);

        // Verify model accessors on staff user resolve owner's PRO plan dynamically
        $this->assertEquals('PRO', $staff->active_plan?->name);
        $this->assertNull($staff->getMaxCourtsAllowed()); // Unlimited courts for PRO

        // Verify /api/courts endpoint returns PRO plan name and null court limit
        $courtsRes = $this->getJson('/api/courts');
        $courtsRes->assertStatus(200)
            ->assertJson([
                'success'            => true,
                'plan_name'          => 'PRO',
                'max_allowed_courts' => null,
            ]);
    }

    /**
     * Requirement: Upgrade owner from Basic to Pro -> confirm staff access upgrades too without any manual change.
     */
    public function test_staff_access_upgrades_dynamically_when_owner_plan_changes(): void
    {
        $owner = $this->createOwnerWithPlan($this->basicPlan, 'owner_basic@lapangin.id');

        // Create staff under Basic owner
        $staff = User::create([
            'name'          => 'Staf Dinamis',
            'email'         => 'staf_dinamis@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567802',
            'role'          => 'STAFF',
            'owner_id'      => $owner->user_id,
            'status'        => 'ACTIVE',
        ]);

        // Initially, staff sees BASIC
        Sanctum::actingAs($staff);
        $meRes = $this->getJson('/api/me');
        $meRes->assertStatus(200)
            ->assertJson([
                'user' => [
                    'subscription' => [
                        'plan_name'  => 'BASIC',
                        'max_courts' => 5,
                    ],
                ],
            ]);
        $this->assertEquals('BASIC', $staff->fresh()->active_plan?->name);
        $this->assertEquals(5, $staff->fresh()->getMaxCourtsAllowed());

        // OWNER UPGRADES TO PRO (New active subscription created for owner)
        // Mark old subscription expired or create new active subscription with higher ID
        Subscription::where('user_id', $owner->user_id)->update(['status' => 'EXPIRED']);
        Subscription::create([
            'user_id'    => $owner->user_id,
            'plan_id'    => $this->proPlan->plan_id,
            'start_date' => now(),
            'end_date'   => now()->addDays(30),
            'status'     => 'ACTIVE',
        ]);

        // Confirm staff record was NOT modified in the database
        $this->assertEquals(0, Subscription::where('user_id', $staff->user_id)->count());

        // Staff access immediately upgrades to PRO at runtime without any manual update!
        $meResUpdated = $this->getJson('/api/me');
        $meResUpdated->assertStatus(200)
            ->assertJson([
                'user' => [
                    'subscription' => [
                        'plan_name'  => 'PRO',
                        'max_courts' => null,
                    ],
                ],
            ]);

        $this->assertEquals('PRO', $staff->fresh()->active_plan?->name);
        $this->assertNull($staff->fresh()->getMaxCourtsAllowed());
    }

    /**
     * Requirement: A staff account must NEVER have its own independent subscription or billing.
     */
    public function test_staff_cannot_have_independent_subscription_or_billing(): void
    {
        $owner = $this->createOwnerWithPlan($this->basicPlan, 'owner_sub_block@lapangin.id');

        $staff = User::create([
            'name'          => 'Staf Billing Blocked',
            'email'         => 'staff_blocked@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567803',
            'role'          => 'STAFF',
            'owner_id'      => $owner->user_id,
            'status'        => 'ACTIVE',
        ]);

        Sanctum::actingAs($staff);

        // Staff attempts to pay/subscribe to a plan
        $response = $this->postJson("/api/subscriptions/{$this->proPlan->plan_id}/pay");

        // Must be rejected with 403 Forbidden
        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Hanya pemilik venue (owner) yang dapat berlangganan paket.',
            ]);

        // Ensure no subscription was created for staff
        $this->assertEquals(0, Subscription::where('user_id', $staff->user_id)->count());
    }
}
