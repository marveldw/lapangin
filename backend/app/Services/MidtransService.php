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
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$clientKey = config('services.midtrans.client_key');
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

        $params = [
            'payment_type' => 'qris',
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'qris' => [
                'acquirer' => config('services.midtrans.acquirer', 'airpay shopee'),
            ],
            'customer_details' => [
                'first_name' => $customerDetails['first_name'] ?? 'Pelanggan',
                'email'      => $customerDetails['email'] ?? 'customer@lapangin.id',
                'phone'      => $customerDetails['phone'] ?? '08123456789',
            ],
        ];

        if (!empty($itemDetails)) {
            $params['item_details'] = $itemDetails;
        }

        $response = CoreApi::charge($params);

        // Convert object to array for easy handling if needed
        $resArray = json_decode(json_encode($response), true);

        // Extract QR Code URL from actions
        $qrUrl = null;
        if (!empty($resArray['actions']) && is_array($resArray['actions'])) {
            foreach ($resArray['actions'] as $action) {
                if (($action['name'] ?? '') === 'generate-qr-code') {
                    $qrUrl = $action['url'] ?? null;
                    break;
                }
            }
        }

        return [
            'order_id'         => $resArray['order_id'] ?? $orderId,
            'transaction_id'   => $resArray['transaction_id'] ?? null,
            'gross_amount'     => (int) ($resArray['gross_amount'] ?? $grossAmount),
            'status'           => strtoupper($resArray['transaction_status'] ?? 'PENDING'),
            'qr_url'           => $qrUrl,
            'qr_string'        => $resArray['qr_string'] ?? null,
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

        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        return hash_equals($expectedSignature, $signatureKey);
    }
}
