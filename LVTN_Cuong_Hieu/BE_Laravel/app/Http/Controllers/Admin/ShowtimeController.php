<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Showtime;
use phpDocumentor\Reflection\DocBlock\Tags\Return_;

class ShowtimeController extends Controller
{
    //Xem danh sách xuất chiếu và tìm kiếm
    public function index(Request $request)
    {
        $query = Showtime::with(['movie', 'room']);
        if ($request->has('movie_id')) {
            $query->where('movie_id', $request->movie_id);
        }

        if ($request->has('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        if ($request->has('promotion_id')) {
            $query->where('promotion_id', $request->promotion_id);
        }

        //Tìm kiếm theo tên phim
        if ($request->has('keyword')) {
            $query->whereHas('movie', function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->keyword . '%');
            });
        }
        $showtimes = $query->orderBy('start_time', 'asc')->paginate(10);


        return response()->json($showtimes);
    }

    //thêm
    public function store(Request $request)
    {
        $validated = $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'room_id' => 'required|exists:rooms,id',
            'promotion_id' => 'required|exists:promotions,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'price' => 'required|numeric|min:0'
        ]);

        //Kiểm tra giờ trùng cùng phòng
        $check = Showtime::where('room_id', $validated['room_id'])->where(function ($query) use ($validated) {
            $query->where('start_time', '<', $validated['end_time'])
                ->where('end_time', '>', $validated['start_time']);
        })->exists();

        if ($check) {
            return response()->json(['error' => 'Trùng giờ chiếu với suất chiếu khác trong phòng'], 422);
        }

        $showtime = Showtime::create($validated);
        return response()->json($showtime, 201);
    }

    //hiển thị chi tiết
    public function show($id)
    {
        $showtime = Showtime::with(['movie', 'room'])->findOrFail($id);
        return response()->json($showtime);
    }

    //Cập nhật
    public function update(Request $request, $id)
    {
        $showtime = Showtime::findOrFail($id);

        $validated = $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'room_id' => 'required|exists:rooms,id',
            'promotion_id' => 'nullable|exists:promotions,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'price' => 'required|numeric|min:0',
        ]);


        //Kiểm tra giờ trùng cùng phòng
        $check = Showtime::where('room_id', $validated['room_id'])
            ->where('id', '!=', $id)
            ->where(function ($query) use ($validated) {
                $query->where('start_time', '<', $validated['end_time'])
                    ->where('end_time', '>', $validated['start_time']);
            })->exists();

        if ($check) {
            return response()->json(['error' => 'Trùng giờ chiếu với suất chiếu khác trong phòng'], 422);
        }

        $showtime->update($validated);
        return response()->json($showtime);
    }

    //Xoá
    public function destroy($id)
    {
        $showtime = Showtime::findOrFail($id);
        $showtime->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    //Thống kê số lượng
    public function count()
    {
        $total = Showtime::count();
        return response()->json(['total_showtimes' => $total]);
    }
}