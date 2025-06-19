<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Seat;

class SeatController extends Controller
{
    //Liệt kê ghế 1 phòng
    public function index($room_id)
    {
        $seats = Seat::where('room_id', $room_id)->orderBy('seat_row')->orderBy('seat_number')->get();
        return response()->json($seats);
    }

    //Cập nhật ghế
    public function update(Request $request, $id)
    {
        $seat = Seat::findOrFail($id);

        $validated = $request->validate([
            'seat_type' => 'required|string|in:standard,vip,couple',
            'price' => 'required|numeric|min:0|max:500000',
            'status' => 'required|string|in:available,reserved,broken'
        ]);

        $seat->update($validated);
        return response()->json([
            'message' => 'Cập nhật ghế thành công',
            'seat' => $seat
        ]);
    }

    //Thống kê ghế theo loại 1 phòng
    public function countType($room_id)
    {
        $counts = Seat::where('room_id', $room_id)
            ->selectRaw("seat_type,count(*) as total")
            ->groupBy('seat_type')
            ->get();
        return response()->json($counts);
    }

    //Gán ghế theo dãy
    public function setType($room_id)
    {
        $seats = Seat::where('room_id', $room_id)->get();
        foreach ($seats as $seat) {
            $row = strtoupper($seat->seat_row);

            if (in_array($row, ['A', 'B', 'C', 'D'])) {
                $seat->seat_type = 'standard';
                $seat->price = 75000;
            } elseif (in_array($row, ['E', 'F', 'G', 'H'])) {
                $seat->seat_type = 'vip';
                $seat->price = 100000;
            } elseif ($row === 'I') {
                $seat->seat_type = 'couple';
                $seat->price = 130000;
            }

            $seat->status = 'available';
            $seat->save();
        }

        return response()->json([
            'message' => 'Loại ghế, giá và trạng thái đã thành công'
        ]);
    }
}