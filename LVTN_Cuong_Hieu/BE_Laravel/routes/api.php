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
use App\Http\Controllers\Admin\HistoryTicketController;




//Login Admin
Route::prefix('admin')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('profile', [ProfileController::class, 'show']);
        Route::post('profile', [ProfileController::class, 'update']);
        Route::post('change-password', [ProfileController::class, 'changePassword']);
        Route::get('change-password', [ProfileController::class, 'changePasswordGet']);


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
        Route::get('/gift-history', [GiftHistoryController::class, 'index']);

        //ServiceOrder
        Route::get('service-orders', [ServiceOrderController::class, 'index']);

        //Ticket
        Route::get('/tickets/history', [HistoryTicketController::class, 'all']);
        Route::get('/ticket/{id}', [HistoryTicketController::class, 'show']);
        Route::get('/tickets/filter', [HistoryTicketController::class, 'filter']);
    });
});


//Login Customer
Route::post('/register', [App\Http\Controllers\Customer\AuthController::class, 'register']);
Route::post('/login', [App\Http\Controllers\Customer\AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [App\Http\Controllers\Customer\AuthController::class, 'user']);
    Route::post('/logout', [App\Http\Controllers\Customer\AuthController::class, 'logout']);

    //Profile
    Route::prefix('/profile')->group(function () {
        Route::get('/', [App\Http\Controllers\Customer\ProfileController::class, 'show']);
        Route::post('/', [App\Http\Controllers\Customer\ProfileController::class, 'update']);
        Route::post('/change-password', [App\Http\Controllers\Customer\ProfileController::class, 'changePassword']);
        Route::get('/change-password', [App\Http\Controllers\Customer\ProfileController::class, 'changePasswordGet']);
    });
    //Room
    Route::get('rooms', [App\Http\Controllers\Customer\RoomController::class, 'getAllRooms']);
    Route::get('rooms/{id}', [App\Http\Controllers\Customer\RoomController::class, 'getRoom']);

    //Seat
    Route::get('rooms/{room_id}/seats', [App\Http\Controllers\Customer\SeatController::class, 'getSeatsByRoom']);



    //Service
    Route::get('services', [App\Http\Controllers\Customer\ServiceController::class, 'getAllServices']);


    //Service Order
    Route::post('service-orders', [App\Http\Controllers\Customer\ServiceOrderController::class, 'createServiceOrder']);

    //Ticket
    Route::post('/tickets/book', [App\Http\Controllers\Customer\BookTicketController::class, 'bookTicket']);
    Route::get('/tickets/history', [App\Http\Controllers\Customer\HistoryTicketController::class, 'history']);
    Route::get('/ticket/{id}', [App\Http\Controllers\Customer\HistoryTicketController::class, 'show']);
    Route::delete('/ticket/{id}/cancel', [App\Http\Controllers\Customer\BookTicketController::class, 'cancel']);
    Route::get('/tickets/filter', [App\Http\Controllers\Customer\BookTicketController::class, 'filter']);

    //Review
    Route::prefix('/reviews')->group(function () {
        Route::post('/', [App\Http\Controllers\Customer\ReviewController::class, 'store']);
    });

    //Gifts
    Route::post('/gifts', [App\Http\Controllers\Customer\GiftController::class, 'exchange']);

    //GiftHistory
    Route::get('/gifthistory', [App\Http\Controllers\Customer\GifthistoryController::class, 'history']);

    //Membership
    Route::prefix('membership')->group(function () {
        Route::post('/register', [App\Http\Controllers\Customer\MembershipController::class, 'register']);
        Route::get('/profile', [App\Http\Controllers\Customer\MembershipController::class, 'profile']);
    });
});
//Review
Route::prefix('/reviews')->group(function () {
    Route::get('/', [App\Http\Controllers\Customer\ReviewController::class, 'index']);

});

Route::prefix('membership')->group(function () {
    Route::get('/profile', [App\Http\Controllers\Customer\MembershipController::class, 'profile']);
});

//Showtime
Route::get('showtimes', [App\Http\Controllers\Customer\ShowtimeController::class, 'getShowtimes']);
Route::get('movies/{movie_id}/showtimes', [App\Http\Controllers\Customer\ShowtimeController::class, 'getShowtimesByMovie']);

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

//Gift
Route::get('/gifts', [App\Http\Controllers\Customer\GiftController::class, 'index']);

//Thanh toán ví điện tử
use App\Http\Controllers\MoMoController;

// Route::post('/momo/create-payment', [MoMoController::class, 'createPayment'])->name('momo.create');
// Route::get('/momo/callback', [MoMoController::class, 'callback'])->name('momo.callback');
// Route::post('/momo/ipn', [MoMoController::class, 'ipn'])->name('momo.ipn');
// Route::get('/momo/test-config', [MoMoController::class, 'testConfig'])->name('momo.test'); // Test endpoint


Route::middleware('api')->group(function () {
    // MoMo API endpoints
    Route::post('/momo/create-payment', [MoMoController::class, 'createPaymentApi'])->name('momo.api.create');
    Route::get('/momo/test-config', [MoMoController::class, 'testConfig'])->name('momo.test.config');
});