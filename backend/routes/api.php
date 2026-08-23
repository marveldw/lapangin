<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CourtController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\PublicCourtController;

// ==========================================
// PUBLIC ROUTES (Dapat diakses tanpa login)
// ==========================================
Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:register');

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:login');

Route::get('/plans', [PlanController::class, 'index']);

// Public — Marketplace Browsing & Cek Jadwal (Tanpa Login)
Route::prefix('public')->group(function () {
    // Browse semua lapangan (filter: city, district, sport_type, search)
    Route::get('/courts', [PublicCourtController::class, 'index']);
    Route::get('/courts/{id}', [PublicCourtController::class, 'show'])->whereNumber('id');

    // Helper dropdown data untuk filter lokasi & olahraga
    Route::get('/cities', [PublicCourtController::class, 'cities']);
    Route::get('/cities/{city}/districts', [PublicCourtController::class, 'districts']);
    Route::get('/sport-types', [PublicCourtController::class, 'sportTypes']);

    // Cek ketersediaan slot jam lapangan pada tanggal tertentu
    Route::get('/courts/{id}/slots', [BookingController::class, 'publicSlots'])->whereNumber('id');
});

// ==========================================
// PROTECTED ROUTES (Wajib Login via Sanctum)
// ==========================================
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    // Auth & Profil
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Bookings (Pelanggan booking & riwayat; Owner pantau & kelola status)
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show'])->whereNumber('id');
    Route::put('/bookings/{id}', [BookingController::class, 'update'])->whereNumber('id');

    // Courts Management (Owner)
    Route::get('/courts', [CourtController::class, 'index']);
    Route::post('/courts', [CourtController::class, 'store']);
    Route::get('/courts/{id}', [CourtController::class, 'show'])->whereNumber('id');
    Route::put('/courts/{id}', [CourtController::class, 'update'])->whereNumber('id');
    Route::delete('/courts/{id}', [CourtController::class, 'destroy'])->whereNumber('id');

    // Customers Management (Owner)
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::get('/customers/{id}', [CustomerController::class, 'show'])->whereNumber('id');
    Route::put('/customers/{id}', [CustomerController::class, 'update'])->whereNumber('id');

    // Dashboard Analytics (Owner)
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
