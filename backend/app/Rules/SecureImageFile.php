<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

class SecureImageFile implements ValidationRule
{
    protected int $maxSizeKb;
    protected string $type;

    public function __construct(string $type = 'court')
    {
        $this->type = $type;
        $this->maxSizeKb = match ($type) {
            'logo'          => (int) config('upload.max_logo_size_kb', 1024),
            'profile_photo' => (int) config('upload.max_profile_photo_size_kb', 1024),
            default         => (int) config('upload.max_court_image_size_kb', 2048),
        };
    }

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$value instanceof UploadedFile) {
            $fail("Kolom {$attribute} harus berupa berkas unggahan yang valid.");
            return;
        }

        if (!$value->isValid()) {
            $fail('File upload gagal atau berkas korup.');
            return;
        }

        // 1. Enforce max file size
        $fileSizeKb = (int) ceil($value->getSize() / 1024);
        if ($fileSizeKb > $this->maxSizeKb) {
            $maxMb = round($this->maxSizeKb / 1024, 1);
            $fail("Ukuran gambar maksimal {$maxMb}MB ({$this->maxSizeKb} KB).");
            return;
        }

        $originalName = strtolower($value->getClientOriginalName());

        // 2. Anti null-byte injection & path traversal
        if (str_contains($originalName, "\0") || str_contains($originalName, '..')) {
            $fail('Nama file tidak valid (terdeteksi karakter berbahaya).');
            return;
        }

        // 3. Block double extensions & disguised executables
        $dangerousExtensions = [
            'php', 'php3', 'php4', 'php5', 'phtml', 'phar',
            'exe', 'sh', 'bash', 'bat', 'cmd', 'js', 'py', 'pl', 'cgi',
            'asp', 'aspx', 'jsp', 'jar', 'vbs', 'scr', 'html', 'htm', 'svg'
        ];

        $parts = explode('.', $originalName);
        if (count($parts) > 1) {
            $ext = end($parts);
            $allowedExtensions = config('upload.allowed_image_extensions', ['jpg', 'jpeg', 'png', 'webp']);
            if (!in_array($ext, $allowedExtensions, true)) {
                $fail('Format ekstensi file tidak didukung. Gunakan format JPG, PNG, atau WEBP.');
                return;
            }

            // Check any inner extensions (e.g. payload.php.jpg)
            for ($i = 1; $i < count($parts) - 1; $i++) {
                if (in_array($parts[$i], $dangerousExtensions, true)) {
                    $fail('File mengandung ekstensi ganda yang mencurigakan atau berbahaya.');
                    return;
                }
            }
        }

        $realPath = $value->getRealPath();
        if (!$realPath || !file_exists($realPath)) {
            $fail('Berkas fisik sementara tidak dapat diakses di server.');
            return;
        }

        // 4. Inspect real binary MIME type via finfo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $realPath);
        finfo_close($finfo);

        $allowedMimes = config('upload.allowed_image_mimes', ['image/jpeg', 'image/png', 'image/webp']);
        if (!in_array($mime, $allowedMimes, true)) {
            $fail('Konten file bukan merupakan gambar yang valid (MIME tidak sesuai).');
            return;
        }

        // 5. Genuine image raster inspection via getimagesize
        $imageInfo = @getimagesize($realPath);
        if ($imageInfo === false || empty($imageInfo[0]) || empty($imageInfo[1])) {
            $fail('File yang diunggah bukan gambar asli yang valid.');
            return;
        }

        $validImageTypes = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP];
        if (!in_array($imageInfo[2], $validImageTypes, true)) {
            $fail('Tipe raster gambar tidak didukung.');
            return;
        }

        // 6. Sniff file header/payload for executable magic bytes or script tags
        $header = @file_get_contents($realPath, false, null, 0, 4096);
        if ($header !== false) {
            // Executable binaries magic bytes
            if (str_starts_with($header, 'MZ') || str_starts_with($header, "\x7fELF")) {
                $fail('File terdeteksi sebagai berkas biner/program eksekusi.');
                return;
            }

            // Script tags or embedded PHP
            if (
                stripos($header, '<?php') !== false ||
                stripos($header, '<?=') !== false ||
                stripos($header, '<script') !== false ||
                stripos($header, '#!/bin/') !== false
            ) {
                $fail('File terdeteksi mengandung skrip kode terlarang.');
                return;
            }
        }
    }
}
