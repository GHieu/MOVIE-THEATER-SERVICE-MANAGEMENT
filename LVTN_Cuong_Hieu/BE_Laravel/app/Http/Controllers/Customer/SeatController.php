<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Seat;


class SeatController extends Controller
{
    public function getSeatsByRoom($room_id)
    {
        $seats = Seat::where('room_id', $room_id)->orderBy('seat_row')->orderBy('seat_number')->get();
        return response()->json($seats);
    }

}