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

class CourtOperatingHoursTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $plan = Plan::create([
            'name'                   => 'PRO',
            'description'            => 'Paket Unlimited',
            'price'                  => 200000,
            'max_courts'             => null,
            'max_bookings_per_month' => null,
            'is_active'              => true,
        ]);

        $this->owner = User::create([
            'name'          => 'Owner Test Hours',
            'email'         => 'owner_hours@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567811',
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

        $this->customer = User::create([
            'name'          => 'Customer Test Hours',
            'email'         => 'customer_hours@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567822',
            'role'          => 'CUSTOMER',
            'status'        => 'ACTIVE',
        ]);
    }

    public function test_can_create_court_with_custom_operating_hours(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->postJson('/api/courts', [
            'name'           => 'Lapangan Pagi Ceria',
            'sport_type'     => 'Badminton',
            'price_per_hour' => 75000,
            'address'        => 'Jl. Ceria No. 10',
            'city'           => 'Bandung',
            'open_time'      => '06:00',
            'close_time'     => '19:00',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $courtId = $response->json('data.court_id');
        $this->assertNotNull($courtId);

        // Verify court_operating_hours in database
        $this->assertDatabaseHas('court_operating_hours', [
            'court_id'   => $courtId,
            'day_of_week'=> 0,
            'open_time'  => '06:00:00',
            'close_time' => '19:00:00',
        ]);

        // Verify detail endpoint
        $detailResponse = $this->getJson("/api/public/courts/{$courtId}");
        $detailResponse->assertStatus(200);
        $hours = $detailResponse->json('data.operating_hours');
        $this->assertNotEmpty($hours);
        $this->assertEquals('06:00:00', $hours[0]['open_time']);
        $this->assertEquals('19:00:00', $hours[0]['close_time']);

        // Verify slots endpoint
        $tomorrow = now()->addDay()->format('Y-m-d');
        $slotsResponse = $this->getJson("/api/public/courts/{$courtId}/slots?date={$tomorrow}");
        $slotsResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'operating_hours' => [
                        'open_time'  => '06:00',
                        'close_time' => '19:00',
                    ],
                ],
            ]);
    }

    public function test_booking_outside_custom_hours_is_rejected(): void
    {
        Sanctum::actingAs($this->owner);

        $court = Court::create([
            'owner_id'       => $this->owner->user_id,
            'name'           => 'Lapangan Khusus Sore',
            'sport_type'     => 'Futsal',
            'price_per_hour' => 100000,
            'address'        => 'Jl. Sore No. 1',
            'city'           => 'Jakarta',
            'status'         => 'ACTIVE',
        ]);

        // Operating hours: 14:00 - 20:00
        for ($day = 0; $day <= 6; $day++) {
            $court->operatingHours()->create([
                'day_of_week' => $day,
                'open_time'   => '14:00:00',
                'close_time'  => '20:00:00',
                'is_closed'   => false,
            ]);
        }

        Sanctum::actingAs($this->customer);
        $tomorrow = now()->addDay()->format('Y-m-d');

        // 1. Attempt booking before open_time (e.g. 10:00 - 11:00)
        $earlyResponse = $this->postJson('/api/bookings', [
            'court_id'     => $court->court_id,
            'booking_date' => $tomorrow,
            'start_time'   => '10:00',
            'end_time'     => '11:00',
        ]);

        $earlyResponse->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Booking harus berada dalam jam operasional (14:00 - 20:00).',
            ]);

        // 2. Attempt booking after close_time (e.g. 21:00 - 22:00)
        $lateResponse = $this->postJson('/api/bookings', [
            'court_id'     => $court->court_id,
            'booking_date' => $tomorrow,
            'start_time'   => '21:00',
            'end_time'     => '22:00',
        ]);

        $lateResponse->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Booking harus berada dalam jam operasional (14:00 - 20:00).',
            ]);

        // 3. Valid booking within hours (e.g. 15:00 - 16:00) -> must succeed!
        $validResponse = $this->postJson('/api/bookings', [
            'court_id'     => $court->court_id,
            'booking_date' => $tomorrow,
            'start_time'   => '15:00',
            'end_time'     => '16:00',
        ]);

        $validResponse->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Reservasi berhasil dibuat.',
            ]);
    }

    public function test_can_update_court_operating_hours(): void
    {
        Sanctum::actingAs($this->owner);

        $court = Court::create([
            'owner_id'       => $this->owner->user_id,
            'name'           => 'Lapangan Fleksibel',
            'sport_type'     => 'Voli',
            'price_per_hour' => 80000,
            'address'        => 'Jl. Fleksibel No. 2',
            'city'           => 'Surabaya',
            'status'         => 'ACTIVE',
        ]);

        for ($day = 0; $day <= 6; $day++) {
            $court->operatingHours()->create([
                'day_of_week' => $day,
                'open_time'   => '08:00:00',
                'close_time'  => '22:00:00',
                'is_closed'   => false,
            ]);
        }

        // Update hours to 07:00 - 23:00
        $updateResponse = $this->putJson("/api/courts/{$court->court_id}", [
            'open_time'  => '07:00',
            'close_time' => '23:00',
        ]);

        $updateResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('court_operating_hours', [
            'court_id'   => $court->court_id,
            'day_of_week'=> 0,
            'open_time'  => '07:00:00',
            'close_time' => '23:00:00',
        ]);
    }
}
