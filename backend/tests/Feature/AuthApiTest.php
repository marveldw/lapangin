<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_login_without_csrf_error(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'customer_test@lapangin.id'],
            [
                'name'          => 'Test Customer',
                'password_hash' => Hash::make('password123'),
                'phone'         => '081234567891',
                'role'          => 'CUSTOMER',
                'status'        => 'ACTIVE',
            ]
        );

        $response = $this->postJson('/api/login', [
            'email'    => 'customer_test@lapangin.id',
            'password' => 'password123',
        ], [
            'Origin' => 'http://localhost:3000',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user'    => [
                    'email' => 'customer_test@lapangin.id',
                    'role'  => 'CUSTOMER',
                ],
            ])
            ->assertJsonStructure(['token']);
    }

    public function test_rejects_registration_with_invalid_phone_format(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Invalid Phone User',
            'email'                 => 'invalid_phone@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'phone'                 => '123456', // Invalid format
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_rejects_registration_with_duplicate_phone(): void
    {
        User::create([
            'name'          => 'Existing User',
            'email'         => 'existing@example.com',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567899',
            'role'          => 'CUSTOMER',
            'status'        => 'ACTIVE',
        ]);

        $response = $this->postJson('/api/register', [
            'name'                  => 'New User Same Phone',
            'email'                 => 'new_user@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'phone'                 => '081234567899', // Duplicate phone
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_accepts_registration_with_valid_phone(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Valid Phone User',
            'email'                 => 'valid_phone@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'phone'                 => '081298765432',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);
    }
}
