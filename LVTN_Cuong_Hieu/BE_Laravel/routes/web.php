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



// Routes cho thanh toán vé xem phim
// Thêm vào routes/web.php

Route::prefix('payment')->group(function () {
    Route::get('/ticket/{ticket}', [PaymentController::class, 'showTicketPayment'])->name('payment.form');
    Route::post('/create', [PaymentController::class, 'createPayment'])->name('payment.create');
    Route::get('/vnpay-return', [PaymentController::class, 'vnpayReturn'])->name('payment.vnpay.return');
    Route::get('/success', [PaymentController::class, 'paymentSuccess'])->name('payment.success');
    Route::get('/failed', [PaymentController::class, 'paymentFailed'])->name('payment.failed');
});