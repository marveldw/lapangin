<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Court Photo Upload Configuration
    |--------------------------------------------------------------------------
    |
    | Maximum allowed file size in kilobytes for court image uploads.
    | Default is 2048 KB (2 MB).
    |
    */
    'max_image_size_kb' => (int) env('MAX_COURT_IMAGE_SIZE_KB', 2048),

    'allowed_mimes' => [
        'image/jpeg',
        'image/png',
        'image/webp',
    ],
];
