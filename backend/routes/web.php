<?php

use Illuminate\Support\Facades\Route;

// 1. Root redirect directly to Super Admin Panel
Route::get('/', function () {
    return redirect('/admin');
});

// 2. Super Admin Login Route
Route::get('/login', function () {
    return redirect('/admin/login');
})->name('login');

// 3. Logout Route
Route::match(['get', 'post'], '/logout', function () {
    auth()->guard('web')->logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();

    return redirect('/admin/login');
})->name('logout');

