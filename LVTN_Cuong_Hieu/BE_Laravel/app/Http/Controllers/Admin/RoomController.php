<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;

class RoomController extends Controller
{
    //thêm
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:rooms',
            'type' => 'required|string',
            'seat_count' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive,under_maintenance'
        ]);

        $room = Room::create($validated);
        return response()->json([
            'message' => 'Đã tạo phòng thành công',
            'room' => $room
        ]);
    }

    //xoá
    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        $room->delete();
        return response()->json(['message' => 'Đã xoá phòng']);
    }

    //Cập nhật
    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);
        $validated = $request->validate([
            'name' => 'string|unique:rooms,name,' . $id,
            'type' => 'string',
            'seat_count' => 'integer|min:1',
            'status' => 'in:active,inactive,under_maintenance'
        ]);

        $room->update($validated);
        return response()->json([
            'message' => 'Cập nhật phòng thành công',
            'room' => $room
        ]);
    }

    //Tìm kiếm theo tên
    public function search(Request $request)
    {
        $query = Room::query();
        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $rooms = $query->get();
        return response()->json($rooms);
    }

    //Thống kê tổng số phòng theo trạng thái
    public function statistics()
    {
        $total = Room::count();
        $active = Room::where('status', 'active')->count();
        $inactive = Room::where('status', 'inactive')->count();
        $under_maintenance = Room::where('status', 'under_maintenance')->count();

        return response()->json([
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
            'under_maintenance' => $under_maintenance
        ]);
    }
}