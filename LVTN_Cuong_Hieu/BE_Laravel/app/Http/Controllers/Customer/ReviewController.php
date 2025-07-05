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
        $reviews = Review::with('movie:id,title', 'customer:id,name') // nếu muốn có tên người dùng
            ->orderByDesc('created_at')
            ->get(); // lấy tất cả

        return response()->json($reviews);
    }




    public function store(Request $request)
    {
        $request->validate([
            'movie_id' => [
                'required',
                'integer',      // is numeric, integer check
                'min:1',        // positive
                'exists:movies,id'
            ],
            'rating' => [
                'required',
                'numeric',      // is numeric
                'min:1',        // range check, positive
                'max:10',       // range check
                'regex:/^\d+(\.\d{1,1})?$/', // number format check (tối đa 1 số thập phân)
            ],
            'comment' => [
                'nullable',
                'string',
                'min:5',        // min length
                'max:1000',     // max length
                'regex:/^[\pL\s0-9\.,!?-]+$/u' // allowed characters, format check
            ],
            'created_at' => [
                'sometimes',
                'date_format:Y-m-d H:i:s', // valid date format
                'date',                    // valid date
                'before_or_equal:now'      // past/future date check
            ]
        ], [
            'rating.regex' => 'Điểm đánh giá chỉ cho phép tối đa 1 số thập phân.',
            'comment.regex' => 'Nội dung chỉ được chứa chữ, số và một số ký tự đặc biệt.',
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