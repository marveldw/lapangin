<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Master Sport Types Configuration
    |--------------------------------------------------------------------------
    |
    | Central source of truth for all bookable sport and court categories
    | supported across the Lapangin platform.
    |
    */

    'types' => [
        'Badminton' => [
            'label'          => 'Bulutangkis / Badminton',
            'slug'           => 'badminton',
            'icon'           => 'sports_tennis',
            'price_min'      => 30000,
            'price_max'      => 100000,
            'fallback_image' => 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
        ],
        'Futsal' => [
            'label'          => 'Futsal',
            'slug'           => 'futsal',
            'icon'           => 'sports_soccer',
            'price_min'      => 80000,
            'price_max'      => 200000,
            'fallback_image' => 'https://images.unsplash.com/photo-1529900240051-06c3960f703f?auto=format&fit=crop&w=800&q=80',
        ],
        'Basket' => [
            'label'          => 'Bola Basket',
            'slug'           => 'basket',
            'icon'           => 'sports_basketball',
            'price_min'      => 120000,
            'price_max'      => 220000,
            'fallback_image' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
        ],
        'Tenis' => [
            'label'          => 'Tenis Lapangan',
            'slug'           => 'tenis',
            'icon'           => 'sports_tennis',
            'price_min'      => 80000,
            'price_max'      => 180000,
            'fallback_image' => 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
        ],
        'Mini Soccer' => [
            'label'          => 'Mini Soccer',
            'slug'           => 'mini-soccer',
            'icon'           => 'sports_soccer',
            'price_min'      => 250000,
            'price_max'      => 450000,
            'fallback_image' => 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        ],
        'Sepak Bola' => [
            'label'          => 'Sepak Bola',
            'slug'           => 'sepak-bola',
            'icon'           => 'sports_soccer',
            'price_min'      => 400000,
            'price_max'      => 900000,
            'fallback_image' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
        ],
        'Voli' => [
            'label'          => 'Bola Voli',
            'slug'           => 'voli',
            'icon'           => 'sports_volleyball',
            'price_min'      => 60000,
            'price_max'      => 120000,
            'fallback_image' => 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
        ],
        'Tenis Meja' => [
            'label'          => 'Tenis Meja / Pingpong',
            'slug'           => 'tenis-meja',
            'icon'           => 'sports_baseball',
            'price_min'      => 25000,
            'price_max'      => 60000,
            'fallback_image' => 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80',
        ],
        'Padel' => [
            'label'          => 'Padel',
            'slug'           => 'padel',
            'icon'           => 'sports_tennis',
            'price_min'      => 150000,
            'price_max'      => 300000,
            'fallback_image' => 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
        ],
        'Golf' => [
            'label'          => 'Golf (Driving Range)',
            'slug'           => 'golf',
            'icon'           => 'sports_golf',
            'price_min'      => 100000,
            'price_max'      => 350000,
            'fallback_image' => 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
        ],
        'Panjat Tebing' => [
            'label'          => 'Panjat Tebing (Climbing Wall)',
            'slug'           => 'panjat-tebing',
            'icon'           => 'terrain',
            'price_min'      => 50000,
            'price_max'      => 150000,
            'fallback_image' => 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80',
        ],
    ],
];
