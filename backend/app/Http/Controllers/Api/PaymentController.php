<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletMutation;
use App\Services\MidtransService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Generate Dynamic QRIS for a Booking
     * POST /api/bookings/{id}/pay
     */
    public function payBooking(Request $request, $id, MidtransService $midtrans)
    {
        $user = $request->user();

        $booking = Booking::with('court.owner')->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Pemesanan tidak ditemukan.',
            ], 404);
        }

        if ($booking->user_id !== $user->user_id && $user->role !== 'ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak ke pemesanan ini.',
            ], 403);
        }

        if ($booking->status === 'CONFIRMED' || $booking->status === 'COMPLETED') {
            return response()->json([
                'success' => false,
                'message' => 'Pemesanan ini sudah lunas.',
            ], 400);
        }

        if ($booking->status === 'CANCELLED') {
            return response()->json([
                'success' => false,
                'message' => 'Pemesanan ini sudah dibatalkan.',
            ], 400);
        }

        // Update payment_method ke QRIS jika sebelumnya belum
        if ($booking->payment_method !== 'QRIS') {
            $booking->update(['payment_method' => 'QRIS']);
        }

        // Cek apakah sudah ada transaksi pending yang belum expired
        $existingTx = Transaction::where('type', 'BOOKING')
            ->where('reference_id', $booking->booking_id)
            ->where('status', 'PENDING')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->latest('transaction_id')
            ->first();

        if ($existingTx && $existingTx->qr_url) {
            return response()->json([
                'success' => true,
                'message' => 'Silakan lanjutkan pembayaran QRIS Anda.',
                'data'    => [
                    'order_id'     => $existingTx->order_id,
                    'gross_amount' => $existingTx->gross_amount,
                    'status'       => $existingTx->status,
                    'qr_url'       => $existingTx->qr_url,
                    'qr_string'    => $existingTx->qr_string,
                    'expires_at'   => $existingTx->expires_at?->toIso8601String(),
                ],
            ]);
        }

        // Generate Order ID baru berformat Ymd (contoh: BKG-20260909-BK94821-A1B2)
        $orderId = 'BKG-' . now()->format('Ymd') . '-' . $booking->booking_code . '-' . strtoupper(substr(uniqid(), -4));

        try {
            $customerDetails = [
                'first_name' => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone ?? '08123456789',
            ];

            $itemDetails = [
                [
                    'id'       => (string) $booking->court_id,
                    'price'    => (int) $booking->price,
                    'quantity' => 1,
                    'name'     => 'Sewa Lapangan: ' . ($booking->court?->name ?? 'Lapangan'),
                ],
            ];

            $charge = $midtrans->createDynamicQris(
                $orderId,
                (int) $booking->price,
                $customerDetails,
                $itemDetails
            );

            // Simpan transaksi di database
            $expiresAt = !empty($charge['expires_at'])
                ? Carbon::parse($charge['expires_at'])
                : now()->addMinutes(15);

            $tx = Transaction::create([
                'order_id'         => $charge['order_id'],
                'user_id'          => $user->user_id,
                'type'             => 'BOOKING',
                'reference_id'     => $booking->booking_id,
                'gross_amount'     => $booking->price,
                'status'           => 'PENDING',
                'payment_type'     => 'qris',
                'qr_url'           => $charge['qr_url'],
                'qr_string'        => $charge['qr_string'],
                'expires_at'       => $expiresAt,
                'payload_response' => $charge['payload_response'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'QRIS Dinamis berhasil dibuat.',
                'data'    => [
                    'order_id'     => $tx->order_id,
                    'gross_amount' => $tx->gross_amount,
                    'status'       => $tx->status,
                    'qr_url'       => $tx->qr_url,
                    'qr_string'    => $tx->qr_string,
                    'expires_at'   => $tx->expires_at?->toIso8601String(),
                ],
            ], 201);
        } catch (Exception $e) {
            Log::error('Midtrans QRIS Charge Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat QRIS pembayaran: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate Dynamic QRIS for Owner Subscription Upgrade
     * POST /api/subscriptions/{planId}/pay
     */
    public function paySubscription(Request $request, $planId, MidtransService $midtrans)
    {
        $user = $request->user();

        if ($user->role !== 'OWNER' && $user->role !== 'ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pemilik venue (owner) yang dapat berlangganan paket.',
            ], 403);
        }

        $plan = Plan::find($planId);

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Paket langganan tidak ditemukan.',
            ], 404);
        }

        // Jika paket gratis (Rp 0)
        if ($plan->price <= 0) {
            Subscription::updateOrCreate(
                ['user_id' => $user->user_id],
                [
                    'plan_id'    => $plan->plan_id,
                    'start_date' => now(),
                    'end_date'   => now()->addDays(30),
                    'status'     => 'ACTIVE',
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Berhasil beralih ke paket gratis.',
                'data'    => null,
            ]);
        }

        // Cek transaksi pending sebelumnya
        $existingTx = Transaction::where('type', 'SUBSCRIPTION')
            ->where('user_id', $user->user_id)
            ->where('reference_id', $plan->plan_id)
            ->where('status', 'PENDING')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->latest('transaction_id')
            ->first();

        if ($existingTx && $existingTx->qr_url) {
            return response()->json([
                'success' => true,
                'message' => 'Silakan lanjutkan pembayaran QRIS Anda.',
                'data'    => [
                    'order_id'     => $existingTx->order_id,
                    'gross_amount' => $existingTx->gross_amount,
                    'status'       => $existingTx->status,
                    'qr_url'       => $existingTx->qr_url,
                    'qr_string'    => $existingTx->qr_string,
                    'expires_at'   => $existingTx->expires_at?->toIso8601String(),
                ],
            ]);
        }

        // Generate Order ID baru berformat Ymd (contoh: SUB-20260909-1-2-A1B2)
        $orderId = 'SUB-' . now()->format('Ymd') . '-' . $user->user_id . '-' . $plan->plan_id . '-' . strtoupper(substr(uniqid(), -4));

        try {
            $customerDetails = [
                'first_name' => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone ?? '08123456789',
            ];

            $itemDetails = [
                [
                    'id'       => (string) $plan->plan_id,
                    'price'    => (int) $plan->price,
                    'quantity' => 1,
                    'name'     => 'Paket: ' . $plan->name . ' (30 Hari)',
                ],
            ];

            $charge = $midtrans->createDynamicQris(
                $orderId,
                (int) $plan->price,
                $customerDetails,
                $itemDetails
            );

            $expiresAt = !empty($charge['expires_at'])
                ? Carbon::parse($charge['expires_at'])
                : now()->addMinutes(15);

            $tx = Transaction::create([
                'order_id'         => $charge['order_id'],
                'user_id'          => $user->user_id,
                'type'             => 'SUBSCRIPTION',
                'reference_id'     => $plan->plan_id,
                'gross_amount'     => $plan->price,
                'status'           => 'PENDING',
                'payment_type'     => 'qris',
                'qr_url'           => $charge['qr_url'],
                'qr_string'        => $charge['qr_string'],
                'expires_at'       => $expiresAt,
                'payload_response' => $charge['payload_response'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'QRIS Dinamis paket langganan berhasil dibuat.',
                'data'    => [
                    'order_id'     => $tx->order_id,
                    'gross_amount' => $tx->gross_amount,
                    'status'       => $tx->status,
                    'qr_url'       => $tx->qr_url,
                    'qr_string'    => $tx->qr_string,
                    'expires_at'   => $tx->expires_at?->toIso8601String(),
                ],
            ], 201);
        } catch (Exception $e) {
            Log::error('Midtrans Subscription QRIS Charge Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat QRIS langganan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check real-time payment status (Frontend Polling)
     * GET /api/payments/{orderId}/status
     */
    public function checkStatus($orderId, MidtransService $midtrans)
    {
        $tx = Transaction::where('order_id', $orderId)->first();

        if (!$tx) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan.',
            ], 404);
        }

        // Jika status masih PENDING di database lokal, cek status langsung ke Midtrans API
        // (Sangat berguna jika di lingkungan lokal webhook belum bisa diakses tanpa public IP/ngrok)
        if ($tx->status === 'PENDING') {
            try {
                $statusRes = $midtrans->getStatus($orderId);
                $midtransStatus = $statusRes['transaction_status'] ?? null;
                $fraudStatus = $statusRes['fraud_status'] ?? null;

                if (in_array($midtransStatus, ['settlement', 'capture'])) {
                    if ($fraudStatus === 'accept' || empty($fraudStatus)) {
                        $this->handleSettlement($tx, $statusRes);
                    }
                } elseif (in_array($midtransStatus, ['deny', 'cancel', 'expire'])) {
                    $this->handleFailure($tx, $midtransStatus);
                }
            } catch (\Throwable $e) {
                // Catat log jika query status ke Midtrans bermasalah
                Log::warning("Midtrans checkStatus polling error for {$orderId}: " . $e->getMessage());
            }
        }

        $tx->refresh();

        return response()->json([
            'success' => true,
            'data'    => [
                'order_id'     => $tx->order_id,
                'type'         => $tx->type,
                'gross_amount' => $tx->gross_amount,
                'status'       => $tx->status, // PENDING, SETTLEMENT, EXPIRED, CANCELLED
                'qr_url'       => $tx->qr_url,
                'expires_at'   => $tx->expires_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Webhook Handler from Midtrans
     * POST /api/payments/webhook
     */
    public function webhook(Request $request, MidtransService $midtrans)
    {
        $payload = $request->all();
        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? null;
        $signatureKey = $payload['signature_key'] ?? null;

        if (!$orderId || !$statusCode || !$grossAmount || !$signatureKey) {
            return response()->json(['message' => 'Invalid payload format'], 400);
        }

        // Verifikasi signature key
        if (!$midtrans->verifySignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            Log::warning("Midtrans Webhook: Invalid signature for Order #{$orderId}");
            return response()->json(['message' => 'Invalid signature key'], 403);
        }

        $tx = Transaction::where('order_id', $orderId)->first();
        if (!$tx) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $transactionStatus = $payload['transaction_status'] ?? '';
        $fraudStatus = $payload['fraud_status'] ?? '';

        try {
            if ($transactionStatus === 'capture' || $transactionStatus === 'settlement') {
                if ($fraudStatus === 'accept' || empty($fraudStatus)) {
                    $this->handleSettlement($tx, $payload);
                }
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $this->handleFailure($tx, $transactionStatus);
            }

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            Log::error("Midtrans Webhook processing error for Order #{$orderId}: " . $e->getMessage(), [
                'exception' => $e,
                'payload'   => $payload,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal saat memproses webhook: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process Settlement: Update Status, Credit Owner Wallet or Activate Subscription
     */
    protected function handleSettlement(Transaction $tx, array $payload)
    {
        DB::transaction(function () use ($tx, $payload) {
            // Lock transaksi untuk mencegah race condition (duplikasi kredit saldo)
            $lockedTx = Transaction::where('transaction_id', $tx->transaction_id)
                ->lockForUpdate()
                ->first();

            if (!$lockedTx || $lockedTx->status === 'SETTLEMENT') {
                return; // Sudah diproses sebelumnya (idempotent & concurrency-safe)
            }

            $lockedTx->update([
                'status'           => 'SETTLEMENT',
                'payload_response' => $payload,
            ]);

            // KASUS 1: Booking Lapangan
            if ($lockedTx->type === 'BOOKING') {
                $booking = Booking::with('court')
                    ->where('booking_id', $lockedTx->reference_id)
                    ->lockForUpdate()
                    ->first();

                if ($booking) {
                    $booking->update(['status' => 'CONFIRMED']);

                    // Masukkan saldo ke dompet pemilik venue
                    if ($booking->court && $booking->court->owner_id) {
                        $ownerId = $booking->court->owner_id;

                        // Lock wallet row untuk mencegah race condition mutasi saldo
                        $wallet = Wallet::where('owner_id', $ownerId)
                            ->lockForUpdate()
                            ->first();

                        if (!$wallet) {
                            $wallet = Wallet::create([
                                'owner_id'       => $ownerId,
                                'balance'        => 0,
                                'locked_balance' => 0,
                            ]);
                            $wallet = Wallet::where('wallet_id', $wallet->wallet_id)->lockForUpdate()->first();
                        }

                        $balanceBefore = $wallet->balance;
                        $wallet->increment('balance', $lockedTx->gross_amount);

                        WalletMutation::create([
                            'wallet_id'      => $wallet->wallet_id,
                            'type'           => 'CREDIT',
                            'amount'         => $lockedTx->gross_amount,
                            'balance_before' => $balanceBefore,
                            'balance_after'  => $wallet->balance,
                            'description'    => "Pendapatan sewa lapangan #{$booking->booking_code}",
                            'reference_type' => 'BOOKING',
                            'reference_id'   => $booking->booking_id,
                        ]);
                    }
                }
            }

            // KASUS 2: Paket Langganan Owner
            if ($lockedTx->type === 'SUBSCRIPTION') {
                $plan = Plan::find($lockedTx->reference_id);
                if ($plan) {
                    Subscription::updateOrCreate(
                        ['user_id' => $lockedTx->user_id],
                        [
                            'plan_id'    => $plan->plan_id,
                            'start_date' => now(),
                            'end_date'   => now()->addDays(30),
                            'status'     => 'ACTIVE',
                        ]
                    );
                }
            }
        });
    }

    /**
     * Process Failure (Expire / Cancel / Deny)
     */
    protected function handleFailure(Transaction $tx, string $status)
    {
        $newStatus = ($status === 'expire') ? 'EXPIRED' : 'CANCELLED';

        DB::transaction(function () use ($tx, $newStatus) {
            $lockedTx = Transaction::where('transaction_id', $tx->transaction_id)
                ->lockForUpdate()
                ->first();

            if (!$lockedTx || $lockedTx->status !== 'PENDING') {
                return;
            }

            $lockedTx->update(['status' => $newStatus]);

            if ($lockedTx->type === 'BOOKING') {
                $booking = Booking::where('booking_id', $lockedTx->reference_id)
                    ->lockForUpdate()
                    ->first();
                if ($booking && $booking->status === 'PENDING') {
                    $booking->update(['status' => 'CANCELLED']);
                }
            }
        });
    }
}
