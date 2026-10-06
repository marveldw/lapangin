<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    | Hardened production & local development CORS configuration for Lapangin.
    | Supports ports 3000 (Next.js default), 3001, 8088, 5173.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Explicitly allowed REST methods (No wildcards)
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Dynamic origin resolution supporting dev ports (3000, 3001, 8088, 5173) & production env
    'allowed_origins' => array_values(array_unique(array_filter(
        explode(',', env(
            'CORS_ALLOWED_ORIGINS',
            'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:8088,http://127.0.0.1:8088,http://localhost:5173,http://127.0.0.1:5173,' . env('FRONTEND_URL', '')
        ))
    ))),

    'allowed_origins_patterns' => [],

    // Allowed request headers (including Next.js & dev proxy headers)
    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'Accept',
        'X-XSRF-TOKEN',
        'Origin',
        'ngrok-skip-browser-warning',
    ],

    'exposed_headers' => [],

    // Preflight cache max age (24 hours)
    'max_age' => 86400,

    'supports_credentials' => true,

];
