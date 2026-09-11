<?php

namespace Tests\Feature;

use App\Models\Court;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class BookingQrisPaymentTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private User $customer;
    private Court $court;

    protected function setUp(): void
    {
        parent::setUp();

        $plan = Plan::create([
            'name'                   => 'PRO',
            'description'            => 'Paket Pro',
            'price'                  => 100000,
            'max_courts'             => null,
            'max_bookings_per_month' => null,
            'is_active'              => true,
        ]);

        $this->owner = User::create([
            'name'          => 'Owner Venue',
            'email'         => 'owner_venue@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567801',
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

        $this->court = Court::create([
            'owner_id'       => $this->owner->user_id,
            'name'           => 'Lapangan Utama',
            'sport_type'     => 'Futsal',
            'price_per_hour' => 100000,
            'address'        => 'Jl. Utama No. 1',
            'city'           => 'Jakarta',
            'status'         => 'ACTIVE',
        ]);

        for ($day = 0; $day <= 6; $day++) {
            $this->court->operatingHours()->create([
                'day_of_week' => $day,
                'open_time'   => '08:00:00',
                'close_time'  => '22:00:00',
                'is_closed'   => false,
            ]);
        }

        $this->customer = User::create([
            'name'          => 'Penyewa Lapangan',
            'email'         => 'penyewa@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081298765432',
            'role'          => 'CUSTOMER',
            'status'        => 'ACTIVE',
        ]);
    }

    public function test_customer_can_create_booking_with_qris_and_get_qris_qr_url(): void
    {
        Sanctum::actingAs($this->customer);

        // 1. Checkout booking dengan payment_method: QRIS
        $tomorrow = now()->addDay()->format('Y-m-d');
        $bookingResponse = $this->postJson('/api/bookings', [
            'court_id'       => $this->court->court_id,
            'booking_date'   => $tomorrow,
            'start_time'     => '10:00',
            'end_time'       => '11:00',
            'payment_method' => 'QRIS',
        ]);

        $bookingResponse->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $bookingId = $bookingResponse->json('data.booking_id');
        $this->assertNotNull($bookingId);

        // Mock MidtransService agar tidak menembak real network di CI
        $mockMidtrans = Mockery::mock(MidtransService::class);
        $mockMidtrans->shouldReceive('createDynamicQris')
            ->once()
            ->andReturn([
                'order_id'         => 'BKG-TEST-1234',
                'transaction_id'   => 'midtrans-tx-123',
                'gross_amount'     => 100000,
                'status'           => 'PENDING',
                'qr_url'           => 'https://api.sandbox.midtrans.com/v2/qris/test/qr-code',
                'qr_string'        => '00020101021226620014COM.GO-JEK.WWW',
                'expires_at'       => now()->addMinutes(15)->toIso8601String(),
                'payload_response' => [],
            ]);

        $this->app->instance(MidtransService::class, $mockMidtrans);

        // 2. Request QRIS generate endpoint (/api/bookings/{id}/pay)
        $payResponse = $this->postJson("/api/bookings/{$bookingId}/pay");

        $payResponse->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'QRIS Dinamis berhasil dibuat.',
                'data'    => [
                    'order_id'     => 'BKG-TEST-1234',
                    'gross_amount' => 100000,
                    'status'       => 'PENDING',
                    'qr_url'       => 'https://api.sandbox.midtrans.com/v2/qris/test/qr-code',
                ],
            ]);
    }
}
