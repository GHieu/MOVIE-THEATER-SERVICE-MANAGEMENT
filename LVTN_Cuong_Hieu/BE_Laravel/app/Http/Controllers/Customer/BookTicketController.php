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
use App\Models\Promotion;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookTicketController extends Controller
{

    private function updateMemberType(Membership $membership)
    {
        if ($membership->total_points >= 1000) {
            $membership->member_type = 'Diamond';
        } elseif ($membership->total_points >= 300) {
            $membership->member_type = 'Gold';
        } else {
            $membership->member_type = 'Silver';
        }
        $membership->save();
    }

    // Đặt vé
    public function bookTicket(Request $request)
    {
        $validated = $request->validate([
            'showtime_id' => [
                'required',
                'integer', // is numeric, integer check
                'min:1',
                'exists:showtimes,id'
            ],
            'seats' => [
                'required',
                'array',
                'min:1',
                'max:10' // range check: tối đa 10 ghế/lần
            ],
            'seats.*' => [
                'required',
                'regex:/^[A-Z]{1}[0-9]{1,2}$/', // allowed characters, format check
            ],
            'services' => 'nullable|array|max:10',
            'services.*.service_id' => [
                'required_with:services',
                'integer',
                'min:1',
                'exists:services,id'
            ],
            'services.*.quantity' => [
                'required_with:services',
                'integer',      // integer check
                'min:1',        // positive
                'max:20'        // range check
            ],
            'promotion_id' => [
                'nullable',
                'integer',
                'min:1',
                'exists:promotions,id'
            ],
        ]);

        $customer = $request->user();

        DB::beginTransaction();
        try {
            $showtime = Showtime::findOrFail($request->showtime_id);
            $room_id = $showtime->room_id;

            $seatTotal = 0;
            foreach ($request->seats as $seatCode) {
                $row = substr($seatCode, 0, 1);
                $number = substr($seatCode, 1);
                $seat = Seat::where('room_id', $room_id)
                    ->where('seat_row', $row)
                    ->where('seat_number', $number)
                    ->firstOrFail();

                if ($seat->status !== 'available') {
                    throw new \Exception("Ghế $seatCode đã được đặt hoặc bị khoá.");
                }

                $seatTotal += $seat->price;
            }

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

            $discount = 0;
            $promotion = null;
            if ($request->filled('promotion_id')) {
                $promotion = Promotion::where('id', $request->promotion_id)
                    ->where('status', 'active')
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now())
                    ->first();

                if ($promotion) {
                    $amount = $seatTotal + $serviceTotal;
                    if ($promotion->discount_percent) {
                        $discount = $amount * $promotion->discount_percent / 100;
                    } elseif ($promotion->discount_amount) {
                        $discount = $promotion->discount_amount;
                    }
                }
            }

            $total = max(0, $seatTotal + $serviceTotal - $discount);

            $ticket = Ticket::create([
                'customer_id' => $customer->id,
                'showtime_id' => $showtime->id,
                'promotion_id' => $promotion->id ?? null,
                'total_price' => $total,
                'payment_method' => 'cash',
                'status' => 'paid',
            ]);

            $customer->notify(new \App\Notifications\TicketBooked($ticket));

            if ($ticket->status === 'paid') {
                $membership = Membership::where('customer_id', $customer->id)->first();
                if ($membership) {
                    $membership->increment('point', 10);
                    $membership->increment('total_points', 10);
                    $this->updateMemberType($membership);
                }
            }

            foreach ($request->seats as $seatCode) {
                $row = substr($seatCode, 0, 1);
                $number = substr($seatCode, 1);
                $seat = Seat::where('room_id', $room_id)
                    ->where('seat_row', $row)
                    ->where('seat_number', $number)
                    ->first();

                $seat->status = 'reversed';
                $seat->save();

                Ticket_details::create([
                    'ticket_id' => $ticket->id,
                    'seat_number' => $seatCode,
                    'price' => $seat->price
                ]);
            }

            foreach ($servicesData as $item) {
                ServiceOrder::create([
                    'ticket_id' => $ticket->id,
                    'service_id' => $item['service']->id,
                    'quantity' => $item['quantity'],
                    'promotion_id' => $promotion?->id
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

    // Huỷ vé
    public function cancel($id, Request $request)
    {
        $ticket = Ticket::with(['showtime', 'details', 'serviceOrders'])->where('id', $id)
            ->where('customer_id', $request->user()->id)
            ->firstOrFail();

        // Kiểm tra thời gian suất chiếu
        if ($ticket->showtime->start_time <= now()) {
            return response()->json(['message' => 'Không thể huỷ vé đã quá thời gian suất chiếu'], 400);
        }

        DB::beginTransaction();
        try {
            // Trừ điểm nếu đã thanh toán
            if ($ticket->status === 'paid') {
                $membership = Membership::where('customer_id', $ticket->customer_id)->first();
                if ($membership && $membership->point >= 10) {
                    $membership->decrement('point', 10);
                }
            }

            // Trả ghế về available
            foreach ($ticket->details as $detail) {
                $seat = Seat::where('room_id', $ticket->showtime->room_id)
                    ->whereRaw("CONCAT(seat_row, seat_number) = ?", [$detail->seat_number])
                    ->first();

                if ($seat) {
                    $seat->status = 'available';
                    $seat->save();
                }
            }
            $ticket->delete();

            DB::commit();
            return response()->json(['message' => 'Huỷ vé thành công']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi khi huỷ vé: ' . $e->getMessage()], 500);
        }
    }

    // Lọc lịch sử
    public function filter(Request $request)
    {
        $request->validate([
            'from_date' => [
                'nullable',
                'date_format:Y-m-d', // valid date format
                'date',              // valid date
                'before_or_equal:to_date' // range check
            ],
            'to_date' => [
                'nullable',
                'date_format:Y-m-d',
                'date',
                'after_or_equal:from_date',
                'before_or_equal:today' // future/past date check
            ]
        ]);

        $query = Ticket::with(['showtime.movie', 'showtime.room']);

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