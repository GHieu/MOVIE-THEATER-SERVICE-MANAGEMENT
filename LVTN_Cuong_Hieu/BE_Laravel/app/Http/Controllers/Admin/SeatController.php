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
            'price' => 'required|numeric|min:0',
            'status' => 'required|string|in:available,reserved,broken',
            'seat_row' => 'sometimes|required|string|min:1|max:2',
            'seat_number' => 'sometimes|required|integer|min:1|max:100'
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

    // Lấy tất cả suất chiếu của 1 phòng (room_id)
    public function getShowtimesByRoom($room_id)
    {
        $showtimes = \App\Models\Showtime::with('movie:id,title')
            ->where('room_id', $room_id)
            ->orderByDesc('start_time')
            ->get();

        return response()->json($showtimes);
    }

    // Lấy trạng thái ghế của suất chiếu
    public function getSeatsStatusByShowtime($showtime_id)
    {
        $showtime = \App\Models\Showtime::with('room.seats')->findOrFail($showtime_id);
        $seats = $showtime->room->seats;

        $statuses = \DB::table('showtime_seat_statuses')
            ->where('showtime_id', $showtime_id)
            ->pluck('status', 'seat_id');

        $result = $seats->map(function ($seat) use ($statuses) {
            return [
                'id' => $seat->id,
                'row' => $seat->seat_row,
                'number' => $seat->seat_number,
                'type' => $seat->seat_type,
                'price' => $seat->price,
                'status' => $statuses[$seat->id] ?? 'available'
            ];
        });

        return response()->json($result);
    }

}