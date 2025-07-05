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
            'seat_type' => [
                'required',
                'string',
                'in:standard,vip,couple'
            ],
            'price' => [
                'required',
                'numeric',      // is numeric
                'min:0',        // positive
                'max:500000',   // range check
                'regex:/^\d+(\.\d{1,2})?$/', // number format check (tối đa 2 số thập phân)
            ],
            'status' => [
                'required',
                'string',
                'in:available,reserved,broken'
            ],
            'seat_row' => [
                'sometimes',
                'required',
                'string',
                'min:1',
                'max:2',
                'regex:/^[A-Z]{1,2}$/', // allowed characters: chỉ chữ cái in hoa, 1-2 ký tự
            ],
            'seat_number' => [
                'sometimes',
                'required',
                'numeric',      // is numeric
                'integer',      // integer check
                'min:1',        // positive
                'max:100'       // range check
            ]
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