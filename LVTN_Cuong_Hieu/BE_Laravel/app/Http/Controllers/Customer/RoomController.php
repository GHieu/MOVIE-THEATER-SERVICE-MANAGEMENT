<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;
class RoomController extends Controller
{
    public function getAllRooms()
    {
        return response()->json(Room::all());
    }

    public function getRoom($id)
    {
        $room = Room::with('seats')->findOrFail($id);
        return response()->json($room);
    }
}