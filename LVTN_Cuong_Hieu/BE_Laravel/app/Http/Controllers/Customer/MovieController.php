<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Movie;

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

        //Lấy phim đang trong thời gian chiếu
        $query->whereDate('end_date', '>=', now());

        return response()->json($query->orderBy('release_date', 'desc')->get());
    }

    //xem chi tiết
    public function show($id)
    {
        $movie = Movie::findOrFail($id);
        return response()->json($movie);
    }
}