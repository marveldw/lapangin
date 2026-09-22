<?php

namespace Tests\Feature;

use App\Mail\ResetPasswordMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_returns_generic_success_for_unregistered_email(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'unknown@example.com',
        ]);

        // Security: Prevent email enumeration, always return 200 generic message
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        Mail::assertNothingSent();
    }

    public function test_forgot_password_sends_email_for_registered_user(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'testuser@example.com',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'testuser@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'testuser@example.com',
        ]);

        Mail::assertSent(ResetPasswordMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email) &&
                   str_contains($mail->resetUrl, 'reset-password?token=') &&
                   $mail->expiresInMinutes === 60;
        });
    }

    public function test_reset_password_rejects_invalid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'testuser@example.com',
        ]);

        // Generate valid token in database
        Password::broker()->createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'email'                 => 'testuser@example.com',
            'token'                 => 'wrong-invalid-token',
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_reset_password_rejects_already_used_or_nonexistent_token(): void
    {
        $user = User::factory()->create([
            'email' => 'testuser@example.com',
        ]);

        // No token generated in DB
        $response = $this->postJson('/api/reset-password', [
            'email'                 => 'testuser@example.com',
            'token'                 => 'some-token',
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Link ini sudah digunakan atau tidak valid. Silakan minta link reset baru.',
            ]);
    }

    public function test_reset_password_rejects_expired_token(): void
    {
        $user = User::factory()->create([
            'email' => 'testuser@example.com',
        ]);

        $token = Password::broker()->createToken($user);

        // Manually age the token past 60 minutes
        DB::table('password_reset_tokens')
            ->where('email', $user->email)
            ->update(['created_at' => Carbon::now()->subMinutes(61)]);

        $response = $this->postJson('/api/reset-password', [
            'email'                 => 'testuser@example.com',
            'token'                 => $token,
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Link reset password sudah kadaluarsa. Silakan minta link baru.',
            ]);
    }

    public function test_reset_password_updates_password_clears_token_and_invalidates_sessions(): void
    {
        $user = User::factory()->create([
            'email'         => 'testuser@example.com',
            'password_hash' => Hash::make('oldpassword123'),
        ]);

        // Create an existing Sanctum token to verify session invalidation
        $user->createToken('mobile_app_session');
        $this->assertCount(1, $user->tokens);

        $token = Password::broker()->createToken($user);

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

        // Token should be single-use and cleared immediately
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'testuser@example.com',
        ]);

        // Existing sessions/tokens must be invalidated
        $this->assertCount(0, $user->fresh()->tokens);

        // User can log in with new password
        $loginRes = $this->postJson('/api/login', [
            'email'    => 'testuser@example.com',
            'password' => 'newpassword123',
        ]);

        $loginRes->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_forgot_password_rate_limiting(): void
    {
        Mail::fake();

        // 3 requests allowed per 15 minutes per email
        for ($i = 0; $i < 3; $i++) {
            $res = $this->postJson('/api/forgot-password', [
                'email' => 'ratelimit@example.com',
            ]);
            $res->assertStatus(200);
        }

        // 4th request must be throttled with 429
        $throttledRes = $this->postJson('/api/forgot-password', [
            'email' => 'ratelimit@example.com',
        ]);

        $throttledRes->assertStatus(429)
            ->assertJson([
                'success' => false,
            ]);
    }
}
