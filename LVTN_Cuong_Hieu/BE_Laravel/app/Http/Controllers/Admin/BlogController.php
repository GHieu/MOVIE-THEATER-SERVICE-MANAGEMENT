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
            'admin_id' => [
                'required',                 // Không rỗng
                'numeric',                  // Là số
                'integer',                  // Số nguyên
                'min:1',                    // Số dương, tối thiểu 1
                'exists:admins,id',         // Tồn tại trong bảng admins
            ],
            'title' => [
                'required',                 // Không rỗng
                'string',                   // Kiểu chuỗi
                'min:5',                    // Độ dài tối thiểu
                'max:100',                  // Độ dài tối đa
                'regex:/^[\pL\s0-9\.,!?-]+$/u' // Ký tự cho phép (chữ, số, khoảng trắng, .,!?-)
            ],
            'content' => [
                'required',                 // Không rỗng
                'string',                   // Kiểu chuỗi
                'min:10',                   // Độ dài tối thiểu
                // Không giới hạn tối đa, có thể thêm 'max:5000' nếu muốn
            ],
            'image' => [
                'required',                 // Không rỗng
                'image',                    // Định dạng ảnh
                'mimes:jpeg,png,jpg',       // Định dạng file cho phép
                'max:2048',                 // Dung lượng tối đa 2MB
            ],
            // Ví dụ kiểm tra ngày tháng hợp lệ, ngày trong quá khứ/tương lai (nếu có trường ngày)
            // 'publish_date' => [
            //     'required',
            //     'date',                   // Là ngày hợp lệ
            //     'date_format:Y-m-d',      // Định dạng ngày
            //     'after_or_equal:2024-01-01', // Trong khoảng thời gian cho phép
            //     'before_or_equal:2025-12-31',
            // ],
        ]);


        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('images', 'public');
        }

        $blog = Blog::create($validated);
        return response()->json($blog, 201);
    }

    //Cập nhật 
    public function update(Request $request, $id)
    {
        $blog = Blog::findOrFail($id);
        $validated = $request->validate([
            'title' => [
                'sometimes',
                'required',
                'string',
                'min:5',
                'max:100',
                'regex:/^[\pL\s0-9\.,!?-]+$/u'
            ],
            'content' => [
                'sometimes',
                'required',
                'string',
                'min:10',
            ],
            'image' => [
                'sometimes',
                'image',
                'mimes:jpeg,png,jpg',
                'max:2048',
            ],
            // 'publish_date' => [
            //     'sometimes',
            //     'required',
            //     'date',
            //     'date_format:Y-m-d',
            //     'after_or_equal:2024-01-01',
            //     'before_or_equal:2025-12-31',
            // ],
        ]);

        if ($request->hasFile('image')) {
            $blog->image = $request->file('image')->store('images', 'public');
        }

        $blog->title = $request->title;
        $blog->content = $request->content;
        $blog->save();
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