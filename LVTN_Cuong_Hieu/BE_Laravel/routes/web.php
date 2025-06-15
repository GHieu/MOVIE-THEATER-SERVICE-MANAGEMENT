<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\MoMoController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::post('/payment/momo', [PaymentController::class, 'createPayment'])->name('payment.momo');
Route::get('/payment', fn() => view('payment'));



Route::post('/momo/payment', [MoMoController::class, 'createPayment'])->name('momo.payment');
Route::get('/momo/callback', [MoMoController::class, 'callback'])->name('momo.callback');
Route::post('/momo/ipn', [MoMoController::class, 'ipn'])->name('momo.ipn');