<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Court;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SoftDeletesComprehensiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_soft_delete_preserves_records_and_revokes_tokens(): void
    {
        $user = User::create([
            'name'          => 'Staff Test',
            'email'         => 'staff@lapangin.test',
            'password_hash' => Hash::make('Password123!'),
            'phone'         => '081299990001',
            'role'          => 'STAFF',
            'status'        => 'ACTIVE',
        ]);

        // Create token
        $token = $user->createToken('test-token');
        $this->assertCount(1, $user->tokens);

        // Soft delete user
        $user->delete();

        // 1. Excluded from normal queries
        $this->assertNull(User::find($user->user_id));

        // 2. Visible with withTrashed
        $deletedUser = User::withTrashed()->find($user->user_id);
        $this->assertNotNull($deletedUser);
        $this->assertNotNull($deletedUser->deleted_at);

        // 3. Tokens are revoked automatically
        $this->assertCount(0, $deletedUser->tokens);
    }

    public function test_soft_deleted_user_allows_new_registration_with_same_email_and_phone(): void
    {
        $oldUser = User::create([
            'name'          => 'Old Customer',
            'email'         => 'reuse@lapangin.test',
            'password_hash' => Hash::make('Password123!'),
            'phone'         => '081299990002',
            'role'          => 'CUSTOMER',
            'status'        => 'ACTIVE',
        ]);

        $oldUser->delete();

        // Register new customer using the same email and phone
        $response = $this->postJson('/api/register', [
            'name'                  => 'New Customer',
            'email'                 => 'reuse@lapangin.test',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
            'phone'                 => '081299990002',
            'role'                  => 'CUSTOMER',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email'      => 'reuse@lapangin.test',
            'name'       => 'New Customer',
            'deleted_at' => null,
        ]);
    }

    public function test_plan_soft_delete_preserves_active_subscription_reference(): void
    {
        $owner = User::create([
            'name'          => 'Owner Plan Test',
            'email'         => 'ownerplan@lapangin.test',
            'password_hash' => Hash::make('Password123!'),
            'phone'         => '081299990003',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        $plan = Plan::create([
            'name'        => 'PROMO_2026',
            'price'       => 150000,
            'max_courts'  => 3,
            'is_active'   => true,
        ]);

        $subscription = Subscription::create([
            'user_id'    => $owner->user_id,
            'plan_id'    => $plan->plan_id,
            'start_date' => now()->toDateString(),
            'end_date'   => now()->addMonth()->toDateString(),
            'status'     => 'ACTIVE',
        ]);

        // Soft delete the plan
        $plan->delete();

        // Normal query excludes it
        $this->assertNull(Plan::find($plan->plan_id));

        // Subscription still loads the plan via withTrashed
        $refreshedSub = $subscription->fresh();
        $this->assertNotNull($refreshedSub->plan);
        $this->assertEquals('PROMO_2026', $refreshedSub->plan->name);
    }

    public function test_customer_soft_delete_preserves_booking_history(): void
    {
        $owner = User::create([
            'name'          => 'Owner Customer Test',
            'email'         => 'ownercust@lapangin.test',
            'password_hash' => Hash::make('Password123!'),
            'phone'         => '081299990004',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        $court = Court::create([
            'owner_id'       => $owner->user_id,
            'name'           => 'Lap A',
            'sport_type'     => 'Badminton',
            'price_per_hour' => 50000,
            'address'        => 'Jl. Olahraga No. 1',
            'city'           => 'Jakarta Selatan',
            'district'       => 'Cilandak',
            'location'       => 'Jakarta',
            'status'         => 'ACTIVE',
        ]);

        $customer = Customer::create([
            'owner_id' => $owner->user_id,
            'name'     => 'John Customer',
            'phone'    => '081299990005',
            'email'    => 'john@example.com',
        ]);

        $booking = Booking::create([
            'booking_code' => 'BKG-SOFT-TEST-001',
            'court_id'     => $court->court_id,
            'customer_id'  => $customer->customer_id,
            'user_id'      => $owner->user_id,
            'booking_date' => now()->toDateString(),
            'start_time'   => '10:00:00',
            'end_time'     => '12:00:00',
            'price'        => 100000,
            'status'       => 'CONFIRMED',
        ]);

        // Soft delete the customer
        $customer->delete();

        // Customer excluded from active queries
        $this->assertNull(Customer::find($customer->customer_id));

        // Booking still loads customer via withTrashed
        $refreshedBooking = $booking->fresh();
        $this->assertNotNull($refreshedBooking->customer);
        $this->assertEquals('John Customer', $refreshedBooking->customer->name);
        $this->assertEquals('081299990005', $refreshedBooking->customer->phone);
    }

    public function test_booking_soft_delete_preserves_transaction_audit(): void
    {
        $owner = User::create([
            'name'          => 'Owner Booking Test',
            'email'         => 'ownerbooking@lapangin.test',
            'password_hash' => Hash::make('Password123!'),
            'phone'         => '081299990006',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        $court = Court::create([
            'owner_id'       => $owner->user_id,
            'name'           => 'Lap B',
            'sport_type'     => 'Futsal',
            'price_per_hour' => 100000,
            'address'        => 'Jl. Asia Afrika No. 2',
            'city'           => 'Bandung',
            'district'       => 'Coblong',
            'location'       => 'Bandung',
            'status'         => 'ACTIVE',
        ]);
        $customer = Customer::create([
            'owner_id' => $owner->user_id,
            'name'     => 'Jane Customer',
            'phone'    => '081299990007',
        ]);

        $booking = Booking::create([
            'booking_code' => 'BKG-SOFT-TEST-002',
            'court_id'     => $court->court_id,
            'customer_id'  => $customer->customer_id,
            'user_id'      => $owner->user_id,
            'booking_date' => now()->toDateString(),
            'start_time'   => '14:00:00',
            'end_time'     => '16:00:00',
            'price'        => 200000,
            'status'       => 'CONFIRMED',
        ]);

        $transaction = Transaction::create([
            'order_id'     => 'TX-TEST-001',
            'user_id'      => $owner->user_id,
            'type'         => 'BOOKING',
            'reference_id' => $booking->booking_id,
            'gross_amount' => 200000,
            'status'       => 'SETTLEMENT',
        ]);

        // Soft delete booking
        $booking->delete();

        // Normal query excludes it
        $this->assertNull(Booking::find($booking->booking_id));

        // Transaction still resolves booking via withTrashed
        $refreshedTx = $transaction->fresh();
        $this->assertNotNull($refreshedTx->booking);
        $this->assertEquals('BKG-SOFT-TEST-002', $refreshedTx->booking->booking_code);
    }
}
