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

class SubscriptionPlanCourtLimitsTest extends TestCase
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
            'end_date'   => now()->addYear(),
            'status'     => 'ACTIVE',
        ]);

        return $owner;
    }

    private function courtPayload(string $name): array
    {
        return [
            'name'           => $name,
            'sport_type'     => 'Badminton',
            'description'    => 'Lapangan Badminton Standar',
            'price_per_hour' => 50000,
            'address'        => 'Jl. Testing No. 123',
            'city'           => 'Jakarta Selatan',
            'district'       => 'Cilandak',
            'open_time'      => '08:00',
            'close_time'     => '22:00',
            'status'         => 'ACTIVE',
        ];
    }

    public function test_free_owner_can_create_one_court_and_second_is_blocked(): void
    {
        $owner = $this->createOwnerWithPlan($this->freePlan, 'free_test@lapangin.id');
        Sanctum::actingAs($owner);

        // 1st court succeeds
        $res1 = $this->postJson('/api/courts', $this->courtPayload('Lapangan Free 1'));
        $res1->assertStatus(201);

        // 2nd court blocked
        $res2 = $this->postJson('/api/courts', $this->courtPayload('Lapangan Free 2'));
        $res2->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);
        $this->assertStringContainsString('Batas maksimal lapangan', $res2->json('message'));

        // Verify index flags
        $indexRes = $this->getJson('/api/courts');
        $indexRes->assertStatus(200);
        $this->assertCount(1, $indexRes->json('data.data'));
        $this->assertFalse($indexRes->json('data.data.0.is_locked'));
        $this->assertEquals(1, $indexRes->json('max_allowed_courts'));
    }

    public function test_basic_owner_can_create_up_to_five_courts_and_sixth_is_blocked(): void
    {
        $owner = $this->createOwnerWithPlan($this->basicPlan, 'basic_test@lapangin.id');
        Sanctum::actingAs($owner);

        for ($i = 1; $i <= 5; $i++) {
            $res = $this->postJson('/api/courts', $this->courtPayload("Lapangan Basic {$i}"));
            $res->assertStatus(201);
        }

        // 6th court blocked
        $res6 = $this->postJson('/api/courts', $this->courtPayload('Lapangan Basic 6'));
        $res6->assertStatus(403);
        $this->assertStringContainsString('Batas maksimal lapangan untuk paket BASIC (5 lapangan)', $res6->json('message'));

        // Verify index flags
        $indexRes = $this->getJson('/api/courts?per_page=10');
        $indexRes->assertStatus(200);
        $this->assertCount(5, $indexRes->json('data.data'));
        foreach ($indexRes->json('data.data') as $court) {
            $this->assertFalse($court['is_locked']);
        }
        $this->assertEquals(5, $indexRes->json('max_allowed_courts'));
    }

    public function test_pro_owner_can_create_more_than_five_courts_unrestricted(): void
    {
        $owner = $this->createOwnerWithPlan($this->proPlan, 'pro_test@lapangin.id');
        Sanctum::actingAs($owner);

        // Create 7 courts (exceeding 5)
        for ($i = 1; $i <= 7; $i++) {
            $res = $this->postJson('/api/courts', $this->courtPayload("Lapangan Pro {$i}"));
            $res->assertStatus(201);
        }

        // Verify index returns all 7 as unlocked
        $indexRes = $this->getJson('/api/courts?per_page=10');
        $indexRes->assertStatus(200);
        $this->assertCount(7, $indexRes->json('data.data'));
        foreach ($indexRes->json('data.data') as $court) {
            $this->assertFalse($court['is_locked']);
        }
        $this->assertNull($indexRes->json('max_allowed_courts'));
        $this->assertEquals('PRO', $indexRes->json('plan_name'));

        // Verify /api/me returns null max_courts for PRO
        $meRes = $this->getJson('/api/me');
        $meRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user'    => [
                    'role'         => 'OWNER',
                    'subscription' => [
                        'plan_name'  => 'PRO',
                        'max_courts' => null,
                    ],
                ],
            ]);
    }
}
