<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Court;
use App\Models\Customer;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OwnerStaffRbacTest extends TestCase
{
    use RefreshDatabase;

    private User $owner1;
    private User $owner2;
    private User $staff1;
    private Court $court1;
    private Court $court2;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Owner 1 & Court 1
        $this->owner1 = User::create([
            'name'          => 'Owner Venue A',
            'email'         => 'owner_a@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567890',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        $this->court1 = Court::create([
            'name'           => 'Lapangan Futsal A1',
            'sport_type'     => 'Futsal',
            'price_per_hour' => 100000,
            'address'        => 'Jl. Venue A No. 1',
            'city'           => 'Semarang',
            'district'       => 'Semarang Barat',
            'owner_id'       => $this->owner1->user_id,
            'status'         => 'ACTIVE',
        ]);

        // 2. Staff of Owner 1
        $this->staff1 = User::create([
            'name'          => 'Staff Admin A',
            'email'         => 'staff_a@lapangin.id',
            'password_hash' => Hash::make('staff12345'),
            'phone'         => '081234567891',
            'role'          => 'STAFF',
            'owner_id'      => $this->owner1->user_id,
            'status'        => 'ACTIVE',
        ]);

        // 3. Owner 2 & Court 2
        $this->owner2 = User::create([
            'name'          => 'Owner Venue B',
            'email'         => 'owner_b@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567892',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        $this->court2 = Court::create([
            'name'           => 'Lapangan Badminton B1',
            'sport_type'     => 'Badminton',
            'price_per_hour' => 80000,
            'address'        => 'Jl. Venue B No. 2',
            'city'           => 'Semarang',
            'district'       => 'Semarang Timur',
            'owner_id'       => $this->owner2->user_id,
            'status'         => 'ACTIVE',
        ]);
    }

    public function test_owner_can_create_staff_sub_account(): void
    {
        Sanctum::actingAs($this->owner1);

        $response = $this->postJson('/api/owner/staff', [
            'name'     => 'Kasir Baru A',
            'email'    => 'kasir_a@lapangin.id',
            'password' => 'password123',
            'phone'    => '081234567899',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'name'  => 'Kasir Baru A',
                    'email' => 'kasir_a@lapangin.id',
                    'role'  => 'STAFF',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email'    => 'kasir_a@lapangin.id',
            'role'     => 'STAFF',
            'owner_id' => $this->owner1->user_id,
        ]);
    }

    public function test_staff_of_owner1_can_view_owner1_courts(): void
    {
        Sanctum::actingAs($this->staff1);

        $response = $this->getJson('/api/courts');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Lapangan Futsal A1', $data[0]['name']);
    }

    public function test_staff_of_owner1_cannot_access_owner2_court(): void
    {
        Sanctum::actingAs($this->staff1);

        // Attempt to access Court 2 belonging to Owner 2
        $response = $this->getJson("/api/courts/{$this->court2->court_id}");

        $response->assertStatus(404);
    }

    public function test_staff_of_owner1_cannot_access_owner2_bookings(): void
    {
        // Create booking for Owner 2's court
        $customer = User::create([
            'name'          => 'Customer X',
            'email'         => 'cust_x@gmail.com',
            'password_hash' => Hash::make('secret'),
            'role'          => 'CUSTOMER',
            'status'        => 'ACTIVE',
        ]);

        $customerRecord = Customer::create([
            'name'     => 'Customer X',
            'phone'    => '081299998888',
            'email'    => 'cust_x@gmail.com',
            'owner_id' => $this->owner2->user_id,
        ]);

        $booking2 = Booking::create([
            'booking_code' => 'BOOK-OWNER2-001',
            'user_id'      => $customer->user_id,
            'customer_id'  => $customerRecord->customer_id,
            'court_id'     => $this->court2->court_id,
            'booking_date' => now()->addDay()->toDateString(),
            'start_time'   => '10:00',
            'end_time'     => '11:00',
            'total_hours'  => 1,
            'price'        => 80000,
            'status'       => 'PENDING',
        ]);

        Sanctum::actingAs($this->staff1);

        // Staff of Owner 1 attempts to view Owner 2's booking
        $response = $this->getJson("/api/bookings/{$booking2->booking_id}");

        $response->assertStatus(403);
    }

    public function test_staff_is_forbidden_from_deleting_courts(): void
    {
        Sanctum::actingAs($this->staff1);

        $response = $this->deleteJson("/api/courts/{$this->court1->court_id}");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);

        $this->assertNotSoftDeleted('courts', ['court_id' => $this->court1->court_id]);
    }

    public function test_staff_is_forbidden_from_changing_payout_bank_account(): void
    {
        Sanctum::actingAs($this->staff1);

        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'staff12345',
            'bank_name'        => 'BCA',
            'account_number'   => '8830192831',
            'account_holder'   => 'Hacker Staff',
        ]);

        // Must be blocked by role middleware (role:OWNER,ADMIN)
        $response->assertStatus(403);
    }

    public function test_staff_is_forbidden_from_viewing_wallet_and_requesting_withdraw(): void
    {
        Sanctum::actingAs($this->staff1);

        $responseWallet = $this->getJson('/api/owner/wallet');
        $responseWallet->assertStatus(403);

        $responseWithdraw = $this->postJson('/api/owner/withdraw', [
            'amount' => 50000,
        ]);
        $responseWithdraw->assertStatus(403);
    }

    public function test_staff_is_forbidden_from_managing_staff_accounts(): void
    {
        Sanctum::actingAs($this->staff1);

        // Attempt to create another staff
        $response = $this->postJson('/api/owner/staff', [
            'name'     => 'Sub Staff',
            'email'    => 'sub@lapangin.id',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
    }

    public function test_owner1_cannot_view_or_modify_owner2_staff(): void
    {
        $staff2 = User::create([
            'name'          => 'Staff B',
            'email'         => 'staff_b@lapangin.id',
            'password_hash' => Hash::make('secret'),
            'role'          => 'STAFF',
            'owner_id'      => $this->owner2->user_id,
            'status'        => 'ACTIVE',
        ]);

        Sanctum::actingAs($this->owner1);

        // Owner 1 attempts to deactivate Owner 2's staff
        $response = $this->deleteJson("/api/owner/staff/{$staff2->user_id}");

        $response->assertStatus(404);
        $this->assertEquals('ACTIVE', $staff2->fresh()->status);
    }
}
