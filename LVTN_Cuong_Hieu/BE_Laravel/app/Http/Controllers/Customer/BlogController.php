<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Blog;

class BlogController extends Controller
{
    //Hiển thị
    public function index(Request $request)
    {
        $query = Blog::with('admin:id,name'); // Có thể chỉ load tên admin

        if ($request->has('keyword')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->keyword . '%')
                    ->orWhere('content', 'like', '%' . $request->keyword . '%');
            });
        }

        return response()->json($query->latest()->paginate(10));
    }

    //Xem chi tiết
    public function show($id)
    {
        $blog = Blog::with('admin:id,name')->find($id);

        if (!$blog) {
            return response()->json(['message' => 'Blog không tồn tại'], 404);
        }

        return response()->json($blog);
    }
}