<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_rejects_unregistered_email(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'unknown@example.com',
        ]);

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_forgot_password_generates_token_for_registered_user(): void
    {
        $user = User::factory()->create([
            'email' => 'testuser@example.com',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'testuser@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => ['email', 'token', 'reset_url'],
            ]);

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'testuser@example.com',
        ]);
    }

    public function test_reset_password_rejects_invalid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'testuser@example.com',
        ]);

        $forgotRes = $this->postJson('/api/forgot-password', [
            'email' => 'testuser@example.com',
        ]);

        $response = $this->postJson('/api/reset-password', [
            'email'                 => 'testuser@example.com',
            'token'                 => 'wrong-token-12345',
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_reset_password_updates_password_successfully(): void
    {
        $user = User::factory()->create([
            'email'         => 'testuser@example.com',
            'password_hash' => Hash::make('oldpassword123'),
        ]);

        $forgotRes = $this->postJson('/api/forgot-password', [
            'email' => 'testuser@example.com',
        ]);

        $token = $forgotRes->json('data.token');

        $response = $this->postJson('/api/reset-password', [
            'email'                 => 'testuser@example.com',
            'token'                 => $token,
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        // Token should be cleared from database
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'testuser@example.com',
        ]);

        // User can now log in with new password
        $loginRes = $this->postJson('/api/login', [
            'email'    => 'testuser@example.com',
            'password' => 'newpassword123',
        ]);

        $loginRes->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }
}
