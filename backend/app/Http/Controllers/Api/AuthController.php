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
            'phone'                 => 'required|string|max:20',
            'role'                  => 'nullable|string|in:CUSTOMER,OWNER',
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
            'user'    => [
                'user_id' => $user->user_id,
                'name'    => $user->name,
                'email'   => $user->email,
                'phone'   => $user->phone,
                'role'    => $user->role,
            ],
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

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => [
                'user_id' => $user->user_id,
                'name'    => $user->name,
                'email'   => $user->email,
                'phone'   => $user->phone,
                'role'    => $user->role,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load(['subscriptions.plan']);

        $activeSubscription = $user->subscriptions
            ->where('status', 'ACTIVE')
            ->first();

        return response()->json([
            'success' => true,
            'user'    => [
                'user_id'      => $user->user_id,
                'name'         => $user->name,
                'email'        => $user->email,
                'role'         => $user->role,
                'phone'        => $user->phone,
                'status'       => $user->status,
                'subscription' => ($user->role === 'OWNER' && $activeSubscription) ? [
                    'plan_name'              => $activeSubscription->plan->name ?? null,
                    'max_courts'             => $activeSubscription->plan->max_courts ?? null,
                    'max_bookings_per_month' => $activeSubscription->plan->max_bookings_per_month ?? null,
                    'status'                 => $activeSubscription->status,
                ] : null,
            ],
        ]);
    }
}