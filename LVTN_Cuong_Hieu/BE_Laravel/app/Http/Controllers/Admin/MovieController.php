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
            'title' => 'required|string',
            'description' => 'nullable|string',
            'duration' => 'required|integer',
            'genre' => 'required|string',
            'director' => 'nullable|string',
            'cast' => 'nullable|string',
            'poster' => 'nullable|image|max:2048',
            'banner' => 'nullable|image|max:4096',
            'age' => 'nullable|string|max:10',
            'trailer_url' => 'nullable|url',
            'release_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:release_date',
            'status' => 'required|boolean',
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
            'title' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'duration' => 'sometimes|required|integer',
            'genre' => 'sometimes|required|string',
            'director' => 'nullable|string',
            'cast' => 'nullable|string',
            'poster' => 'nullable|image|max:2048',
            'banner' => 'nullable|image|max:4096',
            'age' => 'nullable|string|max:10',
            'trailer_url' => 'nullable|url',
            'release_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:release_date',
            'status' => 'sometimes|required|boolean'
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