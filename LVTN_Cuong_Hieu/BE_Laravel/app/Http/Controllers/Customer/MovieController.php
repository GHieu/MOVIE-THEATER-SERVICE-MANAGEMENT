<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Movie;
use Carbon\Carbon;
class MovieController extends Controller
{
    public function index(Request $request)
    {
        $query = Movie::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        } else {
            // Mặc định chỉ hiện các phim chưa hết chiếu
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
}