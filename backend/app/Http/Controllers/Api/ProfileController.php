<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    // GET /api/profile
    public function getProfile(Request $request)
    {
        $user = $request->user();
        $wallet = Wallet::firstOrCreate(['owner_id' => $user->user_id]);

        return response()->json([
            'success' => true,
            'data'    => [
                'user_id' => $user->user_id,
                'name'    => $user->name,
                'email'   => $user->email,
                'phone'   => $user->phone,
                'role'    => $user->role,
                'status'  => $user->status,
                'bank'    => [
                    'bank_name'      => $wallet->bank_name,
                    'account_number' => $wallet->account_number,
                    'account_holder' => $wallet->account_holder,
                ],
            ],
        ]);
    }

    // PUT /api/profile — User can freely edit basic profile details
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => "required|email|max:255|unique:users,email,{$user->user_id},user_id",
            'phone' => [
                'required',
                'string',
                "unique:users,phone,{$user->user_id},user_id",
                'regex:/^(\+62|62|0)8[1-9][0-9]{7,11}$/',
            ],
        ], [
            'email.unique' => 'Email ini sudah terdaftar pada akun lain.',
            'phone.unique' => 'Nomor telepon ini sudah terdaftar pada akun lain.',
            'phone.regex'  => 'Format nomor telepon seluler Indonesia tidak valid (contoh: 08123456789).',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data'    => $user,
        ]);
    }

    // PUT /api/owner/payout-account — Financial security: locked with password & audit trail
    public function updatePayoutAccount(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'bank_name'        => 'required|string|max:50',
            'account_number'   => 'required|string|max:50',
            'account_holder'   => 'required|string|max:100',
        ]);

        // 1. Verifikasi kata sandi akun saat ini
        if (!Hash::check($validated['current_password'], $user->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Kata sandi konfirmasi tidak sesuai. Perubahan rekening ditolak demi keamanan dana Anda.',
            ], 422);
        }

        // 2. Update wallet bank account
        $wallet = Wallet::firstOrCreate(['owner_id' => $user->user_id]);
        $oldDetails = "{$wallet->bank_name} {$wallet->account_number} a.n {$wallet->account_holder}";
        $newDetails = "{$validated['bank_name']} {$validated['account_number']} a.n {$validated['account_holder']}";

        $wallet->update([
            'bank_name'      => $validated['bank_name'],
            'account_number' => $validated['account_number'],
            'account_holder' => $validated['account_holder'],
        ]);

        // 3. Catat audit trail yang tidak dapat dihapus
        activity()
            ->causedBy($user)
            ->performedOn($wallet)
            ->withProperties([
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'old'        => $oldDetails,
                'new'        => $newDetails,
            ])
            ->log("Rekening pencairan dana diubah oleh {$user->name}");

        return response()->json([
            'success' => true,
            'message' => 'Rekening pencairan dana berhasil diperbarui.',
            'data'    => [
                'bank_name'      => $wallet->bank_name,
                'account_number' => $wallet->account_number,
                'account_holder' => $wallet->account_holder,
            ],
        ]);
    }
}