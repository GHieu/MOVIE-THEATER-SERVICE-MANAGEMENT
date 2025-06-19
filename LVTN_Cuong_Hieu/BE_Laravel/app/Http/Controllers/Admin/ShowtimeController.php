<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Showtime;
use phpDocumentor\Reflection\DocBlock\Tags\Return_;

class ShowtimeController extends Controller
{
    // Hiển thị danh sách với filter và tìm kiếm
    public function index(Request $request)
    {
        $query = Showtime::with(['movie', 'room']);

        if ($request->filled('movie_id')) {
            $query->where('movie_id', $request->movie_id);
        }
        if ($request->filled('room_id')) {
            $query->where('room_id', $request->room_id);
        }
        if ($request->filled('promotion_id')) {
            $query->where('promotion_id', $request->promotion_id);
        }
        if ($request->filled('keyword')) {
            $query->whereHas(
                'movie',
                fn($q) =>
                $q->where('title', 'like', '%' . $request->keyword . '%')
            );
        }

        return response()->json(
            $query->orderBy('start_time', 'asc')->paginate(10)
        );
    }

    // Thêm suất chiếu mới
    public function store(Request $request)
    {
        $data = $request->validate([
            'movie_id' => 'required|integer|exists:movies,id',
            'room_id' => 'required|integer|exists:rooms,id',
            'promotion_id' => 'nullable|integer|exists:promotions,id',
            'start_time' => 'required|date|after_or_equal:now',
            'end_time' => 'required|date|after:start_time',
            'price' => 'required|numeric|min:10000|max:1000000',
        ]);
        // Kiểm tra trùng giờ chiếu
        $this->assertNoOverlap(
            roomId: $data['room_id'],
            startTime: $data['start_time'],
            endTime: $data['end_time']
        );

        $showtime = Showtime::create($data);
        return response()->json($showtime, 201);
    }

    // Hiển thị chi tiết
    public function show($id)
    {
        return response()->json(
            Showtime::with(['movie', 'room'])->findOrFail($id)
        );
    }

    // Cập nhật suất chiếu
    public function update(Request $request, $id)
    {
        $showtime = Showtime::findOrFail($id);

        $data = $request->validate([
            'movie_id' => 'required|integer|exists:movies,id',
            'room_id' => 'required|integer|exists:rooms,id',
            'promotion_id' => 'nullable|integer|exists:promotions,id',
            'start_time' => 'required|date|after_or_equal:now',
            'end_time' => 'required|date|after:start_time',
            'price' => 'required|numeric|min:10000|max:1000000',
        ]);

        // Kiểm tra trùng giờ (loại trừ chính bản ghi này)
        $this->assertNoOverlap(
            roomId: $data['room_id'],
            startTime: $data['start_time'],
            endTime: $data['end_time'],
            excludeId: $showtime->id
        );

        $showtime->update($data);
        return response()->json($showtime);
    }

    // Xóa
    public function destroy($id)
    {
        Showtime::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // Tổng số suất chiếu
    public function count()
    {
        return response()->json(['total_showtimes' => Showtime::count()]);
    }

    /**
     * Kiểm tra xem trong phòng $roomId có suất chiếu nào
     * có khoảng thời gian overlap với [$startTime, $endTime].
     * Nếu có, abort 422.
     */
    private function assertNoOverlap(int $roomId, string $startTime, string $endTime, int $excludeId = null): void
    {
        $query = Showtime::where('room_id', $roomId)
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            abort(response()->json([
                'error' => 'Trùng giờ chiếu với suất chiếu khác trong phòng'
            ], 422));
        }
    }
}