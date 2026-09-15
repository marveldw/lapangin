<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class ProfileSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::create([
            'name'          => 'Owner Keuangan',
            'email'         => 'owner_finance@lapangin.id',
            'password_hash' => Hash::make('secret12345'),
            'phone'         => '081234567890',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        Sanctum::actingAs($this->owner);
    }

    public function test_can_update_own_profile_fields(): void
    {
        $response = $this->putJson('/api/profile', [
            'name'  => 'Owner Lapangan Baru',
            'email' => 'owner_new@lapangin.id',
            'phone' => '081298765432',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'name'  => 'Owner Lapangan Baru',
                    'email' => 'owner_new@lapangin.id',
                    'phone' => '081298765432',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'user_id' => $this->owner->user_id,
            'name'    => 'Owner Lapangan Baru',
            'email'   => 'owner_new@lapangin.id',
            'phone'   => '081298765432',
        ]);
    }

    public function test_rejects_payout_account_update_without_valid_password(): void
    {
        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'wrong_password',
            'bank_name'        => 'BCA',
            'account_number'   => '1234567890',
            'account_holder'   => 'Hacker Account',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_allows_payout_account_update_with_valid_password_and_logs_audit(): void
    {
        $response = $this->putJson('/api/owner/payout-account', [
            'current_password' => 'secret12345',
            'bank_name'        => 'Bank Mandiri',
            'account_number'   => '9876543210',
            'account_holder'   => 'Owner Keuangan',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'bank_name'      => 'Bank Mandiri',
                    'account_number' => '9876543210',
                    'account_holder' => 'Owner Keuangan',
                ],
            ]);

        $this->assertDatabaseHas('wallets', [
            'owner_id'       => $this->owner->user_id,
            'bank_name'      => 'Bank Mandiri',
            'account_number' => '9876543210',
            'account_holder' => 'Owner Keuangan',
        ]);

        // Verifikasi tercatat di activity log
        $this->assertDatabaseHas('activity_log', [
            'causer_id'   => $this->owner->user_id,
            'description' => "Rekening pencairan dana diubah oleh {$this->owner->name}",
        ]);
    }
}