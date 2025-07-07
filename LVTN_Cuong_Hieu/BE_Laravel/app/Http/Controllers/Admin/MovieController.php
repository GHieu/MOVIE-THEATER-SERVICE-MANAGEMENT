<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Movie;
class MovieController extends Controller
{
    //Tìm kiếm
    public function index(Request $request)
    {
        $query = Movie::query();

        if ($search = $request->query('search')) {
            $query->where('title', 'LIKE', "%$search%");
        }

        return response()->json([
            'movies' => $query->orderBy('created_at', 'desc')->paginate(10)
        ]);
    }

    //Xem chi tiết
    public function show($id)
    {
        $movie = Movie::find($id);
        if (!$movie)
            return response()->json([
                'message' => 'Không tìm thấy'
            ], 404);
        return response()->json($movie);
    }

    //Thêm
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Không rỗng, độ dài, định dạng, ký tự cho phép, regex
            'title' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[\pL\s0-9\.,!?-]+$/u', // allowed characters
                'unique:movies,title'
            ],
            'description' => 'nullable|string|max:2000',
            // Số nguyên, số dương, khoảng giá trị, is numeric, integer/decimal check
            'duration' => [
                'required',
                'numeric', // is numeric
                'integer', // integer check
                'min:30',  // positive, min value
                'max:300'  // max value
            ],
            'genre' => 'required|string|max:100',
            'director' => 'nullable|string|max:100',
            'cast' => 'nullable|string|max:255',
            'nation' => 'nullable|string|max:100',
            'studio' => 'nullable|string|max:100',
            // Định dạng số (file size), không rỗng, định dạng file
            'poster' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'banner' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            // Kiểm tra giá trị hợp lệ
            'age' => [
                'required',
                'in:P,T13,T16,T18'
            ],
            // Định dạng URL, độ dài tối đa
            'trailer_url' => 'nullable|file|mimetypes:video/mp4,video/quicktime,video/x-matroska|max:51200', // ~50MB,
            // Định dạng ngày tháng hợp lệ, ngày trong tương lai, range check
            'release_date' => [
                'required',
                'date_format:Y-m-d', // định dạng ngày tháng hợp lệ
                'date', // ngày hợp lệ
                'after_or_equal:today' // ngày trong tương lai hoặc hôm nay
            ],
            'end_date' => [
                'required',
                'date_format:Y-m-d',
                'date',
                'after_or_equal:release_date' // start <= end
            ],
            // Kiểm tra boolean
            'status' => 'required|boolean',
            // Kiểm tra giá trị hợp lệ
            'type' => 'required|in:now_showing,coming_soon,stop_showing',
        ]);


        if ($request->hasFile('poster')) {
            $validated['poster'] = $request->file('poster')->store('posters', 'public');
        }

        if ($request->hasFile('banner')) {
            $validated['banner'] = $request->file('banner')->store('banners', 'public');
        }

        if ($request->hasFile('trailer')) {
            $validated['trailer'] = $request->file('trailer')->store('trailers', 'public');
        }
        $movie = Movie::create($validated);
        return response()->json($movie, 201);
    }

    //Cập nhật
    public function update(Request $request, $id)
    {
        $movie = Movie::findOrFail($id);

        $validated = $request->validate([
            'title' => [
                'sometimes',
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[\pL\s0-9\.,!?-]+$/u'
            ],
            'description' => 'nullable|string|max:2000',
            'duration' => [
                'sometimes',
                'required',
                'numeric',
                'integer',
                'min:30',
                'max:300'
            ],
            'genre' => 'sometimes|required|string|max:100',
            'director' => 'nullable|string|max:100',
            'cast' => 'nullable|string|max:255',
            'nation' => 'nullable|string|max:100',
            'studio' => 'nullable|string|max:100',
            'poster' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'banner' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'age' => [
                'required',
                'in:P,T13,T16,T18'
            ],
            'nullable|file|mimetypes:video/mp4,video/quicktime,video/x-matroska|max:51200',
            'release_date' => [
                'sometimes',
                'required',
                'date_format:Y-m-d',
                'date'
            ],
            'end_date' => [
                'sometimes',
                'required',
                'date_format:Y-m-d',
                'date',
                'after_or_equal:release_date'
            ],
            'status' => 'sometimes|required|boolean',
            'type' => 'sometimes|required|in:now_showing,coming_soon,stop_showing',
        ]);



        if ($request->hasFile('poster')) {
            $validated['poster'] = $request->file('poster')->store('posters', 'public');
        }

        if ($request->hasFile('banner')) {
            $validated['banner'] = $request->file('banners')->store('banners', 'public');
        }

        if ($request->hasFile('trailer')) {
            $validated['trailer'] = $request->file('trailer')->store('trailers', 'public');
        }
        $movie->update($validated);
        return response()->json($movie);
    }

    //Xoá
    public function destroy($id)
    {

        $movie = Movie::findOrFail($id);
        if ($movie->showtimes()->exists()) {
            return response()->json(['message' => 'Không thể xoá phim đã có suất chiếu'], 400);
        }
        $movie->delete();
        return response()->json(['message' => 'Xoá ' . $movie->title . ' phim thành công']);
    }

    //Thống kê số lượng phim đang có
    public function count()
    {
        $count = Movie::count();
        return response()->json(['total_movies' => $count]);
    }
}