<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

use App\Http\Controllers\PaymentController;

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\MovieController;
use App\Http\Controllers\Admin\SeatController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\ShowtimeController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\MembershipController;
use App\Http\Controllers\Admin\GiftController;
use App\Http\Controllers\Admin\GifthistoryController;
use App\Http\Controllers\Admin\ServiceOrderController;
use App\Http\Controllers\Admin\ReviewController;



//Login Admin
Route::prefix('admin')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('profile', [ProfileController::class, 'show']);
        Route::post('profile', [MovieController::class, 'update']);
        Route::post('change-password', [MovieController::class, 'changePassword']);

        //Movie
        Route::prefix('movies')->group(function () {
            Route::get('/', [MovieController::class, 'index']);
            Route::post('/', [MovieController::class, 'store']);
            Route::post('/{id}', [MovieController::class, 'update']);
            Route::delete('/{id}', [MovieController::class, 'destroy']);
            Route::get('/count', [MovieController::class, 'count']);
        });
        //Seat
        Route::prefix('seats')->group(function () {
            Route::get('/room/{room_id}', [SeatController::class, 'index']);
            Route::post('/{id}', [SeatController::class, 'update']);
            Route::get('/count/{room_id}', [SeatController::class, 'countType']);
            Route::post('/settype/{room_id}', [SeatController::class, 'setType']);
        });

        //Room
        Route::prefix('rooms')->group(function () {
            Route::get('/', [RoomController::class, 'index']);
            Route::post('/', [RoomController::class, 'store']);
            Route::post('/{id}', [RoomController::class, 'update']);
            Route::delete('/{id}', [RoomController::class, 'destroy']);
            Route::get('/search', [RoomController::class, 'search']);
            Route::get('/stats', [RoomController::class, 'statistics']);
        });

        //Showtime
        Route::prefix('showtimes')->group(function () {
            Route::get('/', [ShowtimeController::class, 'index']);
            Route::post('/', [ShowtimeController::class, 'store']);
            Route::get('/{id}', [ShowtimeController::class, 'show']);
            Route::post('/{id}', [ShowtimeController::class, 'update']);
            Route::delete('/{id}', [ShowtimeController::class, 'destroy']);
            Route::get('/statistic/count', [ShowtimeController::class, 'count']);
        });

        //Blog
        Route::prefix('blogs')->group(function () {
            Route::get('/', [BlogController::class, 'index']);
            Route::post('/', [BlogController::class, 'store']);
            Route::post('/{id}', [BlogController::class, 'update']);
            Route::delete('/{id}', [BlogController::class, 'destroy']);
            Route::get('/count', [BlogController::class, 'count']);
        });

        //Employee
        Route::prefix('employees')->group(function () {
            Route::get('/', [EmployeeController::class, 'index']);
            Route::post('/', [EmployeeController::class, 'store']);
            Route::post('/{id}', [EmployeeController::class, 'update']);
        });

        //Service
        Route::prefix('services')->group(function () {
            Route::get('/', [ServiceController::class, 'index']);
            Route::post('/', [ServiceController::class, 'store']);
            Route::post('/{id}', [ServiceController::class, 'update']);
            Route::delete('/{id}', [ServiceController::class, 'destroy']);
        });

        //Review
        Route::get('reviews', [ReviewController::class, 'index']);

        //Promotion
        Route::prefix('promotions')->group(function () {
            Route::get('/', [PromotionController::class, 'index']);
            Route::post('/', [PromotionController::class, 'store']);
            Route::delete('/{id}', [PromotionController::class, 'destroy']);
        });

        //Membership
        Route::prefix('memberships')->group(function () {
            Route::get('/', [MembershipController::class, 'index']);
            Route::post('/', [MembershipController::class, 'store']);
            Route::post('/{id}', [MembershipController::class, 'update']);
        });

        //Gift
        Route::prefix('gifts')->group(function () {
            Route::get('/', [GiftController::class, 'index']);
            Route::post('/', [GiftController::class, 'store']);
            Route::post('/{id}', [GiftController::class, 'update']);
            Route::delete('/{id}', [GiftController::class, 'destroy']);
        });

        //GiftHistory
        Route::post('gifthistory', [GifthistoryController::class, 'exchange']);

        //ServiceOrder
        Route::get('service-orders', [ServiceOrderController::class, 'index']);
    });
});


//Login Customer
Route::post('/register', [App\Http\Controllers\Customer\AuthController::class, 'register']);
Route::post('/login', [App\Http\Controllers\Customer\AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [App\Http\Controllers\Customer\AuthController::class, 'user']);
    Route::post('/logout', [App\Http\Controllers\Customer\AuthController::class, 'logout']);
});


//Movie
Route::prefix('/movies')->group(function () {
    Route::get('/', [App\Http\Controllers\Customer\MovieController::class, 'index']);
    Route::get('/{id}', [App\Http\Controllers\Customer\MovieController::class, 'show']);
    Route::get('/{id}/showtimes', [App\Http\Controllers\Customer\MovieController::class, 'showtimes']);
});

//Blog
Route::prefix('/blogs')->group(function () {
    Route::get('/', [App\Http\Controllers\Customer\BlogController::class, 'index']);
    Route::get('/{id}', [App\Http\Controllers\Customer\BlogController::class, 'show']);
});

//Profile
Route::prefix('/profile')->group(function () {
    Route::get('/', [App\Http\Controllers\Customer\ProfileController::class, 'show']);
    Route::post('/', [App\Http\Controllers\Customer\ProfileController::class, 'update']);
    Route::post('/change-password', [App\Http\Controllers\Customer\ProfileController::class, 'changePassword']);
});

//Showtime
Route::prefix('showtimes')->group(function () {
    Route::get('', [App\Http\Controllers\Customer\ShowtimeController::class, 'index']);
    Route::get('/{id}', [App\Http\Controllers\Customer\ShowtimeController::class, 'show']);

});



//Thanh toán ví điện tử
Route::get('/payment/return', [PaymentController::class, 'handleReturn']);
Route::post('/payment/notify', [PaymentController::class, 'handleNotify']);

Route::get('/payment/success', fn(Request $r) => 'Thanh toán thành công, Order: ' . $r->get('orderId'));
Route::get('/payment/failure', fn(Request $r) => 'Thanh toán thất bại hoặc bị huỷ');