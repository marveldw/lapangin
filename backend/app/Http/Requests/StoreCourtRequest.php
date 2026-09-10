<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maxSizeKb = (int) config('court.max_image_size_kb', env('MAX_COURT_IMAGE_SIZE_KB', 2048));

        return [
            'name'           => ['required', 'string', 'max:255'],
            'sport_type'     => ['required', 'string', 'max:255'],
            'description'    => ['nullable', 'string', 'max:2000'],
            'price_per_hour' => ['required', 'integer', 'min:1'],
            'address'        => ['required', 'string', 'max:255'],
            'city'           => ['required', 'string', 'max:100'],
            'district'       => ['nullable', 'string', 'max:100'],
            'open_time'      => ['nullable', 'date_format:H:i'],
            'close_time'     => ['nullable', 'date_format:H:i'],
            'image'          => [
                'nullable',
                'file',
                'image',
                'mimes:jpeg,png,jpg,webp',
                "max:{$maxSizeKb}",
            ],
            'image_url'      => ['nullable', 'string', 'max:5000000'],
            'status'         => ['nullable', 'in:ACTIVE,INACTIVE'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->hasFile('image')) {
                $file = $this->file('image');

                if (!$file->isValid()) {
                    $validator->errors()->add('image', 'File upload gagal atau korup.');
                    return;
                }

                $originalName = strtolower($file->getClientOriginalName());

                // 1. Anti null-byte injection & path traversal
                if (str_contains($originalName, "\0") || str_contains($originalName, '..')) {
                    $validator->errors()->add('image', 'Nama file tidak valid (terdeteksi karakter berbahaya).');
                    return;
                }

                // 2. Block disguised executable/script extensions
                $dangerousExtensions = [
                    'php', 'php3', 'php4', 'php5', 'phtml', 'phar',
                    'exe', 'sh', 'bash', 'bat', 'cmd', 'js', 'py', 'pl', 'cgi',
                    'asp', 'aspx', 'jsp', 'jar', 'vbs', 'scr', 'html', 'htm', 'svg'
                ];

                $extensionsInName = explode('.', $originalName);
                array_shift($extensionsInName);
                foreach ($extensionsInName as $ext) {
                    if (in_array($ext, $dangerousExtensions, true)) {
                        $validator->errors()->add('image', 'File mengandung ekstensi berbahaya yang dilarang.');
                        return;
                    }
                }

                // 3. Inspect real MIME type from binary content using finfo
                $realPath = $file->getRealPath();
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mime = finfo_file($finfo, $realPath);
                finfo_close($finfo);

                $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!in_array($mime, $allowedMimes, true)) {
                    $validator->errors()->add('image', 'Konten file bukan merupakan gambar yang valid (MIME tidak sesuai).');
                    return;
                }

                // 4. Genuine image inspection via getimagesize()
                $imageInfo = @getimagesize($realPath);
                if ($imageInfo === false || empty($imageInfo[0]) || empty($imageInfo[1])) {
                    $validator->errors()->add('image', 'File yang diunggah bukan gambar asli yang valid.');
                    return;
                }

                // 5. Check for embedded PHP / script tags inside header/payload
                $contents = @file_get_contents($realPath, false, null, 0, 4096);
                if ($contents && (
                    stripos($contents, '<?php') !== false ||
                    stripos($contents, '<?=') !== false ||
                    stripos($contents, '<script') !== false
                )) {
                    $validator->errors()->add('image', 'File terdeteksi mengandung skrip kode terlarang.');
                    return;
                }
            }
        });
    }

    public function messages(): array
    {
        $maxMb = round((int) config('court.max_image_size_kb', env('MAX_COURT_IMAGE_SIZE_KB', 2048)) / 1024, 1);

        return [
            'name.required'           => 'Nama lapangan wajib diisi.',
            'sport_type.required'     => 'Jenis olahraga wajib diisi.',
            'price_per_hour.required' => 'Harga sewa per jam wajib diisi.',
            'price_per_hour.min'      => 'Harga sewa minimal Rp 1.',
            'address.required'        => 'Alamat lapangan wajib diisi.',
            'city.required'           => 'Kota wajib diisi.',
            'open_time.date_format'   => 'Format jam buka harus HH:mm (contoh: 08:00).',
            'close_time.date_format'  => 'Format jam tutup harus HH:mm (contoh: 22:00).',
            'image.image'             => 'File harus berupa gambar.',
            'image.mimes'             => 'Format gambar yang diperbolehkan hanya JPEG, PNG, dan WebP.',
            'image.max'               => "Ukuran gambar maksimal {$maxMb} MB.",
        ];
    }
}
