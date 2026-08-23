<?php

use Illuminate\Support\Facades\Route;

// 1. Landing Page
Route::get('/', function () {
    return view('welcome');
});

// 2. Unified Login Route
Route::get('/login', function () {
    if (auth()->check()) {
        $user = auth()->user();
        if ($user->role === 'ADMIN') {
            return redirect('/admin');
        }
        if ($user->role === 'OWNER') {
            return redirect('/owner');
        }
    }

    return redirect('/owner/login');
})->name('login');

// 3. Unified Register Route (Mitra / Owner Registration)
Route::get('/register', function () {
    if (auth()->check()) {
        $user = auth()->user();
        if ($user->role === 'ADMIN') {
            return redirect('/admin');
        }
        if ($user->role === 'OWNER') {
            return redirect('/owner');
        }
    }

    return redirect('/owner/register');
})->name('register');
