<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\CoreApi;
use Midtrans\Transaction;

class MidtransService
{
    public function __construct()
    {
        $this->initConfiguration();
    }

    /**
     * Set up default configuration for Midtrans
     */
    protected function initConfiguration(): void
    {
        $serverKey = config('services.midtrans.server_key');
        $clientKey = config('services.midtrans.client_key');

        Config::$serverKey = is_string($serverKey) ? trim($serverKey) : $serverKey;
        Config::$clientKey = is_string($clientKey) ? trim($clientKey) : $clientKey;
        Config::$isProduction = (bool) config('services.midtrans.is_production', false);
        Config::$isSanitized = (bool) config('services.midtrans.is_sanitized', true);
        Config::$is3ds = (bool) config('services.midtrans.is_3ds', true);
    }

    /**
     * Create Dynamic QRIS charge using Midtrans Core API
     *
     * @param string $orderId
     * @param int $grossAmount
     * @param array $customerDetails ['first_name', 'email', 'phone']
     * @param array $itemDetails
     * @return array
     * @throws Exception
     */
    public function createDynamicQris(
        string $orderId,
        int $grossAmount,
        array $customerDetails,
        array $itemDetails = []
    ): array {
        $this->initConfiguration();

        $acquirer = config('services.midtrans.acquirer', 'gopay');

        $params = [
            'payment_type' => 'qris',
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'custom_expiry' => [
                'expiry_duration' => 15,
                'unit'            => 'minute',
            ],
            'customer_details' => [
                'first_name' => $customerDetails['first_name'] ?? 'Pelanggan',
                'email'      => $customerDetails['email'] ?? 'customer@lapangin.id',
                'phone'      => $customerDetails['phone'] ?? '08123456789',
            ],
        ];

        if (!empty($acquirer)) {
            $params['qris'] = [
                'acquirer' => $acquirer,
            ];
        }

        if (!empty($itemDetails)) {
            $params['item_details'] = $itemDetails;
        }

        if (config('services.midtrans.debug_log', false)) {
            Log::info("Midtrans Dynamic QRIS Charge Request [Order: {$orderId}]:", [
                'environment' => Config::$isProduction ? 'PRODUCTION' : 'SANDBOX',
                'params'      => $params,
            ]);
        }

        try {
            $response = CoreApi::charge($params);
        } catch (Exception $e) {
            if (config('services.midtrans.debug_log', false)) {
                Log::warning("Midtrans Dynamic QRIS Charge Initial Attempt Failed [Order: {$orderId}]: " . $e->getMessage());
            }

            // Jika acquirer tertentu gagal (misal 402 Payment channel is not activated), coba otomatis tanpa parameter acquirer
            if (str_contains($e->getMessage(), '402') || str_contains($e->getMessage(), 'not activated')) {
                unset($params['qris']);
                $response = CoreApi::charge($params);
            } else {
                throw $e;
            }
        }

        // Convert object to array for easy handling if needed
        $resArray = json_decode(json_encode($response), true);

        if (config('services.midtrans.debug_log', false)) {
            Log::info("Midtrans Dynamic QRIS Charge Raw Response [Order: {$orderId}]:", [
                'response' => $resArray,
            ]);
        }

        // Extract QR Code URL from actions (prioritize raw PNG image 'generate-qr-code')
        $qrUrl = $resArray['qr_url'] ?? null;
        if (!$qrUrl && !empty($resArray['actions']) && is_array($resArray['actions'])) {
            foreach ($resArray['actions'] as $action) {
                $actionName = strtolower($action['name'] ?? '');
                if (str_contains($actionName, 'generate-qr-code') || str_contains($actionName, 'qr')) {
                    $qrUrl = $action['url'] ?? null;
                    if ($qrUrl) break;
                }
            }
            if (!$qrUrl && count($resArray['actions']) > 0) {
                $qrUrl = $resArray['actions'][0]['url'] ?? null;
            }
        }

        $qrString = $resArray['qr_string'] ?? $resArray['qr_code'] ?? null;
        if (!$qrUrl && !empty($qrString)) {
            $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($qrString);
        }

        return [
            'order_id'         => $resArray['order_id'] ?? $orderId,
            'transaction_id'   => $resArray['transaction_id'] ?? null,
            'gross_amount'     => (int) ($resArray['gross_amount'] ?? $grossAmount),
            'status'           => strtoupper($resArray['transaction_status'] ?? 'PENDING'),
            'qr_url'           => $qrUrl,
            'qr_string'        => $qrString,
            'expires_at'       => $resArray['expiry_time'] ?? null,
            'payload_response' => $resArray,
        ];
    }

    /**
     * Check transaction status on Midtrans
     */
    public function getStatus(string $orderId): array
    {
        $this->initConfiguration();
        $response = Transaction::status($orderId);
        return json_decode(json_encode($response), true);
    }

    /**
     * Verify Midtrans notification signature key
     */
    public function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        $serverKey = config('services.midtrans.server_key');

        if (empty($serverKey) || !is_string($serverKey)) {
            Log::critical('Midtrans server key is not configured or empty. Signature verification rejected.');
            return false;
        }

        $serverKey = trim($serverKey);
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        return hash_equals($expectedSignature, $signatureKey);
    }
}


