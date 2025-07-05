<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;
use Illuminate\Support\Facades\DB;

class RoomController extends Controller
{

    public function index()
    {
        return response()->json(Room::all());
    }

    //thêm
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'min:5',
                'max:100',
                'regex:/^[\pL\s0-9\.,!?-]+$/u', // kiểm tra ký tự cho phép
                'unique:rooms,name'
            ],
            'type' => [
                'required',
                'string',
                'in:2Dsub,2Dcap,3Dsub,3Dcap,IMAXsub,IMAXcap'
            ],
            'seat_count' => [
                'required',
                'numeric',      // is numeric
                'integer',      // integer check
                'min:1',        // positive, min value
                'max:500'       // max value
            ],
            'status' => [
                'required',
                'integer',
                'in:0,1,2'
            ],
        ], [
            'name.regex' => 'Tên phòng chỉ được chứa chữ cái, số và một số ký tự đặc biệt.',
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
        try {
            DB::beginTransaction();

            $room = Room::findOrFail($id);

            // Kiểm tra có suất chiếu nào đang hoạt động không
            $hasActiveShowtimes = $room->showtimes()
                ->where('end_time', '>=', now()) // Suất chiếu chưa kết thúc
                ->exists();

            if ($hasActiveShowtimes) {
                throw new \Exception('Không thể xóa phòng đang có suất chiếu hoạt động');
            }

            // Kiểm tra có suất chiếu nào đã có vé đặt không
            $hasTicketedShowtimes = $room->showtimes()
                ->whereHas('tickets') // Có tickets
                ->exists();

            if ($hasTicketedShowtimes) {
                throw new \Exception('Không thể xóa phòng đã có lịch sử đặt vé');
            }

            $room->delete();

            DB::commit();

            return response()->json(['message' => 'Đã xoá phòng thành công']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    //Cập nhật
    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $room = Room::findOrFail($id);

            // Kiểm tra các trường quan trọng có được thay đổi không
            $criticalFields = ['seat_count', 'type'];
            $isCriticalUpdate = false;

            foreach ($criticalFields as $field) {
                if ($request->has($field) && $request->$field != $room->$field) {
                    $isCriticalUpdate = true;
                    break;
                }
            }

            // Nếu là cập nhật quan trọng, kiểm tra suất chiếu
            if ($isCriticalUpdate) {
                $hasActiveShowtimes = $room->showtimes()
                    ->where('end_time', '>=', now()) // Suất chiếu chưa kết thúc
                    ->exists();

                if ($hasActiveShowtimes) {
                    throw new \Exception('Không thể thay đổi thông tin phòng khi đang có suất chiếu hoạt động');
                }
            }

            $validated = $request->validate([
                'name' => [
                    'sometimes',
                    'required',
                    'string',
                    'min:5',
                    'max:100',
                    'regex:/^[\pL\s0-9\.,!?-]+$/u',
                    'unique:rooms,name,' . $id
                ],
                'type' => 'sometimes|required|string|in:2Dsub,2Dcap,3Dsub,3Dcap,IMAXsub,IMAXcap',
                'seat_count' => [
                    'sometimes',
                    'required',
                    'numeric',
                    'integer',
                    'min:1',
                    'max:500'
                ],
                'status' => 'sometimes|required|integer|in:0,1,2',
            ], [
                'name.regex' => 'Tên phòng chỉ được chứa chữ cái, số và một số ký tự đặc biệt.',
            ]);

            $room->update($validated);

            DB::commit();

            return response()->json([
                'message' => 'Cập nhật phòng thành công',
                'room' => $room
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    //Tìm kiếm theo tên
    public function search(Request $request)
    {
        $request->validate([
            'name' => [
                'nullable',
                'string',
                'min:1',
                'max:100',
                'regex:/^[\pL\s0-9\.,!?-]+$/u'
            ]
        ]);
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
        $active = Room::where('status', '0')->count();
        $inactive = Room::where('status', '1')->count();
        $under_maintenance = Room::where('status', '2')->count();

        return response()->json([
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
            'under_maintenance' => $under_maintenance
        ]);
    }

    /**
     * Kiểm tra phòng có thể xóa/sửa không
     */
    public function checkAvailability($id)
    {
        $room = Room::findOrFail($id);

        $hasActiveShowtimes = $room->showtimes()
            ->where('end_time', '>=', now())
            ->exists();

        $hasTicketedShowtimes = $room->showtimes()
            ->whereHas('tickets')
            ->exists();

        $upcomingShowtimes = $room->showtimes()
            ->where('start_time', '>', now())
            ->with('movie:id,title')
            ->get();

        return response()->json([
            'can_delete' => !$hasActiveShowtimes && !$hasTicketedShowtimes,
            'can_update_critical' => !$hasActiveShowtimes,
            'can_update_basic' => true, // Luôn có thể sửa tên, status
            'active_showtimes_count' => $room->showtimes()->where('end_time', '>=', now())->count(),
            'upcoming_showtimes' => $upcomingShowtimes->map(function ($showtime) {
                return [
                    'id' => $showtime->id,
                    'movie_title' => $showtime->movie->title,
                    'start_time' => $showtime->start_time,
                    'end_time' => $showtime->end_time
                ];
            })
        ]);
    }
}