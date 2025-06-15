<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Showtime;

class ShowtimeController extends Controller
{
    // Lấy danh sách các lịch chiếu kèm phim và phòng
    public function index(Request $request)
    {
        $query = Showtime::with(['movie', 'room', 'promotion']);

        // Lọc theo phim
        if ($request->has('movie_id')) {
            $query->where('movie_id', $request->movie_id);
        }

        // Lọc theo ngày (ngày chiếu)
        if ($request->has('date')) {
            $query->whereDate('start_time', $request->date);
        }

        // Chỉ lấy các suất chiếu trong tương lai
        $query->where('start_time', '>=', now());

        $showtimes = $query->orderBy('start_time')->get();

        return response()->json($showtimes);
    }

    // Chi tiết 1 suất chiếu
    public function show($id)
    {
        $showtime = Showtime::with(['movie', 'room', 'promotion'])->findOrFail($id);

        return response()->json($showtime);
    }

}