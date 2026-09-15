<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Request a password reset token
     * POST /api/forgot-password
     */
    public function sendResetToken(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Alamat email tidak terdaftar dalam sistem.',
            ], 404);
        }

        // Generate 64-character secure random token
        $plainToken = Str::random(64);

        // Store hashed token in password_reset_tokens (standard Laravel security)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token'      => Hash::make($plainToken),
                'created_at' => now(),
            ]
        );

        return response()->json([
            'success'   => true,
            'message'   => 'Token reset kata sandi berhasil digenerate.',
            'data'      => [
                'email'              => $user->email,
                'token'              => $plainToken,
                'reset_url'          => url('/reset-password?token=' . $plainToken . '&email=' . urlencode($user->email)),
                'expires_in_minutes' => 60,
            ],
        ]);
    }

    /**
     * Reset password using token
     * POST /api/reset-password
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email'                 => 'required|email',
            'token'                 => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan reset kata sandi tidak valid atau telah kadaluarsa.',
            ], 422);
        }

        // Check 60-minute expiry
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();
            return response()->json([
                'success' => false,
                'message' => 'Token reset kata sandi telah kadaluarsa. Silakan minta token baru.',
            ], 422);
        }

        // Check token hash
        if (!Hash::check($validated['token'], $record->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Token reset kata sandi tidak valid.',
            ], 422);
        }

        $user = User::where('email', $validated['email'])->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        // Update password
        $user->update([
            'password_hash' => Hash::make($validated['password']),
        ]);

        // Invalidate token
        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        // Audit log
        activity()
            ->performedOn($user)
            ->causedBy($user)
            ->log("Kata sandi user '{$user->email}' berhasil di-reset.");

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui. Silakan login kembali dengan sandi baru Anda.',
        ]);
    }
}
