<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Court;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CourtDeletionAndDeactivationTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private Plan $proPlan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->proPlan = Plan::create([
            'name'                   => 'PRO',
            'description'            => 'Paket Komplit',
            'price'                  => 99000,
            'max_courts'             => null,
            'max_bookings_per_month' => null,
            'is_active'              => true,
        ]);

        $this->owner = User::create([
            'name'          => 'Owner SoftDelete Test',
            'email'         => 'owner_delete_test@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081299887766',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        Subscription::create([
            'user_id'    => $this->owner->user_id,
            'plan_id'    => $this->proPlan->plan_id,
            'start_date' => now(),
            'end_date'   => null,
            'status'     => 'ACTIVE',
        ]);
    }

    private function createCourt(string $name, string $sport = 'Badminton'): Court
    {
        return Court::create([
            'owner_id'       => $this->owner->user_id,
            'name'           => $name,
            'sport_type'     => $sport,
            'description'    => 'Deskripsi lapangan untuk test',
            'price_per_hour' => 60000,
            'address'        => 'Jl. Testing Soft Delete No. 1',
            'city'           => 'Jakarta Selatan',
            'district'       => 'Cilandak',
            'status'         => 'ACTIVE',
        ]);
    }

    public function test_court_can_be_soft_deleted_and_booking_history_remains_intact(): void
    {
        Sanctum::actingAs($this->owner);

        $court = $this->createCourt('Lapangan Utama Badminton');

        $customer = Customer::create([
            'owner_id' => $this->owner->user_id,
            'name'     => 'Pelanggan Booking Test',
            'phone'    => '081987654321',
            'email'    => 'pelanggan@test.com',
        ]);

        $booking = Booking::create([
            'booking_code'   => 'BOOK-TEST-001',
            'court_id'       => $court->court_id,
            'customer_id'    => $customer->customer_id,
            'user_id'        => null,
            'booking_date'   => now()->toDateString(),
            'start_time'     => '10:00:00',
            'end_time'       => '12:00:00',
            'price'          => 120000,
            'payment_method' => 'CASH',
            'status'         => 'CONFIRMED',
        ]);

        // 1. Delete court
        $response = $this->deleteJson("/api/courts/{$court->court_id}");
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        // 2. Database checks: row still exists, deleted_at is filled
        $this->assertDatabaseHas('courts', [
            'court_id' => $court->court_id,
            'status'   => 'INACTIVE',
        ]);

        $deletedCourt = Court::withTrashed()->find($court->court_id);
        $this->assertNotNull($deletedCourt);
        $this->assertNotNull($deletedCourt->deleted_at);

        // 3. Excluded from active queries
        $this->assertNull(Court::find($court->court_id));

        $ownerCourtsRes = $this->getJson('/api/courts');
        $ownerCourtsRes->assertStatus(200);
        $this->assertCount(0, $ownerCourtsRes->json('data.data'));

        $publicCourtsRes = $this->getJson('/api/public/courts');
        $publicCourtsRes->assertStatus(200);
        $this->assertCount(0, $publicCourtsRes->json('data.data'));

        // 4. Booking record STILL references court via withTrashed
        $refreshedBooking = $booking->fresh();
        $this->assertNotNull($refreshedBooking);
        $this->assertNotNull($refreshedBooking->court);
        $this->assertEquals('Lapangan Utama Badminton', $refreshedBooking->court->name);
        $this->assertEquals($court->court_id, $refreshedBooking->court->court_id);

        // 5. CRITICAL REGRESSION FIX: Booking management API returns bookings even when court is soft-deleted
        $ownerBookingsRes = $this->getJson('/api/bookings');
        $ownerBookingsRes->assertStatus(200);
        $this->assertCount(1, $ownerBookingsRes->json('data.data'));
        $this->assertEquals('BOOK-TEST-001', $ownerBookingsRes->json('data.data.0.booking_code'));
        $this->assertNotNull($ownerBookingsRes->json('data.data.0.court'));
        $this->assertEquals('Lapangan Utama Badminton', $ownerBookingsRes->json('data.data.0.court.name'));
        $this->assertNotNull($ownerBookingsRes->json('data.data.0.court.deleted_at'));

        // 6. Booking detail endpoint remains accessible to owner
        $bookingDetailRes = $this->getJson("/api/bookings/{$booking->booking_id}");
        $bookingDetailRes->assertStatus(200);
        $this->assertEquals('Lapangan Utama Badminton', $bookingDetailRes->json('data.court.name'));

        // 7. Dashboard stats remain accurate (historical revenue & bookings preserved)
        $dashboardRes = $this->getJson('/api/dashboard');
        $dashboardRes->assertStatus(200);
        $this->assertEquals(0, $dashboardRes->json('data.total_courts')); // Active courts count is 0
        $this->assertEquals(1, $dashboardRes->json('data.total_bookings')); // Historical bookings preserved
        $this->assertEquals(120000, $dashboardRes->json('data.today_revenue')); // Revenue preserved
    }

    public function test_court_can_be_deleted_with_zero_bookings(): void
    {
        Sanctum::actingAs($this->owner);

        $court = $this->createCourt('Lapangan Kosong');

        $response = $this->deleteJson("/api/courts/{$court->court_id}");
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertNull(Court::find($court->court_id));
        $this->assertNotNull(Court::withTrashed()->find($court->court_id));
    }

    public function test_court_deactivation_preserves_booking_history_and_hides_from_public(): void
    {
        Sanctum::actingAs($this->owner);

        $court = $this->createCourt('Lapangan Siap Deaktif');

        // Deactivate via PUT
        $response = $this->putJson("/api/courts/{$court->court_id}", [
            'status' => 'INACTIVE',
        ]);
        $response->assertStatus(200);

        // Court in DB has status INACTIVE and deleted_at is null
        $this->assertDatabaseHas('courts', [
            'court_id'   => $court->court_id,
            'status'     => 'INACTIVE',
            'deleted_at' => null,
        ]);

        // Still visible in owner list (as INACTIVE)
        $ownerCourtsRes = $this->getJson('/api/courts');
        $ownerCourtsRes->assertStatus(200);
        $this->assertCount(1, $ownerCourtsRes->json('data.data'));
        $this->assertEquals('INACTIVE', $ownerCourtsRes->json('data.data.0.status'));

        // Hidden from public search
        $publicCourtsRes = $this->getJson('/api/public/courts');
        $publicCourtsRes->assertStatus(200);
        $this->assertCount(0, $publicCourtsRes->json('data.data'));
    }

    public function test_owner_courts_can_be_filtered_by_sport_type(): void
    {
        Sanctum::actingAs($this->owner);

        $this->createCourt('Arena Futsal 1', 'Futsal');
        $this->createCourt('Arena Basket 1', 'Basket');
        $this->createCourt('Arena Badminton 1', 'Badminton');

        // Filter Futsal
        $futsalRes = $this->getJson('/api/courts?sport_type=Futsal');
        $futsalRes->assertStatus(200);
        $this->assertCount(1, $futsalRes->json('data.data'));
        $this->assertEquals('Futsal', $futsalRes->json('data.data.0.sport_type'));

        // Filter ALL
        $allRes = $this->getJson('/api/courts?sport_type=ALL');
        $allRes->assertStatus(200);
        $this->assertCount(3, $allRes->json('data.data'));
    }

    public function test_customer_sees_bookings_and_court_info_for_soft_deleted_court(): void
    {
        $court = $this->createCourt('Arena Tennis 1', 'Tennis');

        $customerUser = User::create([
            'name'          => 'Customer Tennis',
            'email'         => 'customer_tennis@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567899',
            'role'          => 'CUSTOMER',
            'status'        => 'ACTIVE',
        ]);

        $customer = Customer::create([
            'owner_id' => $this->owner->user_id,
            'name'     => 'Customer Tennis',
            'phone'    => '081234567899',
            'email'    => 'customer_tennis@lapangin.id',
        ]);

        $booking = Booking::create([
            'booking_code'   => 'BOOK-CUST-002',
            'court_id'       => $court->court_id,
            'customer_id'    => $customer->customer_id,
            'user_id'        => $customerUser->user_id,
            'booking_date'   => now()->toDateString(),
            'start_time'     => '14:00:00',
            'end_time'       => '16:00:00',
            'price'          => 150000,
            'payment_method' => 'QRIS',
            'status'         => 'CONFIRMED',
        ]);

        // Delete court as owner
        Sanctum::actingAs($this->owner);
        $this->deleteJson("/api/courts/{$court->court_id}")->assertStatus(200);

        // Act as customer
        Sanctum::actingAs($customerUser);

        $customerBookingsRes = $this->getJson('/api/bookings');
        $customerBookingsRes->assertStatus(200);
        $this->assertCount(1, $customerBookingsRes->json('data.data'));
        $this->assertEquals('BOOK-CUST-002', $customerBookingsRes->json('data.data.0.booking_code'));
        $this->assertNotNull($customerBookingsRes->json('data.data.0.court'));
        $this->assertEquals('Arena Tennis 1', $customerBookingsRes->json('data.data.0.court.name'));
        $this->assertNotNull($customerBookingsRes->json('data.data.0.court.deleted_at'));

        // Customer can also view single booking detail
        $detailRes = $this->getJson("/api/bookings/{$booking->booking_id}");
        $detailRes->assertStatus(200);
        $this->assertEquals('Arena Tennis 1', $detailRes->json('data.court.name'));
    }
}
