<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Showtime;
use App\Models\Ticket_details;

class SeatController extends Controller
{
    public function availableByShowtime($id)
    {
        $showtime = Showtime::with('room.seats')->findOrFail($id);

        $bookedSeatIds = Ticket_details::where('showtime_id', $id)
            ->pluck('seat_id')
            ->toArray();

        $seats = $showtime->room->seats->map(function ($seat) use ($bookedSeatIds) {
            $seat->is_booked = in_array($seat->id, $bookedSeatIds);
            return $seat;
        });

        return response()->json($seats);
    }
}