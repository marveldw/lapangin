<?php

namespace Tests\Unit;

use App\Services\MidtransService;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class MidtransServiceSecurityTest extends TestCase
{
    public function test_verify_signature_returns_true_for_valid_signature(): void
    {
        Config::set('services.midtrans.server_key', 'test-server-key-12345');

        $service = new MidtransService();
        $orderId = 'BKG-20260910-TEST-0001';
        $statusCode = '200';
        $grossAmount = '150000.00';
        $validSignature = hash('sha512', $orderId . $statusCode . $grossAmount . 'test-server-key-12345');

        $this->assertTrue($service->verifySignature($orderId, $statusCode, $grossAmount, $validSignature));
    }

    public function test_verify_signature_returns_false_for_tampered_signature(): void
    {
        Config::set('services.midtrans.server_key', 'test-server-key-12345');

        $service = new MidtransService();
        $orderId = 'BKG-20260910-TEST-0001';
        $statusCode = '200';
        $grossAmount = '150000.00';
        $invalidSignature = 'invalid-signature-hash';

        $this->assertFalse($service->verifySignature($orderId, $statusCode, $grossAmount, $invalidSignature));
    }

    public function test_verify_signature_rejects_empty_or_null_server_key(): void
    {
        // Even if an attacker calculates hash with empty server key, it MUST be rejected!
        Config::set('services.midtrans.server_key', '');

        $service = new MidtransService();
        $orderId = 'BKG-20260910-TEST-0001';
        $statusCode = '200';
        $grossAmount = '150000.00';
        $attackerSignature = hash('sha512', $orderId . $statusCode . $grossAmount . '');

        $this->assertFalse(
            $service->verifySignature($orderId, $statusCode, $grossAmount, $attackerSignature),
            'verifySignature must reject verification when server key is empty.'
        );
    }
}
