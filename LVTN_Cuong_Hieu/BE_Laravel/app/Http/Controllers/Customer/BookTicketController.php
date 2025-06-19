<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Ticket_details;
use App\Models\ServiceOrder;
use App\Models\Seat;
use App\Models\Service;
use App\Models\Showtime;
use App\Models\Membership;
use Illuminate\Support\Facades\DB;

class BookTicketController extends Controller
{
    public function bookTicket(Request $request)
    {
        $validated = $request->validate([
            'showtime_id' => 'required|exists:showtimes,id',
            'seats' => 'required|array|min:1',
            'seats.*' => ['required', 'regex:/^[A-Z]{1}[0-9]{1,2}$/'], // ví dụ: A1, B12
            'services' => 'nullable|array',
            'services.*.service_id' => 'required|exists:services,id',
            'services.*.quantity' => 'required|integer|min:1|max:20',
        ]);

        $customer = $request->user(); // Lấy từ auth:sanctum

        DB::beginTransaction();
        try {
            $showtime = Showtime::findOrFail($request->showtime_id);
            $room_id = $showtime->room_id;

            // Tính tổng giá ghế
            $seatTotal = 0;
            foreach ($request->seats as $seatCode) {
                $row = substr($seatCode, 0, 1);
                $number = substr($seatCode, 1);
                $seat = Seat::where('room_id', $room_id)
                    ->where('seat_row', $row)
                    ->where('seat_number', $number)
                    ->firstOrFail();

                if ($seat->status !== 'available') {
                    throw new \Exception("Ghế $seatCode đã được đặt hoặc hỏng.");
                }

                $seatTotal += $seat->price;
            }

            // Tính tổng giá dịch vụ
            $serviceTotal = 0;
            $servicesData = [];
            if ($request->has('services')) {
                foreach ($request->services as $service) {
                    $serviceModel = Service::findOrFail($service['service_id']);
                    $total = $serviceModel->price * $service['quantity'];
                    $serviceTotal += $total;
                    $servicesData[] = [
                        'service' => $serviceModel,
                        'quantity' => $service['quantity'],
                        'total' => $total
                    ];
                }
            }

            // Tổng tiền
            $total = $seatTotal + $serviceTotal;

            // Tạo ticket
            $ticket = Ticket::create([
                'customer_id' => $customer->id,
                'showtime_id' => $showtime->id,
                'total_price' => $total,
                'payment_method' => 'cash', // hoặc 'momo' tuỳ hệ thống
                'status' => 'paid', // hoặc 'unpaid' nếu chưa thanh toán
            ]);

            // Cộng điểm nếu là thành viên
            if ($ticket->status === 'paid') {
                $membership = Membership::where('customer_id', $customer->id)->first();
                if ($membership) {
                    $membership->increment('point', 10);
                    $membership->increment('total_points', 10);
                }
            }

            // Cập nhật ghế & tạo chi tiết vé
            foreach ($request->seats as $seatCode) {
                $row = substr($seatCode, 0, 1);
                $number = substr($seatCode, 1);
                $seat = Seat::where('room_id', $room_id)
                    ->where('seat_row', $row)
                    ->where('seat_number', $number)
                    ->first();

                // Cập nhật trạng thái ghế
                $seat->status = 'reversed';
                $seat->save();

                Ticket_details::create([
                    'ticket_id' => $ticket->id,
                    'seat_number' => $seatCode,
                    'price' => $seat->price
                ]);
            }

            // Tạo service_order nếu có
            foreach ($servicesData as $item) {
                ServiceOrder::create([
                    'ticket_id' => $ticket->id,
                    'service_id' => $item['service']->id,
                    'quantity' => $item['quantity']
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Đặt vé thành công!',
                'ticket_id' => $ticket->id,
                'total' => $total
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi đặt vé: ' . $e->getMessage()
            ], 500);
        }
    }

    //Huỷ vé
    public function cancel($id, Request $request)
    {
        $ticket = Ticket::where('id', $id)
            ->where('customer_id', $request->user()->id)
            ->firstOrFail();

        if ($ticket->showtime->start_time < now()) {
            return response()->json(['message' => 'Không thể huỷ vé đã quá thời gian suất chiếu'], 400);
        }

        // Nếu vé đã thanh toán thì trừ điểm
        if ($ticket->status === 'paid') {
            $membership = Membership::where('customer_id', $ticket->customer_id)->first();
            if ($membership && $membership->point >= 10) {
                $membership->decrement('point', 10);
            }
        }

        $ticket->delete();

        return response()->json(['message' => 'Đã huỷ vé thành công']);
    }

    //Lọc thời gian
    public function filter(Request $request)
    {
        $query = Ticket::with(['showtime.movie', 'showtime.room']);

        // Nếu là Customer, chỉ lọc vé của chính họ
        if ($request->user()->tokenCan('customer')) {
            $query->where('customer_id', $request->user()->id);
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

}