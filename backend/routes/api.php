<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CourtController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PublicCourtController;
use App\Http\Controllers\Api\WalletController;

// ==========================================
// PUBLIC ROUTES (Dapat diakses tanpa login)
// ==========================================
Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:register');

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:login');

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetToken'])
    ->middleware('throttle:10,1');

Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])
    ->middleware('throttle:10,1');

Route::get('/plans', [PlanController::class, 'index'])
    ->middleware('throttle:60,1');

// Public — Marketplace Browsing & Cek Jadwal (Tanpa Login, Rate Limit 60/menit)
Route::prefix('public')->middleware('throttle:120,1')->group(function () {
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
// PAYMENT WEBHOOK & POLLING STATUS (PUBLIC)
// ==========================================
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);
Route::get('/payments/{orderId}/status', [PaymentController::class, 'checkStatus']);

// ==========================================
// PROTECTED ROUTES (Wajib Login via Sanctum)
// ==========================================
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    // Auth & Profil (Semua Role)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::put('/profile', [ProfileController::class, 'updateProfile']);

    // Bookings (Pelanggan booking & riwayat; Owner pantau & kelola status)
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show'])->whereNumber('id');
    Route::put('/bookings/{id}', [BookingController::class, 'update'])->whereNumber('id');

    // Payments via Dynamic QRIS (Customer Booking & Owner Subscription)
    Route::post('/bookings/{id}/pay', [PaymentController::class, 'payBooking'])->whereNumber('id');
    Route::post('/subscriptions/{planId}/pay', [PaymentController::class, 'paySubscription'])->whereNumber('planId');

    // ==========================================
    // OWNER & ADMIN ONLY ROUTES
    // ==========================================
    Route::middleware('role:OWNER,ADMIN')->group(function () {
        // Courts Management (Owner)
        Route::get('/courts', [CourtController::class, 'index']);
        Route::post('/courts', [CourtController::class, 'store']);
        Route::post('/courts/upload-image', [CourtController::class, 'uploadImage']);
        Route::get('/courts/{id}', [CourtController::class, 'show'])->whereNumber('id');
        Route::put('/courts/{id}', [CourtController::class, 'update'])->whereNumber('id');
        Route::delete('/courts/{id}', [CourtController::class, 'destroy'])->whereNumber('id');

        // Aliases for /owner/courts (to support both conventions)
        Route::get('/owner/courts', [CourtController::class, 'index']);
        Route::post('/owner/courts', [CourtController::class, 'store']);
        Route::post('/owner/courts/upload-image', [CourtController::class, 'uploadImage']);
        Route::get('/owner/courts/{id}', [CourtController::class, 'show'])->whereNumber('id');
        Route::put('/owner/courts/{id}', [CourtController::class, 'update'])->whereNumber('id');
        Route::delete('/owner/courts/{id}', [CourtController::class, 'destroy'])->whereNumber('id');
        Route::post('/upload/image', [CourtController::class, 'uploadImage']);

        // Customers Management (Owner)
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::post('/customers', [CustomerController::class, 'store']);
        Route::get('/customers/{id}', [CustomerController::class, 'show'])->whereNumber('id');
        Route::put('/customers/{id}', [CustomerController::class, 'update'])->whereNumber('id');

        // Dashboard Analytics (Owner)
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Wallet & Withdrawal (Owner)
        Route::get('/owner/wallet', [WalletController::class, 'getWallet']);
        Route::post('/owner/withdraw', [WalletController::class, 'requestWithdraw']);
        Route::put('/owner/payout-account', [ProfileController::class, 'updatePayoutAccount']);
    });
});
