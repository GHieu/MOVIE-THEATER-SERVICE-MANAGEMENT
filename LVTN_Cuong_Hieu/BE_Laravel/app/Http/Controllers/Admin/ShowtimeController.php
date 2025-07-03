<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Showtime;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ShowtimeController extends Controller
{
    // Hiển thị danh sách với filter và tìm kiếm
    public function index(Request $request)
    {
        $query = Showtime::with(['movie:id,title,duration', 'room:id,name,capacity']);

        // Existing filters
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

        // Additional filters
        if ($request->filled('date')) {
            $query->whereDate('start_time', $request->date);
        }

        if ($request->filled('status')) {
            $now = now();
            match ($request->status) {
                'upcoming' => $query->where('start_time', '>', $now),
                'ongoing' => $query->where('start_time', '<=', $now)->where('end_time', '>=', $now),
                'finished' => $query->where('end_time', '<', $now),
                default => null
            };
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'start_time');
        $sortDir = $request->get('sort_dir', 'asc');

        return response()->json([
            'data' => $query->orderBy($sortBy, $sortDir)->paginate(
                $request->get('per_page', 10)
            ),
            'summary' => $this->getShowtimesSummary($query)
        ]);
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

        try {
            DB::beginTransaction();

            // Kiểm tra trùng giờ chiếu
            $this->assertNoOverlap(
                roomId: $data['room_id'],
                startTime: $data['start_time'],
                endTime: $data['end_time']
            );

            // Kiểm tra business rules
            $this->validateBusinessRules($data);

            $showtime = Showtime::create($data);

            DB::commit();

            return response()->json([
                'message' => 'Suất chiếu đã được tạo thành công',
                'data' => $showtime->load(['movie:id,title', 'room:id,name'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    // Hiển thị chi tiết
    public function show($id)
    {
        $showtime = Showtime::with([
            'movie:id,title,duration,poster_url',
            'room:id,name,capacity',
            'promotion:id,name,discount_percentage'
        ])->findOrFail($id);

        // Thêm thông tin về tình trạng ghế
        $seatInfo = $this->getSeatAvailability($showtime);

        return response()->json([
            'data' => $showtime,
            'seat_info' => $seatInfo,
            'can_edit' => $showtime->start_time > now()->addMinutes(30),
            'can_delete' => $showtime->start_time > now() && !$showtime->bookings()->exists()
        ]);
    }

    // Cập nhật suất chiếu
    public function update(Request $request, $id)
    {
        $showtime = Showtime::findOrFail($id);

        // Kiểm tra có thể sửa không
        if ($showtime->start_time <= now()->addMinutes(30)) {
            return response()->json([
                'error' => 'Không thể sửa suất chiếu sắp bắt đầu hoặc đã bắt đầu'
            ], 422);
        }

        $data = $request->validate([
            'movie_id' => 'required|integer|exists:movies,id',
            'room_id' => 'required|integer|exists:rooms,id',
            'promotion_id' => 'nullable|integer|exists:promotions,id',
            'start_time' => 'required|date|after_or_equal:' . now()->addMinutes(30),
            'end_time' => 'required|date|after:start_time',
            'price' => 'required|numeric|min:10000|max:1000000',
        ]);

        try {
            DB::beginTransaction();

            // Kiểm tra trùng giờ (loại trừ chính bản ghi này)
            $this->assertNoOverlap(
                roomId: $data['room_id'],
                startTime: $data['start_time'],
                endTime: $data['end_time'],
                excludeId: $showtime->id
            );

            // Kiểm tra business rules
            $this->validateBusinessRules($data);

            $showtime->update($data);

            DB::commit();

            return response()->json([
                'message' => 'Suất chiếu đã được cập nhật thành công',
                'data' => $showtime->load(['movie:id,title', 'room:id,name'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    // Xóa
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $showtime = Showtime::findOrFail($id);

            // Kiểm tra có đặt vé không
            if ($showtime->bookings()->exists()) {
                throw new \Exception('Không thể xóa suất chiếu đã có đặt vé');
            }

            // Kiểm tra thời gian
            if ($showtime->start_time <= now()) {
                throw new \Exception('Không thể xóa suất chiếu đã bắt đầu');
            }

            $showtime->delete();

            DB::commit();

            return response()->json(['message' => 'Suất chiếu đã được xóa thành công']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    // Tổng số suất chiếu với thống kê chi tiết
    public function count()
    {
        $now = now();

        return response()->json([
            'total_showtimes' => Showtime::count(),
            'today_showtimes' => Showtime::whereDate('start_time', $now)->count(),
            'upcoming_showtimes' => Showtime::where('start_time', '>', $now)->count(),
            'ongoing_showtimes' => Showtime::where('start_time', '<=', $now)
                ->where('end_time', '>=', $now)->count(),
            'finished_showtimes' => Showtime::where('end_time', '<', $now)->count()
        ]);
    }

    /**
     * Kiểm tra xem trong phòng $roomId có suất chiếu nào
     * có khoảng thời gian overlap với [$startTime, $endTime].
     * Nếu có, throw exception.
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
            $conflictShowtime = $query->with('movie:id,title')->first();
            throw new \Exception(
                "Trùng giờ chiếu với phim '{$conflictShowtime->movie->title}' " .
                "từ " . Carbon::parse($conflictShowtime->start_time)->format('H:i') .
                " đến " . Carbon::parse($conflictShowtime->end_time)->format('H:i')
            );
        }
    }

    /**
     * Validate business rules
     */
    private function validateBusinessRules(array $data): void
    {
        $startTime = Carbon::parse($data['start_time']);
        $endTime = Carbon::parse($data['end_time']);

        // Kiểm tra thời lượng tối thiểu
        if ($endTime->diffInMinutes($startTime) < 30) {
            throw new \Exception('Thời lượng suất chiếu phải ít nhất 30 phút');
        }

        // Kiểm tra giá vé phải là bội số của 1000
        if ($data['price'] % 1000 !== 0) {
            throw new \Exception('Giá vé phải là bội số của 1.000 VND');
        }

        // Kiểm tra không được tạo quá xa (3 tháng)
        if ($startTime->gt(now()->addMonths(3))) {
            throw new \Exception('Không thể tạo suất chiếu quá 3 tháng trước');
        }
    }

    /**
     * Get seat availability info
     */
    private function getSeatAvailability($showtime): array
    {
        $totalSeats = $showtime->room->capacity ?? 0;
        $bookedSeats = $showtime->bookings()->sum('seat_count') ?? 0;

        return [
            'total_seats' => $totalSeats,
            'booked_seats' => $bookedSeats,
            'available_seats' => $totalSeats - $bookedSeats,
            'occupancy_rate' => $totalSeats > 0 ? round(($bookedSeats / $totalSeats) * 100, 2) : 0
        ];
    }

    /**
     * Get showtimes summary
     */
    private function getShowtimesSummary($query): array
    {
        $clonedQuery = clone $query;
        $now = now();

        return [
            'total' => $clonedQuery->count(),
            'upcoming' => (clone $query)->where('start_time', '>', $now)->count(),
            'ongoing' => (clone $query)->where('start_time', '<=', $now)
                ->where('end_time', '>=', $now)->count(),
            'finished' => (clone $query)->where('end_time', '<', $now)->count()
        ];
    }
}