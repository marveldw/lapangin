<?php

namespace Tests\Feature;

use App\Models\Court;
use App\Models\CourtOperatingHour;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IndonesianRegionsAndMidnightTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_cities_contains_all_cities_including_kabupaten_semarang(): void
    {
        $response = $this->getJson('/api/public/cities');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $cities = $response->json('data');
        $this->assertContains('Kabupaten Semarang', $cities);
        $this->assertContains('Kota Semarang', $cities);
        $this->assertContains('Jakarta Selatan', $cities);
        $this->assertContains('Kota Bandung', $cities);
        $this->assertContains('Kota Surabaya', $cities);
    }

    public function test_kabupaten_semarang_returns_strictly_its_own_districts(): void
    {
        $response = $this->getJson('/api/public/cities/' . urlencode('Kabupaten Semarang') . '/districts');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $districts = $response->json('data');
        $this->assertCount(19, $districts);
        $this->assertContains('Ambarawa', $districts);
        $this->assertContains('Ungaran Barat', $districts);
        $this->assertContains('Ungaran Timur', $districts);
        $this->assertContains('Bandungan', $districts);
        $this->assertContains('Bawen', $districts);
        $this->assertContains('Getasan', $districts);

        // Ensure Kota Semarang districts are NOT in Kabupaten Semarang
        $this->assertNotContains('Banyumanik', $districts);
        $this->assertNotContains('Candisari', $districts);
        $this->assertNotContains('Gajahmungkur', $districts);
    }

    public function test_kota_semarang_returns_strictly_its_own_districts(): void
    {
        $response = $this->getJson('/api/public/cities/' . urlencode('Kota Semarang') . '/districts');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $districts = $response->json('data');
        $this->assertCount(16, $districts);
        $this->assertContains('Banyumanik', $districts);
        $this->assertContains('Candisari', $districts);
        $this->assertContains('Ngaliyan', $districts);
        $this->assertContains('Tembalang', $districts);

        // Ensure Kabupaten Semarang districts are NOT in Kota Semarang
        $this->assertNotContains('Ungaran Barat', $districts);
        $this->assertNotContains('Ambarawa', $districts);
    }

    public function test_court_closing_at_midnight_accepts_booking_up_to_midnight(): void
    {
        $owner = User::create([
            'name'          => 'Owner Midnight',
            'email'         => 'owner_mid@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567899',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        $customer = User::create([
            'name'          => 'Customer Midnight',
            'email'         => 'cust_mid@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567898',
            'role'          => 'CUSTOMER',
            'status'        => 'ACTIVE',
        ]);

        $court = Court::create([
            'owner_id'       => $owner->user_id,
            'name'           => 'Midnight Arena',
            'sport_type'     => 'Futsal',
            'description'    => 'Jam Operasional: 08:00 - 00:00',
            'price_per_hour' => 100000,
            'address'        => 'Jl. Ungaran Raya No. 1',
            'city'           => 'Kabupaten Semarang',
            'district'       => 'Ungaran Barat',
            'status'         => 'ACTIVE',
        ]);

        // Operating hours: 08:00 to 00:00 (midnight close)
        for ($day = 0; $day <= 6; $day++) {
            CourtOperatingHour::create([
                'court_id'    => $court->court_id,
                'day_of_week' => $day,
                'open_time'   => '08:00',
                'close_time'  => '00:00',
                'is_closed'   => false,
            ]);
        }

        Sanctum::actingAs($customer);

        // Book the last slot before midnight: 23:00 to 00:00 (which normalizes to 23:59)
        $bookingDate = now()->addDay()->format('Y-m-d');
        $response = $this->postJson('/api/bookings', [
            'court_id'       => $court->court_id,
            'booking_date'   => $bookingDate,
            'start_time'     => '23:00',
            'end_time'       => '00:00',
            'payment_method' => 'ON_SITE',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $bookingData = $response->json('data');
        $this->assertEquals(100000, $bookingData['price']);
        $this->assertEquals('23:00', substr($bookingData['start_time'], 0, 5));
        $this->assertEquals('23:59', substr($bookingData['end_time'], 0, 5));

        // Conflict check: second booking on same slot should be rejected
        $conflictResponse = $this->postJson('/api/bookings', [
            'court_id'       => $court->court_id,
            'booking_date'   => $bookingDate,
            'start_time'     => '23:00',
            'end_time'       => '23:59',
            'payment_method' => 'ON_SITE',
        ]);

        $conflictResponse->assertStatus(409);
    }
}
