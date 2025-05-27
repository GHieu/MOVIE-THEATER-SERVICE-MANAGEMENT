<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\MovieController;
use App\Http\Controllers\Admin\SeatController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\ShowtimeController;


//Login Admin
Route::prefix('admin')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sactum')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);

        //Movie
        Route::prefix('movies')->group(function () {
            Route::get('/', [MovieController::class, 'index']);
            Route::post('/', [MovieController::class, 'store']);
            Route::put('/{id}', [MovieController::class, 'update']);
            Route::delete('/{id}', [MovieController::class, 'destroy']);
            Route::get('/count', [MovieController::class, 'count']);
        });
        //Seat
        Route::prefix('seats')->group(function () {
            Route::get('/room/{room_id}', [SeatController::class, 'index']);
            Route::put('/{id}', [SeatController::class, 'update']);
            Route::get('/count/{room_id}', [SeatController::class, 'countType']);
            Route::post('/settype/{room_id}', [SeatController::class, 'setType']);
        });

        //Room
        Route::prefix('rooms')->group(function () {
            Route::post('/', [RoomController::class, 'store']);
            Route::put('/{id}', [RoomController::class, 'update']);
            Route::delete('/{id}', [RoomController::class, 'destroy']);
            Route::get('/search', [RoomController::class, 'search']);
            Route::get('/stats', [RoomController::class, 'statistics']);
        });

        //Showtime
        Route::prefix('showtimes')->group(function () {
            Route::get('/', [ShowtimeController::class, 'index']);
            Route::post('/', [ShowtimeController::class, 'store']);
            Route::get('/{id}', [ShowtimeController::class, 'show']);
            Route::put('/{id}', [ShowtimeController::class, 'update']);
            Route::delete('/{id}', [ShowtimeController::class, 'destroy']);
            Route::get('/statistic/count', [ShowtimeController::class, 'count']);
        });
    });
});

//Login Customer
Route::post('/register', [App\Http\Controllers\Customer\AuthController::class, 'register']);
Route::post('/login', [App\Http\Controllers\Customer\AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [App\Http\Controllers\Customer\AuthController::class, 'user']);
    Route::post('/logout', [App\Http\Controllers\Customer\AuthController::class, 'logout']);
});