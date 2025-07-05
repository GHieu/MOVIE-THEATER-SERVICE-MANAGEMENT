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
            'movie' => [
                'nullable',
                'string',
                'min:1',
                'max:100',
                'regex:/^[\pL\s0-9\.,!?-]+$/u' // allowed characters, format check
            ],
            'customer' => [
                'nullable',
                'string',
                'min:1',
                'max:100',
                'regex:/^[\pL\s0-9\.,!?-]+$/u'
            ],
            'rating' => [
                'nullable',
                'numeric',      // is numeric
                'min:1',        // range check, positive
                'max:5',        // range check
                'regex:/^\d+(\.\d{1,1})?$/' // number format check (1 số thập phân)
            ],
            'from_date' => [
                'nullable',
                'date_format:Y-m-d', // valid date format
                'date',              // valid date
                'before_or_equal:to_date' // range check
            ],
            'to_date' => [
                'nullable',
                'date_format:Y-m-d',
                'date',
                'after_or_equal:from_date',
                'before_or_equal:today' // future/past date check
            ],
            'age' => [
                'nullable',
                'integer',    // integer check
                'min:0',      // positive integer age
                'max:120'     // min/max age
            ]
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

        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        if ($request->has('age')) {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('age', $request->age);
            });
        }

        $review = $query->orderBy('created_at', 'desc')->paginate(10);
        return response()->json($review);
    }
}