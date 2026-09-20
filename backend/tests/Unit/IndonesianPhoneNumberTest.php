<?php

namespace Tests\Unit;

use App\Rules\IndonesianPhoneNumber;
use Tests\TestCase;

class IndonesianPhoneNumberTest extends TestCase
{
    private function passes(mixed $phone): bool
    {
        $rule = new IndonesianPhoneNumber();
        $failed = false;

        $rule->validate('phone', $phone, function () use (&$failed) {
            $failed = true;
        });

        return !$failed;
    }

    public function test_accepts_valid_local_format_08(): void
    {
        $this->assertTrue($this->passes('0812345678')); // 10 digits
        $this->assertTrue($this->passes('08123456789')); // 11 digits
        $this->assertTrue($this->passes('081234567890')); // 12 digits
        $this->assertTrue($this->passes('0812345678901')); // 13 digits
        $this->assertTrue($this->passes('085712345678')); // Indosat
        $this->assertTrue($this->passes('087812345678')); // XL
        $this->assertTrue($this->passes('089612345678')); // Tri
        $this->assertTrue($this->passes('088812345678')); // Smartfren
    }

    public function test_accepts_valid_international_format_with_plus(): void
    {
        $this->assertTrue($this->passes('+62812345678'));
        $this->assertTrue($this->passes('+628123456789'));
        $this->assertTrue($this->passes('+6281234567890'));
        $this->assertTrue($this->passes('+62812345678901'));
    }

    public function test_accepts_valid_international_format_without_plus(): void
    {
        $this->assertTrue($this->passes('62812345678'));
        $this->assertTrue($this->passes('628123456789'));
        $this->assertTrue($this->passes('6281234567890'));
        $this->assertTrue($this->passes('62812345678901'));
    }

    public function test_rejects_numbers_with_letters(): void
    {
        $this->assertFalse($this->passes('0812345abcde'));
        $this->assertFalse($this->passes('0812abc45678'));
        $this->assertFalse($this->passes('+62812345phone'));
    }

    public function test_rejects_numbers_with_spaces_or_symbols(): void
    {
        $this->assertFalse($this->passes('0812 3456 7890'));
        $this->assertFalse($this->passes('0812-3456-7890'));
        $this->assertFalse($this->passes('(0812)3456789'));
        $this->assertFalse($this->passes('+62 812 3456 789'));
    }

    public function test_rejects_too_short_numbers(): void
    {
        $this->assertFalse($this->passes('0812345')); // 7 digits
        $this->assertFalse($this->passes('08123456')); // 8 digits
        $this->assertFalse($this->passes('081234567')); // 9 digits
    }

    public function test_rejects_too_long_numbers(): void
    {
        $this->assertFalse($this->passes('08123456789012')); // 14 digits
        $this->assertFalse($this->passes('081234567890123')); // 15 digits
    }

    public function test_rejects_invalid_operator_prefixes(): void
    {
        $this->assertFalse($this->passes('08012345678')); // 080 is not a valid Indonesian mobile operator
        $this->assertFalse($this->passes('07123456789')); // Does not start with 08
        $this->assertFalse($this->passes('02123456789')); // Jakarta landline, not mobile
    }
}
