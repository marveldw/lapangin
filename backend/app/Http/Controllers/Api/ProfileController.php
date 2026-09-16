<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

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
            'account_number'   => [
                'bail',
                'required',
                'string',
                'regex:/^[0-9]+$/',
                'min:8',
                'max:20',
                Rule::unique('wallets', 'account_number')
                    ->where(fn ($query) => $query->where('bank_name', $request->bank_name))
                    ->ignore($user->user_id, 'owner_id'),
                function ($attribute, $value, $fail) use ($request) {
                    // 1. Anti-dummy: all identical repeating digits (e.g. 0000000000, 1111111111)
                    if (preg_match('/^(\d)\1+$/', $value)) {
                        $fail('Nomor rekening tidak valid (tidak boleh berisi angka yang sama berulang).');
                        return;
                    }

                    // 2. Anti-dummy: obvious dummy sequences (e.g. 98765432, 12345678)
                    if (in_array($value, ['98765432', '12345678'], true)) {
                        $fail('Nomor rekening tidak valid (tidak boleh berupa urutan angka acak/dummy).');
                        return;
                    }

                    // 3. Bank-specific length validation
                    $bankLengths = [
                        'BCA'          => [10],
                        'BNI'          => [10],
                        'BSI'          => [10],
                        'BRI'          => [15],
                        'MANDIRI'      => [10, 13],
                        'BANK MANDIRI' => [10, 13],
                        'JAGO'         => [12],
                        'BANK JAGO'    => [12],
                        'SEABANK'      => [12],
                    ];

                    $bankKey = strtoupper(trim($request->bank_name ?? ''));
                    if (isset($bankLengths[$bankKey])) {
                        $allowed = $bankLengths[$bankKey];
                        if (!in_array(strlen($value), $allowed, true)) {
                            $expected = count($allowed) === 1 ? "{$allowed[0]} digit" : implode(' atau ', $allowed) . ' digit';
                            $fail("Nomor rekening {$request->bank_name} harus terdiri dari {$expected}.");
                            return;
                        }
                    }
                },
            ],
            'account_holder'   => 'required|string|max:100',
        ], [
            'account_number.required' => 'Nomor rekening wajib diisi.',
            'account_number.regex'    => 'Nomor rekening hanya boleh berisi angka.',
            'account_number.min'      => 'Nomor rekening minimal 8 digit.',
            'account_number.max'      => 'Nomor rekening maksimal 20 digit.',
            'account_number.unique'   => 'Nomor rekening ini sudah terdaftar pada akun lain.',
        ]);

        // 1. Verifikasi kata sandi akun saat ini
        if (!Hash::check($validated['current_password'], $user->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Kata sandi konfirmasi tidak sesuai. Perubahan rekening ditolak demi keamanan dana Anda.',
            ], 422);
        }

        // 3. Update wallet bank account
        $wallet = Wallet::firstOrCreate(['owner_id' => $user->user_id]);
        $oldDetails = "{$wallet->bank_name} {$wallet->account_number} a.n {$wallet->account_holder}";
        $newDetails = "{$validated['bank_name']} {$validated['account_number']} a.n {$validated['account_holder']}";

        try {
            $wallet->update([
                'bank_name'      => $validated['bank_name'],
                'account_number' => $validated['account_number'],
                'account_holder' => $validated['account_holder'],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor rekening ini sudah terdaftar pada akun lain.',
                'errors'  => [
                    'account_number' => ['Nomor rekening ini sudah terdaftar pada akun lain.'],
                ],
            ], 422);
        }

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