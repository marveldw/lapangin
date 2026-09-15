<?php

return [
    /*
    |-------------------------------------------------------------------------
    | Subscription Plans Configuration & Limits
    |-------------------------------------------------------------------------
    |
    | Centralized source of truth for plan tiers and court creation quotas.
    | max_courts: null indicates unlimited courts.
    |
    */
    'plans' => [
        'FREE' => [
            'name'                   => 'FREE',
            'description'            => 'Paket Percobaan',
            'price'                  => 0,
            'max_courts'             => 1,
            'max_bookings_per_month' => 30,
            'is_active'              => true,
        ],
        'BASIC' => [
            'name'                   => 'BASIC',
            'description'            => 'Paket Standar',
            'price'                  => 49000,
            'max_courts'             => 5,
            'max_bookings_per_month' => null,
            'is_active'              => true,
        ],
        'PRO' => [
            'name'                   => 'PRO',
            'description'            => 'Paket Komplit',
            'price'                  => 99000,
            'max_courts'             => null, // Unlimited
            'max_bookings_per_month' => null, // Unlimited
            'is_active'              => true,
        ],
    ],

    'default_plan' => 'FREE',
];