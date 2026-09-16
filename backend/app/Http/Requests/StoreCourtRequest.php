<?php

namespace App\Http\Requests;

use App\Rules\SecureImageFile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $allowedSports = array_keys(config('sports.types', []));

        return [
            'name'           => ['required', 'string', 'max:255'],
            'sport_type'     => ['required', 'string', 'max:50', Rule::in($allowedSports)],
            'description'    => ['nullable', 'string', 'max:2000'],
            'price_per_hour' => ['required', 'integer', 'min:1'],
            'address'        => ['required', 'string', 'max:255'],
            'city'           => ['required', 'string', 'max:100'],
            'district'       => ['nullable', 'string', 'max:100'],
            'open_time'      => ['nullable', 'date_format:H:i'],
            'close_time'     => ['nullable', 'date_format:H:i'],
            'image'          => [
                'nullable',
                new SecureImageFile('court'),
            ],
            'image_url'      => ['nullable', 'string', 'max:10000000'],
            'status'         => ['nullable', 'in:ACTIVE,INACTIVE'],
        ];
    }

    public function messages(): array
    {
        $maxSizeKb = (int) config('upload.max_court_image_size_kb', 2048);
        $maxMb = round($maxSizeKb / 1024, 1);

        return [
            'name.required'           => 'Nama lapangan wajib diisi.',
            'sport_type.required'     => 'Jenis olahraga wajib diisi.',
            'sport_type.in'           => 'Jenis olahraga yang dipilih tidak terdaftar di sistem.',
            'price_per_hour.required' => 'Harga sewa per jam wajib diisi.',
            'price_per_hour.min'      => 'Harga sewa minimal Rp 1.',
            'address.required'        => 'Alamat lapangan wajib diisi.',
            'city.required'           => 'Kota wajib diisi.',
            'open_time.date_format'   => 'Format jam buka harus HH:mm (contoh: 08:00).',
            'close_time.date_format'  => 'Format jam tutup harus HH:mm (contoh: 22:00).',
            'image.max'               => "Ukuran gambar maksimal {$maxMb}MB ({$maxSizeKb} KB).",
        ];
    }
}
