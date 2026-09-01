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
}
