<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffPhoneValidationTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private User $existingCustomer;
    private User $staff;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::create([
            'name'          => 'Owner Venue',
            'email'         => 'owner_venue@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567890',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        $this->existingCustomer = User::create([
            'name'          => 'Existing Customer',
            'email'         => 'customer_existing@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081299998888',
            'role'          => 'CUSTOMER',
            'status'        => 'ACTIVE',
        ]);

        $this->staff = User::create([
            'name'          => 'Staff Lama',
            'email'         => 'staff_lama@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081277776666',
            'role'          => 'STAFF',
            'owner_id'      => $this->owner->user_id,
            'status'        => 'ACTIVE',
        ]);
    }

    public function test_rejects_staff_creation_without_phone(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->postJson('/api/owner/staff', [
            'name'     => 'Staff No Phone',
            'email'    => 'staff_no_phone@lapangin.id',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone'])
            ->assertJsonFragment([
                'phone' => ['Nomor telepon staf wajib diisi.'],
            ]);
    }

    public function test_rejects_staff_creation_with_letters_or_symbols(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->postJson('/api/owner/staff', [
            'name'     => 'Staff Letters',
            'email'    => 'staff_letters@lapangin.id',
            'password' => 'password123',
            'phone'    => '0812abc3456',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone'])
            ->assertJsonFragment([
                'phone' => ['Nomor telepon harus berupa angka valid dengan format Indonesia (contoh: 08123456789).'],
            ]);
    }

    public function test_rejects_staff_creation_with_too_short_or_too_long_number(): void
    {
        Sanctum::actingAs($this->owner);

        // Too short (7 digits)
        $resShort = $this->postJson('/api/owner/staff', [
            'name'     => 'Staff Short',
            'email'    => 'staff_short@lapangin.id',
            'password' => 'password123',
            'phone'    => '0812345',
        ]);

        $resShort->assertStatus(422)
            ->assertJsonValidationErrors(['phone'])
            ->assertJsonFragment([
                'phone' => ['Nomor telepon harus berupa angka valid dengan format Indonesia (contoh: 08123456789).'],
            ]);

        // Too long (15 digits)
        $resLong = $this->postJson('/api/owner/staff', [
            'name'     => 'Staff Long',
            'email'    => 'staff_long@lapangin.id',
            'password' => 'password123',
            'phone'    => '081234567890123',
        ]);

        $resLong->assertStatus(422)
            ->assertJsonValidationErrors(['phone'])
            ->assertJsonFragment([
                'phone' => ['Nomor telepon harus berupa angka valid dengan format Indonesia (contoh: 08123456789).'],
            ]);
    }

    public function test_accepts_valid_indonesian_formats_on_staff_creation(): void
    {
        Sanctum::actingAs($this->owner);

        // 1. 08xx format
        $res1 = $this->postJson('/api/owner/staff', [
            'name'     => 'Staff 08',
            'email'    => 'staff08@lapangin.id',
            'password' => 'password123',
            'phone'    => '081233334444',
        ]);
        $res1->assertStatus(201);

        // 2. +628xx format
        $res2 = $this->postJson('/api/owner/staff', [
            'name'     => 'Staff Plus62',
            'email'    => 'staffplus62@lapangin.id',
            'password' => 'password123',
            'phone'    => '+6281255556666',
        ]);
        $res2->assertStatus(201);

        // 3. 628xx format
        $res3 = $this->postJson('/api/owner/staff', [
            'name'     => 'Staff 62',
            'email'    => 'staff62@lapangin.id',
            'password' => 'password123',
            'phone'    => '6281277778888',
        ]);
        $res3->assertStatus(201);
    }

    public function test_rejects_staff_creation_with_duplicate_phone_across_any_role(): void
    {
        Sanctum::actingAs($this->owner);

        // Duplicate with existing customer's phone
        $resCustomerDup = $this->postJson('/api/owner/staff', [
            'name'     => 'Staff Dup Customer',
            'email'    => 'staff_dup_cust@lapangin.id',
            'password' => 'password123',
            'phone'    => '081299998888', // Customer's phone
        ]);

        $resCustomerDup->assertStatus(422)
            ->assertJsonValidationErrors(['phone'])
            ->assertJsonFragment([
                'phone' => ['Nomor telepon ini sudah terdaftar pada akun lain.'],
            ]);

        // Duplicate with owner's phone
        $resOwnerDup = $this->postJson('/api/owner/staff', [
            'name'     => 'Staff Dup Owner',
            'email'    => 'staff_dup_owner@lapangin.id',
            'password' => 'password123',
            'phone'    => '081234567890', // Owner's phone
        ]);

        $resOwnerDup->assertStatus(422)
            ->assertJsonValidationErrors(['phone'])
            ->assertJsonFragment([
                'phone' => ['Nomor telepon ini sudah terdaftar pada akun lain.'],
            ]);
    }

    public function test_editing_existing_staff_without_changing_phone_succeeds(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->putJson("/api/owner/staff/{$this->staff->user_id}", [
            'name'  => 'Staff Lama Updated',
            'phone' => '081277776666', // Same phone as existing record
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'user_id' => $this->staff->user_id,
                    'name'    => 'Staff Lama Updated',
                    'phone'   => '081277776666',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'user_id' => $this->staff->user_id,
            'name'    => 'Staff Lama Updated',
            'phone'   => '081277776666',
        ]);
    }

    public function test_editing_existing_staff_to_duplicate_phone_is_rejected(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->putJson("/api/owner/staff/{$this->staff->user_id}", [
            'phone' => '081299998888', // Existing customer's phone
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone'])
            ->assertJsonFragment([
                'phone' => ['Nomor telepon ini sudah terdaftar pada akun lain.'],
            ]);
    }
}
