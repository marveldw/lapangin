<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SportTypesCentralTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();

        $plan = Plan::create([
            'name'                   => 'PRO',
            'description'            => 'Paket Komplit',
            'price'                  => 99000,
            'max_courts'             => null,
            'max_bookings_per_month' => null,
            'is_active'              => true,
        ]);

        $this->owner = User::create([
            'name'          => 'Owner Sport Test',
            'email'         => 'owner_sport@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567833',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        Subscription::create([
            'user_id'    => $this->owner->user_id,
            'plan_id'    => $plan->plan_id,
            'start_date' => now(),
            'end_date'   => now()->addYear(),
            'status'     => 'ACTIVE',
        ]);

        Sanctum::actingAs($this->owner);
    }

    public function test_public_sport_types_returns_complete_central_list(): void
    {
        $response = $this->getJson('/api/public/sport-types');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $data = $response->json('data');

        // Verify minimum required sports
        $requiredSports = [
            'Futsal',
            'Basket',
            'Voli',
            'Badminton',
            'Tenis',
            'Tenis Meja',
            'Sepak Bola',
            'Mini Soccer',
            'Padel',
            'Golf',
            'Panjat Tebing',
        ];

        foreach ($requiredSports as $sport) {
            $this->assertContains($sport, $data, "Sport type {$sport} must be present in public sport types.");
        }
    }

    public function test_can_create_court_with_new_sport_types(): void
    {
        $responseGolf = $this->postJson('/api/courts', [
            'name'           => 'Pondok Indah Driving Range',
            'sport_type'     => 'Golf',
            'price_per_hour' => 150000,
            'address'        => 'Jl. Metro Pondok Indah',
            'city'           => 'Jakarta Selatan',
        ]);

        $responseGolf->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'sport_type' => 'Golf',
                ],
            ]);

        $responseClimb = $this->postJson('/api/courts', [
            'name'           => 'Boulder Wall Kemang',
            'sport_type'     => 'Panjat Tebing',
            'price_per_hour' => 75000,
            'address'        => 'Jl. Kemang Raya',
            'city'           => 'Jakarta Selatan',
        ]);

        $responseClimb->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'sport_type' => 'Panjat Tebing',
                ],
            ]);
    }

    public function test_rejects_unregistered_sport_type(): void
    {
        $response = $this->postJson('/api/courts', [
            'name'           => 'Arena Biliar Pro',
            'sport_type'     => 'Billiard', // Not in config/sports.php
            'price_per_hour' => 50000,
            'address'        => 'Jl. Sudirman',
            'city'           => 'Jakarta Selatan',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['sport_type']);
    }
}
