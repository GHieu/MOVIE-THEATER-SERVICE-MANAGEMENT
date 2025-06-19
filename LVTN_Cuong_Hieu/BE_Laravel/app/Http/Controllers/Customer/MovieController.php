<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Movie;
use App\Models\Showtime;
use Carbon\Carbon;
class MovieController extends Controller
{
    public function index(Request $request)
{
    $query = Movie::query();


        // Luôn chỉ hiển thị phim còn chiếu (end_date >= hôm nay)
        $query->whereDate('end_date', '>=', Carbon::today());

        // Mặc định chỉ hiện phim status = 1 (hiển thị)
        $query->where('status', 1);

        // Nếu có search
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Nếu có lọc theo type (now_showing / coming_soon)
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json(
            $query->orderBy('release_date', 'desc')->get()
        );

    if ($request->has('status')) {
        $query->where('status', $request->status);

    }

    if ($request->has('search')) {
        $query->where('title', 'like', '%' . $request->search . '%');
    }

    if ($request->has('type')) {
        $query->where('type', $request->type);
    }

    // Chỉ lọc theo end_date khi không có tham số search hoặc type
    if (!$request->has('search') && !$request->has('type')) {
        $query->whereDate('end_date', '>=', Carbon::today());
    }

    return response()->json($query->orderBy('release_date', 'desc')->get());
}

    //xem chi tiết
    public function show($id)
    {
        $movie = Movie::findOrFail($id);
        return response()->json($movie);
    }


    public function showtimes($id)
    {
        $showtimes = Showtime::with(['room', 'promotion'])
            ->where('movie_id', $id)
            ->where('start_time', '>=', now())
            ->orderBy('start_time')
            ->get();

        return response()->json($showtimes);
    }
}