<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class IndonesianPhoneNumber implements ValidationRule
{
    /**
     * Indonesian mobile phone regex pattern:
     * - Prefix: +628, 628, or 08
     * - Operator identifier: [1-9] (e.g., 081, 082, 085, 087, 088, 089)
     * - Remaining digits: 7 to 10 digits
     * Enforces total mobile length range 10–13 digits (excluding the '+' sign).
     */
    public const REGEX = '/^(\+62|62|0)8[1-9][0-9]{7,10}$/';

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value) && !is_numeric($value)) {
            $fail('Nomor telepon harus berupa angka valid dengan format Indonesia (contoh: 08123456789).');
            return;
        }

        if (!preg_match(self::REGEX, (string) $value)) {
            $fail('Nomor telepon harus berupa angka valid dengan format Indonesia (contoh: 08123456789).');
        }
    }
}
