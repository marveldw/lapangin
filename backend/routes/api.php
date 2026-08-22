<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CourtController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

        // Courts
    Route::get('/courts', [CourtController::class, 'index']);
    Route::post('/courts', [CourtController::class, 'store']);
    Route::get('/courts/{id}', [CourtController::class, 'show']);
    Route::put('/courts/{id}', [CourtController::class, 'update']);
    Route::delete('/courts/{id}', [CourtController::class, 'destroy']);
});

