<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReviewController extends Controller
{
    public function index()
    {
        $customerId = Auth::guard('customer')->id();

        $reviews = Review::with('movie:id,title')
            ->where('customer_id', $customerId)
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'rating' => 'required|numeric|min:1|max:5',
        ]);

        $customerId = Auth::guard('customer')->id();

        $review = Review::create([
            'customer_id' => $customerId,
            'movie_id' => $request->movie_id,
            'rating' => $request->rating,
            'created_at' => Carbon::now(),
        ]);

        return response()->json(['message' => 'Đánh giá thành công', 'review' => $review], 201);
    }
}