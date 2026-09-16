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

    public function test_rejects_bank_account_with_symbols_or_spaces(): void
    {
        Sanctum::actingAs($this->owner1);

        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BCA',
            'account_number'   => '8830-1928-31',
            'account_holder'   => 'Owner Satu',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['account_number'])
            ->assertJsonFragment([
                'account_number' => ['Nomor rekening hanya boleh berisi angka.'],
            ]);
    }

    public function test_rejects_bank_account_number_that_is_too_long(): void
    {
        Sanctum::actingAs($this->owner1);

        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BCA',
            'account_number'   => '123456789012345678901', // 21 digits (> 20)
            'account_holder'   => 'Owner Satu',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['account_number'])
            ->assertJsonFragment([
                'account_number' => ['Nomor rekening maksimal 20 digit.'],
            ]);
    }

    public function test_re_verification_fails_with_incorrect_password(): void
    {
        Sanctum::actingAs($this->owner1);

        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'wrong_password_attempt',
            'bank_name'        => 'BCA',
            'account_number'   => '8830192831',
            'account_holder'   => 'Owner Satu',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Kata sandi konfirmasi tidak sesuai. Perubahan rekening ditolak demi keamanan dana Anda.',
            ]);
    }

    public function test_audit_log_recorded_on_successful_payout_account_update(): void
    {
        Sanctum::actingAs($this->owner1);

        $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BCA',
            'account_number'   => '8830192831',
            'account_holder'   => 'Owner Satu',
        ])->assertStatus(200);

        $this->assertDatabaseHas('activity_log', [
            'causer_id'   => $this->owner1->user_id,
            'description' => "Rekening pencairan dana diubah oleh {$this->owner1->name}",
        ]);
    }

    public function test_rejects_bca_account_number_with_wrong_digit_length(): void
    {
        Sanctum::actingAs($this->owner1);

        // 8 digits on BCA (e.g. 98765432) must be rejected
        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BCA',
            'account_number'   => '98765432',
            'account_holder'   => 'Owner Satu',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['account_number']);

        // 11 digits on BCA must also be rejected
        $response2 = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BCA',
            'account_number'   => '54676879809',
            'account_holder'   => 'Owner Satu',
        ]);

        $response2->assertStatus(422)
            ->assertJsonValidationErrors(['account_number'])
            ->assertJsonFragment([
                'account_number' => ['Nomor rekening BCA harus terdiri dari 10 digit.'],
            ]);
    }

    public function test_rejects_repeating_identical_digits(): void
    {
        Sanctum::actingAs($this->owner1);

        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BCA',
            'account_number'   => '1111111111',
            'account_holder'   => 'Owner Satu',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['account_number'])
            ->assertJsonFragment([
                'account_number' => ['Nomor rekening tidak valid (tidak boleh berisi angka yang sama berulang).'],
            ]);
    }

    public function test_rejects_bri_with_incorrect_digit_count(): void
    {
        Sanctum::actingAs($this->owner1);

        // BRI requires 15 digits
        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'password123',
            'bank_name'        => 'BRI',
            'account_number'   => '8830192831', // Only 10 digits
            'account_holder'   => 'Owner Satu',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['account_number'])
            ->assertJsonFragment([
                'account_number' => ['Nomor rekening BRI harus terdiri dari 15 digit.'],
            ]);
    }
}
