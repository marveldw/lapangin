<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class BotProtectionAndLoginThrottleTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_succeeds_when_bot_protection_disabled(): void
    {
        config(['services.recaptcha.enabled' => false]);
        config(['services.turnstile.enabled' => false]);

        $user = User::factory()->create([
            'email'         => 'human@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'human@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_login_fails_when_recaptcha_enabled_and_token_missing(): void
    {
        config([
            'services.recaptcha.enabled'    => true,
            'services.recaptcha.secret_key' => 'test-secret-key',
        ]);

        $user = User::factory()->create([
            'email'         => 'human@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'human@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Verifikasi gagal, coba lagi.',
            ]);
    }

    public function test_login_blocks_bot_with_low_recaptcha_score(): void
    {
        config([
            'services.recaptcha.enabled'         => true,
            'services.recaptcha.secret_key'      => 'test-secret-key',
            'services.recaptcha.score_threshold' => 0.5,
        ]);

        Http::fake([
            'https://www.google.com/recaptcha/api/siteverify*' => Http::response([
                'success' => true,
                'score'   => 0.2, // Bot score
                'action'  => 'login',
            ], 200),
        ]);

        $user = User::factory()->create([
            'email'         => 'bot@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'         => 'bot@example.com',
            'password'      => 'password123',
            'captcha_token' => 'bot-token',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Verifikasi gagal, coba lagi.',
            ]);
    }

    public function test_login_allows_human_with_high_recaptcha_score(): void
    {
        config([
            'services.recaptcha.enabled'         => true,
            'services.recaptcha.secret_key'      => 'test-secret-key',
            'services.recaptcha.score_threshold' => 0.5,
        ]);

        Http::fake([
            'https://www.google.com/recaptcha/api/siteverify*' => Http::response([
                'success' => true,
                'score'   => 0.9, // Human score
                'action'  => 'login',
            ], 200),
        ]);

        $user = User::factory()->create([
            'email'         => 'human@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'         => 'human@example.com',
            'password'      => 'password123',
            'captcha_token' => 'valid-human-token',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_login_fails_open_on_google_recaptcha_outage(): void
    {
        config([
            'services.recaptcha.enabled'    => true,
            'services.recaptcha.secret_key' => 'test-secret-key',
        ]);

        Http::fake([
            'https://www.google.com/recaptcha/api/siteverify*' => Http::response('Server Error', 500),
        ]);

        $user = User::factory()->create([
            'email'         => 'human@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'         => 'human@example.com',
            'password'      => 'password123',
            'captcha_token' => 'some-token',
        ]);

        // Fails open: allows login even if Google API is down
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_login_rate_limiting(): void
    {
        config(['services.recaptcha.enabled' => false]);

        $user = User::factory()->create([
            'email'         => 'throttle@example.com',
            'password_hash' => Hash::make('correctpassword'),
        ]);

        // Fail 5 times
        for ($i = 0; $i < 5; $i++) {
            $res = $this->postJson('/api/login', [
                'email'    => 'throttle@example.com',
                'password' => 'wrongpassword',
            ]);
            $res->assertStatus(401);
        }

        // 6th attempt is throttled
        $throttledRes = $this->postJson('/api/login', [
            'email'    => 'throttle@example.com',
            'password' => 'wrongpassword',
        ]);

        $throttledRes->assertStatus(429)
            ->assertJson([
                'success' => false,
            ]);
    }
}
