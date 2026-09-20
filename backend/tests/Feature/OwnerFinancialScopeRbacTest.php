<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Court;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OwnerFinancialScopeRbacTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private User $staff;
    private Court $court;
    private Plan $basicPlan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->basicPlan = Plan::create([
            'name'                   => 'BASIC',
            'description'            => 'Paket Standar',
            'price'                  => 49000,
            'max_courts'             => 5,
            'max_bookings_per_month' => null,
            'is_active'              => true,
        ]);

        $this->owner = User::create([
            'name'          => 'Owner Finansial',
            'email'         => 'owner_fin@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567810',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        Subscription::create([
            'user_id'    => $this->owner->user_id,
            'plan_id'    => $this->basicPlan->plan_id,
            'start_date' => now(),
            'end_date'   => now()->addDays(30),
            'status'     => 'ACTIVE',
        ]);

        $this->staff = User::create([
            'name'          => 'Staf Operasional',
            'email'         => 'staff_op@lapangin.id',
            'password_hash' => Hash::make('staffpass123'),
            'phone'         => '081234567811',
            'role'          => 'STAFF',
            'owner_id'      => $this->owner->user_id,
            'status'        => 'ACTIVE',
        ]);

        $this->court = Court::create([
            'name'           => 'Lapangan Tenis A',
            'sport_type'     => 'Tenis',
            'price_per_hour' => 120000,
            'address'        => 'Jl. Pandanaran No. 10',
            'city'           => 'Semarang',
            'district'       => 'Semarang Selatan',
            'owner_id'       => $this->owner->user_id,
            'status'         => 'ACTIVE',
        ]);

        Wallet::create([
            'owner_id'       => $this->owner->user_id,
            'balance'        => 500000,
            'locked_balance' => 100000,
        ]);
    }

    /**
     * Requirement: staff account attempts to access a financial endpoint -> must return 403.
     */
    public function test_staff_blocked_from_financial_revenue_endpoint(): void
    {
        Sanctum::actingAs($this->staff);

        $response = $this->getJson('/api/owner/revenue');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Requirement: owner account accesses financial endpoint -> must return 200.
     */
    public function test_owner_allowed_access_to_financial_revenue_endpoint(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->getJson('/api/owner/revenue');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'wallet_balance' => 500000,
                    'locked_balance' => 100000,
                ],
            ]);
        $this->assertArrayHasKey('today_revenue', $response->json('data'));
        $this->assertArrayHasKey('monthly_revenue', $response->json('data'));
        $this->assertArrayHasKey('income_per_court', $response->json('data'));
    }

    /**
     * Staff must receive 403 on wallet, withdraw, and payout account endpoints.
     */
    public function test_staff_blocked_from_wallet_and_payout_endpoints(): void
    {
        Sanctum::actingAs($this->staff);

        $this->getJson('/api/owner/wallet')->assertStatus(403);
        $this->postJson('/api/owner/withdraw', ['amount' => 50000])->assertStatus(403);
        $this->putJson('/api/owner/payout-account', [
            'bank_name'             => 'BCA',
            'bank_account_number'   => '1234567890',
            'bank_account_holder'   => 'Owner Name',
            'verification_password' => 'staffpass123',
        ])->assertStatus(403);
    }

    /**
     * Owner receives 200 on wallet endpoint.
     */
    public function test_owner_allowed_access_to_wallet_endpoint(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->getJson('/api/owner/wallet');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'balance'        => 500000,
                    'locked_balance' => 100000,
                ],
            ]);
    }

    /**
     * Staff dashboard endpoint returns operational numbers but strictly omits financial revenue figures.
     */
    public function test_staff_dashboard_omits_financial_figures(): void
    {
        Sanctum::actingAs($this->staff);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'total_courts'     => 1,
                    'total_bookings'   => 0,
                    'today_bookings'   => 0,
                    'pending_bookings' => 0,
                ],
            ]);

        // Financial figures must NOT be exposed to staff in dashboard response
        $data = $response->json('data');
        $this->assertArrayNotHasKey('today_revenue', $data);
        $this->assertArrayNotHasKey('monthly_revenue', $data);
        $this->assertArrayNotHasKey('wallet_balance', $data);
        $this->assertArrayNotHasKey('locked_balance', $data);
    }

    /**
     * Owner dashboard endpoint contains both operational and financial overview.
     */
    public function test_owner_dashboard_includes_financial_overview(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'total_courts'     => 1,
                    'wallet_balance'   => 500000,
                    'locked_balance'   => 100000,
                ],
            ]);

        $data = $response->json('data');
        $this->assertArrayHasKey('today_revenue', $data);
        $this->assertArrayHasKey('monthly_revenue', $data);
    }

    /**
     * Staff is forbidden from creating courts (structural business decision - only OWNER can create courts).
     */
    public function test_staff_forbidden_from_creating_courts(): void
    {
        Sanctum::actingAs($this->staff);

        $response = $this->postJson('/api/courts', [
            'name'           => 'Lapangan Ilegal Staf',
            'sport_type'     => 'Futsal',
            'price_per_hour' => 100000,
            'address'        => 'Jl. Percobaan',
            'city'           => 'Semarang',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);

        // Also check alias route /api/owner/courts
        $aliasResponse = $this->postJson('/api/owner/courts', [
            'name'           => 'Lapangan Ilegal Staf 2',
            'sport_type'     => 'Futsal',
            'price_per_hour' => 100000,
            'address'        => 'Jl. Percobaan',
            'city'           => 'Semarang',
        ]);

        $aliasResponse->assertStatus(403);
    }

    /**
     * Owner can create courts.
     */
    public function test_owner_can_create_courts(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->postJson('/api/courts', [
            'name'           => 'Lapangan Basket Baru',
            'sport_type'     => 'Basket',
            'price_per_hour' => 150000,
            'address'        => 'Jl. Pemuda No. 1',
            'city'           => 'Semarang',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);
    }
}
