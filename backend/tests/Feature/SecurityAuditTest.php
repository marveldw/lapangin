<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_access_owner_court_endpoints(): void
    {
        $customer = User::create([
            'name'          => 'Customer Test',
            'email'         => 'cust@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567890',
            'role'          => 'CUSTOMER',
            'status'        => 'ACTIVE',
        ]);

        Sanctum::actingAs($customer);

        // Attempt to create court as customer
        $response = $this->postJson('/api/courts', [
            'name'           => 'Illegal Court',
            'sport_type'     => 'Futsal',
            'price_per_hour' => 100000,
            'address'        => 'Jl. Test No. 1',
            'city'           => 'Bandung',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);

        // Attempt to access dashboard as customer
        $dashboardResponse = $this->getJson('/api/dashboard');
        $dashboardResponse->assertStatus(403);
    }

    public function test_owner_can_access_owner_endpoints(): void
    {
        $owner = User::create([
            'name'          => 'Owner Test',
            'email'         => 'owner_test@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567891',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        Sanctum::actingAs($owner);

        $response = $this->getJson('/api/courts');
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $dashboardResponse = $this->getJson('/api/dashboard');
        $dashboardResponse->assertStatus(200);
    }

    public function test_public_routes_are_accessible(): void
    {
        $response = $this->getJson('/api/public/courts');
        $response->assertStatus(200);

        $plansResponse = $this->getJson('/api/plans');
        $plansResponse->assertStatus(200);
    }
}
