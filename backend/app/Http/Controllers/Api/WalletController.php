<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletMutation;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    /**
     * Get Owner Wallet Information & Balance History
     * GET /api/owner/wallet
     */
    public function getWallet(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'OWNER' && $user->role !== 'ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pemilik venue (owner) yang memiliki akses dompet.',
            ], 403);
        }

        $wallet = Wallet::firstOrCreate(
            ['owner_id' => $user->user_id],
            ['balance' => 0, 'locked_balance' => 0]
        );

        $mutations = $wallet->mutations()->take(50)->get();
        $withdrawals = $wallet->withdrawals()->take(30)->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'wallet_id'         => $wallet->wallet_id,
                'balance'           => (int) $wallet->balance,
                'locked_balance'    => (int) $wallet->locked_balance,
                'available_balance' => (int) max(0, $wallet->balance),
                'mutations'         => $mutations,
                'withdrawals'       => $withdrawals,
            ],
        ]);
    }

    /**
     * Request a Withdrawal
     * POST /api/owner/withdraw
     */
    public function requestWithdraw(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'OWNER' && $user->role !== 'ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pemilik venue (owner) yang dapat mengajukan penarikan dana.',
            ], 403);
        }

        $validated = $request->validate([
            'amount'         => 'required|integer|min:50000', // Minimal Rp 50.000
            'bank_name'      => 'required|string|max:50',
            'account_number' => 'required|string|max:50',
            'account_holder' => 'required|string|max:100',
        ], [
            'amount.min' => 'Nominal penarikan minimal adalah Rp 50.000.',
        ]);

        return DB::transaction(function () use ($user, $validated) {
            $wallet = Wallet::where('owner_id', $user->user_id)
                ->lockForUpdate()
                ->first();

            if (!$wallet || $wallet->balance < $validated['amount']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Saldo aktif Anda tidak mencukupi untuk melakukan penarikan ini.',
                ], 422);
            }

            $amount = (int) $validated['amount'];
            $balanceBefore = $wallet->balance;

            // Pindahkan saldo aktif ke saldo terkunci (held for payout)
            $wallet->decrement('balance', $amount);
            $wallet->increment('locked_balance', $amount);

            $withdrawalCode = 'WDR-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

            $withdrawal = Withdrawal::create([
                'withdrawal_code' => $withdrawalCode,
                'wallet_id'       => $wallet->wallet_id,
                'amount'          => $amount,
                'bank_name'       => $validated['bank_name'],
                'account_number'  => $validated['account_number'],
                'account_holder'  => $validated['account_holder'],
                'status'          => 'PENDING',
            ]);

            // Catat mutasi debit
            WalletMutation::create([
                'wallet_id'      => $wallet->wallet_id,
                'type'           => 'DEBIT',
                'amount'         => $amount,
                'balance_before' => $balanceBefore,
                'balance_after'  => $wallet->balance,
                'description'    => "Pengajuan penarikan dana ke {$validated['bank_name']} ({$validated['account_number']})",
                'reference_type' => 'WITHDRAWAL',
                'reference_id'   => $withdrawal->withdrawal_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan penarikan dana berhasil dikirim dan sedang menunggu verifikasi admin.',
                'data'    => $withdrawal,
            ], 201);
        });
    }
}
