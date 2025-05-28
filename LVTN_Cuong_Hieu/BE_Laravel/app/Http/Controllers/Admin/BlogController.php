<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Blog;

class BlogController extends Controller
{
    // Hiển thị danh sách và tìm kiếm
    public function index(Request $request)
    {
        $querry = Blog::with('admin');
        if ($request->has('keyword')) {
            $querry->where('title', 'like', '%' . $request->keyword . '%')
                ->orWhere('content', 'like', '%' . $request->keyword . '%');
        }

        return response()->json($querry->latest()->paginate(10));
    }

    //Thêm
    public function store(Request $request)
    {
        $validated = $request->validate([
            'admin_id' => 'required|exists:admins,id',
            'title' => 'required|string|max:100',
            'content' => 'required|string',
            'image' => 'required|string|max:255'
        ]);
        $blog = Blog::create($validated);
        return response()->json($blog, 201);
    }

    //Cập nhật 
    public function update(Request $request, $id)
    {
        $blog = Blog::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:100',
            'content' => 'sometimes|required|string',
            'image' => 'sometimes|required|string|max:255'
        ]);
        $blog = Blog::update($validated);
        return response()->json($blog);
    }

    //Xoá
    public function destroy($id)
    {
        $blog = Blog::findOrFail($id);
        $blog->delete();
        return response()->json(['message' => 'Blog được xoá thành công']);
    }

    //Thống kê số lượng blog
    public function count()
    {
        $count = Blog::count();
        return response()->json(['total_blogs' => $count]);
    }
}