<?php

return [
    /*
    |--------------------------------------------------------------------------
    | File Upload Configuration Limits
    |--------------------------------------------------------------------------
    |
    | Centralized limits (in kilobytes) for all file upload endpoints across
    | Lapangin platform. Configurable via environment variables.
    |
    */

    'max_court_image_size_kb' => (int) env('MAX_COURT_IMAGE_SIZE_KB', 2048), // 2 MB default

    'max_logo_size_kb' => (int) env('MAX_LOGO_SIZE_KB', 1024), // 1 MB default

    'max_profile_photo_size_kb' => (int) env('MAX_PROFILE_PHOTO_SIZE_KB', 1024), // 1 MB default

    'allowed_image_mimes' => [
        'image/jpeg',
        'image/png',
        'image/webp',
    ],

    'allowed_image_extensions' => [
        'jpg',
        'jpeg',
        'png',
        'webp',
    ],
];
