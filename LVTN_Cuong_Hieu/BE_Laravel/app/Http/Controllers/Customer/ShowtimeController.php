<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Showtime;

class ShowtimeController extends Controller
{
    public function getShowtimes()
    {
        $showtimes = Showtime::with(['movie', 'room'])->get();
        return response()->json($showtimes);
    }

    public function getShowtimesByMovie($movie_id)
    {
        $showtimes = Showtime::where('movie_id', $movie_id)->with(['room'])->get();
        return response()->json($showtimes);
    }
}