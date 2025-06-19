<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'movie' => 'nullable|string|max:100',
            'customer' => 'nullable|string|max:100'
        ]);
        $query = Review::with('customer:id,name,email', 'movie:id,title');

        //Lọc tên phim
        if ($request->has('movie')) {
            $query->whereHas('movie', function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->movie . '%');
            });
        }

        //Lọc khách hàng
        if ($request->has('customer')) {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->customer . '%');
            });
        }

        $review = $query->orderBy('created_at', 'desc')->paginate(10);
        return response()->json($review);
    }
}