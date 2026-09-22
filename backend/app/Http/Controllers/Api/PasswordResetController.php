<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;

class PasswordResetController extends Controller
{
    /**
     * Request a password reset token & email.
     * POST /api/forgot-password or POST /api/password/forgot
     */
    public function sendResetToken(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $user = User::where('email', strtolower($validated['email']))->first();

        // If user exists and is active, generate token & send real email
        if ($user && $user->status !== 'INACTIVE') {
            try {
                $token = Password::broker()->createToken($user);
                $expireMinutes = (int) config('auth.passwords.users.expire', 60);

                $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
                $resetUrl = "{$frontendUrl}/reset-password?token=" . urlencode($token) . '&email=' . urlencode($user->email);

                Mail::to($user->email)->send(new ResetPasswordMail($user, $resetUrl, $expireMinutes));

                activity()
                    ->performedOn($user)
                    ->causedBy($user)
                    ->log("Permintaan reset kata sandi dikirim ke email '{$user->email}'.");
            } catch (Exception $e) {
                Log::error("Failed to send password reset email to {$user->email}: " . $e->getMessage());
            }
        } else {
            Log::info("Password reset requested for non-existent or inactive email: {$validated['email']}");
        }

        // Security: Always return generic response to prevent email enumeration attacks
        return response()->json([
            'success' => true,
            'message' => 'Jika alamat email Anda terdaftar, tautan reset kata sandi telah dikirim ke inbox atau folder spam Anda.',
        ]);
    }

    /**
     * Reset password using token.
     * POST /api/reset-password or POST /api/password/reset
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email'                 => 'required|email|max:255',
            'token'                 => 'required|string',
            'password'              => 'required|string|min:8|max:128|confirmed',
            'password_confirmation' => 'required|string|min:8|max:128',
        ]);

        $user = User::where('email', strtolower($validated['email']))->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan reset kata sandi tidak valid atau telah kadaluarsa.',
            ], 422);
        }

        $record = DB::table('password_reset_tokens')
            ->where('email', $user->email)
            ->first();

        // 1. Check if token already used or does not exist
        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Link ini sudah digunakan atau tidak valid. Silakan minta link reset baru.',
            ], 422);
        }

        // 2. Check token expiration
        $expireMinutes = (int) config('auth.passwords.users.expire', 60);
        if (Carbon::parse($record->created_at)->addMinutes($expireMinutes)->isPast()) {
            Password::broker()->deleteToken($user);
            return response()->json([
                'success' => false,
                'message' => 'Link reset password sudah kadaluarsa. Silakan minta link baru.',
            ], 422);
        }

        // 3. Verify token match
        if (!Password::broker()->tokenExists($user, $validated['token'])) {
            return response()->json([
                'success' => false,
                'message' => 'Token reset kata sandi tidak valid.',
            ], 422);
        }

        // 4. Update user password
        $user->forceFill([
            'password_hash' => Hash::make($validated['password']),
        ])->save();

        // 5. Invalidate reset token immediately (single-use guarantee)
        Password::broker()->deleteToken($user);

        // 6. Invalidate ALL existing Sanctum tokens for that user (force re-login on all devices)
        $user->tokens()->delete();

        // 7. Audit log
        activity()
            ->performedOn($user)
            ->causedBy($user)
            ->log("Kata sandi user '{$user->email}' berhasil di-reset. Semua sesi aktif telah dihentikan.");

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui. Silakan login kembali dengan sandi baru Anda.',
        ]);
    }
}
