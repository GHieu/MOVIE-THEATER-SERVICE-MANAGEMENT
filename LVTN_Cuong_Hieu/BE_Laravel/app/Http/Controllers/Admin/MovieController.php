<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Movie;
use Illuminate\Support\Facades\Storage;

class MovieController extends Controller
{
    // Tìm kiếm
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

    // Xem chi tiết
    public function show($id)
    {
        $movie = Movie::find($id);
        if (!$movie) {
            return response()->json([
                'message' => 'Không tìm thấy'
            ], 404);
        }
        return response()->json($movie);
    }

    // Thêm
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[\pL\s0-9\.,!?-]+$/u',
                'unique:movies,title'
            ],
            'description' => 'nullable|string|max:2000',
            'duration' => [
                'required',
                'numeric',
                'integer',
                'min:30',
                'max:300'
            ],
            'genre' => 'required|string|max:100',
            'director' => 'nullable|string|max:100',
            'cast' => 'nullable|string|max:255',
            'nation' => 'nullable|string|max:100',
            'studio' => 'nullable|string|max:100',
            'poster' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'banner' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'trailer_url' => 'nullable|file|mimetypes:video/mp4,video/quicktime,video/x-matroska|max:51200',
            'age' => [
                'required',
                'in:P,T13,T16,T18'
            ],
            'release_date' => [
                'required',
                'date_format:Y-m-d',
                'date',
                'after_or_equal:today'
            ],
            'end_date' => [
                'required',
                'date_format:Y-m-d',
                'date',
                'after_or_equal:release_date'
            ],
            'status' => 'required|boolean',
            'type' => 'required|in:now_showing,coming_soon,stop_showing',
        ]);

        $data = $validated;

        if ($request->hasFile('poster')) {
            $data['poster'] = $request->file('poster')->store('posters', 'public');
        }

        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')->store('banners', 'public');
        }

        if ($request->hasFile('trailer_url')) {
            $data['trailer_url'] = $request->file('trailer_url')->store('trailers', 'public');
        }

        $movie = Movie::create($data);
        return response()->json($movie, 201);
    }

    // Cập nhật
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
                'regex:/^[\pL\s0-9\.,!?-]+$/u',
                'unique:movies,title,' . $id
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
            'trailer_url' => 'nullable|file|mimetypes:video/mp4,video/quicktime,video/x-matroska|max:512000',
            'age' => [
                'required',
                'in:P,T13,T16,T18'
            ],
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

        $data = $validated;

        if ($request->hasFile('poster')) {
            if ($movie->poster) {
                Storage::disk('public')->delete($movie->poster);
            }
            $data['poster'] = $request->file('poster')->store('posters', 'public');
        }

        if ($request->hasFile('banner')) {
            if ($movie->banner) {
                Storage::disk('public')->delete($movie->banner);
            }
            $data['banner'] = $request->file('banner')->store('banners', 'public');
        }

        if ($request->hasFile('trailer_url')) {
            if ($movie->trailer_url) {
                Storage::disk('public')->delete($movie->trailer_url);
            }
            $data['trailer_url'] = $request->file('trailer_url')->store('trailers', 'public');
        }

        $movie->update($data);
        return response()->json($movie);
    }


    public function destroy($id)
    {
        $movie = Movie::findOrFail($id);
        if ($movie->showtimes()->exists()) {
            return response()->json(['message' => 'Không thể xóa phim đã có suất chiếu'], 400);
        }

        if ($movie->poster) {
            Storage::disk('public')->delete($movie->poster);
        }
        if ($movie->banner) {
            Storage::disk('public')->delete($movie->banner);
        }
        if ($movie->trailer_url) {
            Storage::disk('public')->delete($movie->trailer_url);
        }

        $movie->delete();
        return response()->json(['message' => 'Xóa ' . $movie->title . ' phim thành công']);
    }

    // Thống kê số lượng phim đang có
    public function count()
    {
        $count = Movie::count();
        return response()->json(['total_movies' => $count]);
    }
}