<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|max:255|unique:users,email',
            'password'              => 'required|string|min:8|max:128|confirmed',
            'password_confirmation' => 'required|string',
            'phone'                 => [
                'required',
                'string',
                'unique:users,phone',
                'regex:/^(\+62|62|0)8[1-9][0-9]{7,11}$/',
            ],
            'role'                  => 'nullable|string|in:CUSTOMER,OWNER',
        ], [
            'phone.unique' => 'Nomor telepon ini sudah terdaftar pada akun lain.',
            'phone.regex'  => 'Format nomor telepon seluler Indonesia tidak valid (contoh: 08123456789).',
        ]);

        $role = $validated['role'] ?? 'CUSTOMER';

        $user = DB::transaction(function () use ($validated, $role) {
            $user = User::create([
                'name'          => $validated['name'],
                'email'         => $validated['email'],
                'password_hash' => Hash::make($validated['password']),
                'phone'         => $validated['phone'],
                'role'          => $role,
                'status'        => 'ACTIVE',
            ]);

            // If registering as OWNER, auto assign default FREE plan
            if ($role === 'OWNER') {
                $freePlan = Plan::firstOrCreate(
                    ['name' => 'FREE'],
                    [
                        'description'            => 'Paket Percobaan',
                        'price'                  => 0,
                        'max_courts'             => 1,
                        'max_bookings_per_month' => 30,
                        'is_active'              => true,
                    ]
                );

                Subscription::create([
                    'user_id'    => $user->user_id,
                    'plan_id'    => $freePlan->plan_id,
                    'start_date' => now(),
                    'end_date'   => now()->addYear(),
                    'status'     => 'ACTIVE',
                ]);
            }

            return $user;
        });

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil.',
            'token'   => $token,
            'user'    => $this->formatUserResponse($user),
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email|max:255',
            'password' => 'required|string|max:128',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah.',
            ], 401);
        }

        if ($user->status === 'INACTIVE') {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda sedang dinonaktifkan.',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        activity()
            ->causedBy($user)
            ->performedOn($user)
            ->event('login')
            ->log("Pengguna '{$user->name}' berhasil login ke sistem");

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => $this->formatUserResponse($user),
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        activity()
            ->causedBy($user)
            ->performedOn($user)
            ->event('logout')
            ->log("Pengguna '{$user->name}' melakukan logout");

        $user->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user'    => $this->formatUserResponse($request->user()),
        ]);
    }

    private function formatUserResponse(User $user): array
    {
        $user->loadMissing(['subscriptions.plan']);

        $activeSubscription = $user->subscriptions
            ->where('status', 'ACTIVE')
            ->sortByDesc('subscription_id')
            ->first();

        $plan = $activeSubscription?->plan;
        $planName = $plan?->name ?? 'FREE';
        $maxCourts = ($planName === 'PRO' || ($plan && $plan->max_courts === null))
            ? null
            : ($plan?->max_courts ?? Plan::getMaxCourtsForPlan('FREE'));

        return [
            'user_id'      => $user->user_id,
            'name'         => $user->name,
            'email'        => $user->email,
            'phone'        => $user->phone,
            'role'         => $user->role,
            'status'       => $user->status,
            'subscription' => ($user->role === 'OWNER') ? [
                'plan_id'                => $activeSubscription?->plan_id,
                'plan_name'              => $planName,
                'max_courts'             => $maxCourts,
                'max_bookings_per_month' => $plan?->max_bookings_per_month,
                'status'                 => $activeSubscription?->status ?? 'ACTIVE',
            ] : null,
        ];
    }
}