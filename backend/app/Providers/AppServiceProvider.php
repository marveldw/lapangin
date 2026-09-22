<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \Filament\Auth\Http\Responses\Contracts\LoginResponse::class,
            \App\Http\Responses\FilamentLoginResponse::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rate limiter: Login — configurable attempts and decay minutes
        RateLimiter::for('login', function (Request $request) {
            $maxAttempts = (int) env('LOGIN_MAX_ATTEMPTS', 5);
            $decayMinutes = (int) env('LOGIN_DECAY_MINUTES', 1);
            $key = strtolower($request->input('email', '')) . '|' . $request->ip();

            return Limit::perMinutes($decayMinutes, $maxAttempts)->by($key)->response(function () use ($request, $decayMinutes) {
                Log::warning("Login rate limit triggered from IP {$request->ip()} for email '{$request->input('email')}'");
                return response()->json([
                    'success' => false,
                    'message' => "Terlalu banyak percobaan login. Coba lagi dalam {$decayMinutes} menit.",
                ], 429);
            });
        });

        // Rate limiter: Forgot Password — max 3 requests per 15 minutes per email, 5 per IP
        RateLimiter::for('forgot-password', function (Request $request) {
            $email = strtolower($request->input('email', ''));
            $ip = $request->ip();

            return [
                Limit::perMinutes(15, 3)->by("forgot:email:{$email}")->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak permintaan reset kata sandi untuk email ini. Coba lagi dalam 15 menit.',
                    ], 429);
                }),
                Limit::perMinutes(15, 5)->by("forgot:ip:{$ip}")->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak permintaan reset kata sandi dari koneksi Anda. Coba lagi dalam 15 menit.',
                    ], 429);
                }),
            ];
        });

        // Rate limiter: Reset Password — max 5 attempts per 15 minutes per IP
        RateLimiter::for('reset-password', function (Request $request) {
            return Limit::perMinutes(15, 5)->by($request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Terlalu banyak percobaan reset kata sandi. Coba lagi dalam 15 menit.',
                ], 429);
            });
        });

        // Rate limiter: Register — 3 attempts per minute by IP
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Terlalu banyak percobaan registrasi. Silakan coba lagi setelah 1 menit.',
                ], 429);
            });
        });

        // Rate limiter: Public booking — 10 per minute by IP, 3 per minute by phone
        RateLimiter::for('public-booking', function (Request $request) {
            return [
                Limit::perMinute(10)->by($request->ip()),
                Limit::perMinute(3)->by($request->input('customer_phone', $request->ip())),
            ];
        });

        // Rate limiter: General API — 60 per minute by user or IP
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->user_id ?: $request->ip());
        });

        // RBAC Gates: Financial endpoints & court lifecycle decisions (structural)
        \Illuminate\Support\Facades\Gate::define('view-financial', function (\App\Models\User $user) {
            return in_array($user->role, ['OWNER', 'ADMIN'], true);
        });

        \Illuminate\Support\Facades\Gate::define('manage-courts', function (\App\Models\User $user) {
            return in_array($user->role, ['OWNER', 'ADMIN'], true);
        });
    }
}
