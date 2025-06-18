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
            'title' => 'required|string|min:2|max:255|unique:movies,title',
            'description' => 'nullable|string|max:2000',
            'duration' => 'required|integer|min:30|max:300', // phút
            'genre' => 'required|string|max:100',
            'director' => 'nullable|string|max:100',
            'cast' => 'nullable|string|max:255',
            'nation' => 'nullable|string|max:100',
            'poster' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'banner' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'age' => 'required|in:P,T13,T16,T18',
            'trailer_url' => 'nullable|url|max:255',
            'release_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:release_date',
            'status' => 'required|boolean',
            'type' => 'required|in:now_showing,coming_soon,stop_showing',
        ]);


        if ($request->hasFile('poster')) {
            $validated['poster'] = $request->file('poster')->store('posters', 'public');
        }

        if ($request->hasFile('banner')) {
            $validated['banner'] = $request->file('banner')->store('banners', 'public');
        }

        $movie = Movie::create($validated);
        return response()->json($movie, 201);
    }

    //Cập nhật
    public function update(Request $request, $id)
    {
        $movie = Movie::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|min:2|max:255',
            'description' => 'nullable|string|max:2000',
            'duration' => 'sometimes|required|integer|min:30|max:300',
            'genre' => 'sometimes|required|string|max:100',
            'director' => 'nullable|string|max:100',
            'cast' => 'nullable|string|max:255',
            'nation' => 'nullable|string|max:100',
            'poster' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'banner' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'age' => 'required|in:P,T13,T16,T18',
            'trailer_url' => 'nullable|url|max:255',
            'release_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:release_date',
            'status' => 'sometimes|required|boolean',
            'type' => 'sometimes|required|in:now_showing,coming_soon,stop_showing',
        ]);



        if ($request->hasFile('poster')) {
            $validated['poster'] = $request->file('poster')->store('posters', 'public');
        }

        if ($request->hasFile('banner')) {
            $validated['banner'] = $request->file('banners')->store('banners', 'public');
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