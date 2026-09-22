<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BotProtectionService
{
    /**
     * Verify passive bot protection (Google reCAPTCHA v3 or Cloudflare Turnstile).
     *
     * @param Request $request
     * @param string $expectedAction
     * @return array{success: bool, message?: string, score?: float}
     */
    public function verify(Request $request, string $expectedAction = 'login'): array
    {
        $recaptchaEnabled = (bool) config('services.recaptcha.enabled', false);
        $turnstileEnabled = (bool) config('services.turnstile.enabled', false);

        // If neither is enabled (e.g. local dev / testing), pass silently
        if (!$recaptchaEnabled && !$turnstileEnabled) {
            return ['success' => true];
        }

        $token = $request->input('captcha_token')
            ?? $request->input('recaptcha_token')
            ?? $request->header('X-Captcha-Token');

        // Priority 1: Google reCAPTCHA v3
        if ($recaptchaEnabled) {
            return $this->verifyRecaptchaV3($token, $request->ip(), $expectedAction);
        }

        // Priority 2: Cloudflare Turnstile
        if ($turnstileEnabled) {
            return $this->verifyTurnstile($token, $request->ip());
        }

        return ['success' => true];
    }

    /**
     * Verify Google reCAPTCHA v3 score-based token.
     */
    protected function verifyRecaptchaV3(?string $token, ?string $ip, string $expectedAction): array
    {
        if (empty($token)) {
            Log::warning("reCAPTCHA v3: Missing token on verification attempt from IP {$ip}");
            return [
                'success' => false,
                'message' => 'Verifikasi gagal, coba lagi.',
            ];
        }

        $secret = config('services.recaptcha.secret_key');
        if (empty($secret)) {
            Log::error("reCAPTCHA v3: Secret key not configured, failing open.");
            return ['success' => true];
        }

        try {
            $response = Http::asForm()->timeout(5)->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret'   => $secret,
                'response' => $token,
                'remoteip' => $ip,
            ]);

            if (!$response->successful()) {
                Log::warning("reCAPTCHA v3: Google API returned HTTP {$response->status()} - failing open");
                return ['success' => true];
            }

            $data = $response->json();
            $success = (bool) ($data['success'] ?? false);
            $score = (float) ($data['score'] ?? 0.0);
            $action = $data['action'] ?? null;
            $threshold = (float) config('services.recaptcha.score_threshold', 0.5);

            if (!$success) {
                Log::warning("reCAPTCHA v3: Verification rejected by Google for IP {$ip}", [
                    'errors' => $data['error-codes'] ?? [],
                ]);
                return [
                    'success' => false,
                    'message' => 'Verifikasi gagal, coba lagi.',
                ];
            }

            if ($score < $threshold) {
                Log::warning("reCAPTCHA v3: Low score bot detected from IP {$ip}. Score: {$score}, Threshold: {$threshold}, Action: {$action}");
                return [
                    'success' => false,
                    'message' => 'Verifikasi gagal, coba lagi.',
                ];
            }

            return [
                'success' => true,
                'score'   => $score,
            ];
        } catch (Exception $e) {
            // Fail open policy: network issue on Google's side should not lock real users out
            Log::warning("reCAPTCHA v3: Network exception during verification ({$e->getMessage()}) - failing open for IP {$ip}");
            return ['success' => true];
        }
    }

    /**
     * Verify Cloudflare Turnstile token.
     */
    protected function verifyTurnstile(?string $token, ?string $ip): array
    {
        if (empty($token)) {
            Log::warning("Cloudflare Turnstile: Missing token on verification attempt from IP {$ip}");
            return [
                'success' => false,
                'message' => 'Verifikasi gagal, coba lagi.',
            ];
        }

        $secret = config('services.turnstile.secret_key');
        if (empty($secret)) {
            Log::error("Cloudflare Turnstile: Secret key not configured, failing open.");
            return ['success' => true];
        }

        try {
            $response = Http::asForm()->timeout(5)->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret'   => $secret,
                'response' => $token,
                'remoteip' => $ip,
            ]);

            if (!$response->successful()) {
                Log::warning("Cloudflare Turnstile: API returned HTTP {$response->status()} - failing open");
                return ['success' => true];
            }

            $data = $response->json();
            $success = (bool) ($data['success'] ?? false);

            if (!$success) {
                Log::warning("Cloudflare Turnstile: Verification failed for IP {$ip}", [
                    'errors' => $data['error-codes'] ?? [],
                ]);
                return [
                    'success' => false,
                    'message' => 'Verifikasi gagal, coba lagi.',
                ];
            }

            return ['success' => true];
        } catch (Exception $e) {
            // Fail open policy on network outage
            Log::warning("Cloudflare Turnstile: Network exception ({$e->getMessage()}) - failing open for IP {$ip}");
            return ['success' => true];
        }
    }
}
