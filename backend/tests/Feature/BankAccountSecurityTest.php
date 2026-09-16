<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BankAccountSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $owner1;
    private User $owner2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner1 = User::create([
            'name'          => 'Owner Satu',
            'email'         => 'owner1@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567811',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        $this->owner2 = User::create([
            'name'          => 'Owner Dua',
            'email'         => 'owner2@lapangin.id',
            'password_hash' => Hash::make('secret456'),
            'phone'         => '081234567822',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);
    }

    public function test_rejects_bank_account_number_with_letters(): void
    {
        Sanctum::actingAs($this->owner1);

        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BCA',
            'account_number'   => '12345ABCD', // Contains letters
            'account_holder'   => 'Owner Satu',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['account_number']);
    }

    public function test_rejects_bank_account_number_that_is_too_short(): void
    {
        Sanctum::actingAs($this->owner1);

        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BCA',
            'account_number'   => '12345', // Only 5 digits, expected min 8
            'account_holder'   => 'Owner Satu',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['account_number']);
    }

    public function test_accepts_valid_numeric_bank_account(): void
    {
        Sanctum::actingAs($this->owner1);

        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BCA',
            'account_number'   => '8830192831',
            'account_holder'   => 'Owner Satu',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'bank_name'      => 'BCA',
                    'account_number' => '8830192831',
                ],
            ]);

        $wallet = Wallet::where('owner_id', $this->owner1->user_id)->first();
        $this->assertEquals('8830192831', $wallet->account_number);
    }

    public function test_rejects_duplicate_bank_account_across_different_owners(): void
    {
        // Owner 1 sets their bank account
        Sanctum::actingAs($this->owner1);
        $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BCA',
            'account_number'   => '8830192831',
            'account_holder'   => 'Owner Satu',
        ])->assertStatus(200);

        // Owner 2 attempts to save the exact same BCA account number
        Sanctum::actingAs($this->owner2);
        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'secret456',
            'bank_name'        => 'BCA',
            'account_number'   => '8830192831',
            'account_holder'   => 'Owner Dua',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['account_number']);
    }

    public function test_allows_same_account_number_for_different_bank(): void
    {
        // Owner 1 sets BCA with '8830192831'
        Sanctum::actingAs($this->owner1);
        $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BCA',
            'account_number'   => '8830192831',
            'account_holder'   => 'Owner Satu',
        ])->assertStatus(200);

        // Owner 2 sets Mandiri with the same number '8830192831' (different bank is valid)
        Sanctum::actingAs($this->owner2);
        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'secret456',
            'bank_name'        => 'Mandiri',
            'account_number'   => '8830192831',
            'account_holder'   => 'Owner Dua',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_owner_can_update_their_own_details_without_self_duplicate_error(): void
    {
        Sanctum::actingAs($this->owner1);

        $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BCA',
            'account_number'   => '8830192831',
            'account_holder'   => 'Owner Satu Awal',
        ])->assertStatus(200);

        // Update holder name with same bank and account number
        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BCA',
            'account_number'   => '8830192831',
            'account_holder'   => 'Owner Satu Diperbarui',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'account_holder' => 'Owner Satu Diperbarui',
                ],
            ]);
    }
}
