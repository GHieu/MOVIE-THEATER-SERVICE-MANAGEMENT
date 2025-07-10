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
use App\Models\ShowtimeSeatStatus;
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

    public static function updateOrCreateStatus($showtimeId, $seatId, $status)
    {
        ShowtimeSeatStatus::updateOrCreate(
            ['showtime_id' => $showtimeId, 'seat_id' => $seatId],
            ['status' => $status]
        );
    }

    public function bookTicket(Request $request)
    {
        $validated = $request->validate([
            'showtime_id' => [
                'required',
                'integer',
                'min:1',
                'exists:showtimes,id'
            ],
            'seats' => [
                'required',
                'array',
                'min:1',
                'max:10'
            ],
            'seats.*' => [
                'required',
                'regex:/^[A-Z]{1}[0-9]{1,2}$/',
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
                'integer',
                'min:1',
                'max:20'
            ],
            'promotion_id' => [
                'nullable',
                'integer',
                'min:1',
                'exists:promotions,id'
            ],
            'payment_method' => [
                'required',
                'in:cash,vnpay'
            ],
        ]);

        $customer = $request->user();

        DB::beginTransaction();
        try {
            $showtime = Showtime::findOrFail($request->showtime_id);
            $room_id = $showtime->room_id;

            // Tính tiền ghế
            $seatTotal = 0;
            foreach ($request->seats as $seatCode) {
                $row = substr($seatCode, 0, 1);
                $number = substr($seatCode, 1);
                $seat = Seat::where('room_id', $room_id)
                    ->where('seat_row', $row)
                    ->where('seat_number', $number)
                    ->firstOrFail();
                $status = ShowtimeSeatStatus::getStatus($showtime->id, $seat->id);

                if ($status === 'reversed') {
                    throw new \Exception("Ghế $seatCode đã được đặt.");
                }

                $seatTotal += $seat->price;
            }

            // Tính tiền suất chiếu
            $showtimeTotal = $showtime->price * count($request->seats);

            // Tính tiền dịch vụ
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

            // Tính discount
            $discount = 0;
            $promotion = null;
            if ($request->filled('promotion_id')) {
                $promotion = Promotion::where('id', $request->promotion_id)
                    ->where('status', 1) // ✅ Đúng kiểu tinyint (1 = đang hoạt động)
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now())
                    ->first();


                if ($promotion) {
                    $amount = $seatTotal + $showtimeTotal + $serviceTotal;

                    if (!is_null($promotion->discount_percent) && $promotion->discount_percent > 0) {
                        $discount = $amount * $promotion->discount_percent / 100;
                    } elseif (!is_null($promotion->discount_amount) && $promotion->discount_amount > 0) {
                        $discount = $promotion->discount_amount;
                    }
                }
            }

            // Tính tổng tiền cuối cùng
            $total = max(0, $seatTotal + $showtimeTotal + $serviceTotal - $discount);

            // Tạo vé với status pending nếu thanh toán VNPay
            $status = $request->payment_method === 'vnpay' ? 'pending' : 'paid';

            $ticket = Ticket::create([
                'customer_id' => $customer->id,
                'showtime_id' => $showtime->id,
                'promotion_id' => $promotion->id ?? null,
                'total_price' => $total,
                'payment_method' => $request->payment_method,
                'status' => $status,
                'paid_at' => $status === 'paid' ? now() : null,
            ]);

            // Tạo chi tiết vé và cập nhật trạng thái ghế
            foreach ($request->seats as $seatCode) {
                $row = substr($seatCode, 0, 1);
                $number = substr($seatCode, 1);
                $seat = Seat::where('room_id', $room_id)
                    ->where('seat_row', $row)
                    ->where('seat_number', $number)
                    ->first();
                // ✅ FIXED: Chỉ cập nhật ShowtimeSeatStatus, không touch bảng seats
                ShowtimeSeatStatus::updateOrCreateStatus($showtime->id, $seat->id, 'reversed');

                Ticket_details::create([
                    'ticket_id' => $ticket->id,
                    'seat_number' => $seatCode,
                    'price' => $seat->price
                ]);
            }

            // Tạo service orders
            foreach ($servicesData as $item) {
                ServiceOrder::create([
                    'ticket_id' => $ticket->id,
                    'service_id' => $item['service']->id,
                    'quantity' => $item['quantity'],
                    'promotion_id' => $promotion?->id
                ]);
            }

            DB::commit();

            // Nếu thanh toán bằng VNPay, tạo URL thanh toán
            if ($request->payment_method === 'vnpay') {
                $vnpayUrl = $this->createVNPayPayment($ticket);
                return response()->json([
                    'message' => 'Vé đã được tạo, vui lòng thanh toán',
                    'ticket_id' => $ticket->id,
                    'payment_url' => $vnpayUrl,
                    'total' => $total,
                    'breakdown' => [
                        'seat_total' => $seatTotal,
                        'showtime_total' => $showtimeTotal,
                        'service_total' => $serviceTotal,
                        'discount' => $discount,
                        'final_total' => $total
                    ]
                ]);
            }

            // Thanh toán tiền mặt
            if ($ticket->status === 'paid') {
                $membership = Membership::where('customer_id', $customer->id)->first();
                if ($membership) {
                    $membership->increment('point', 10);
                    $membership->increment('total_points', 10);
                    $this->updateMemberType($membership);
                }
            }

            $customer->notify(new \App\Notifications\TicketBooked($ticket));

            return response()->json([
                'message' => 'Đặt vé thành công!',
                'ticket_id' => $ticket->id,
                'total' => $total,
                'breakdown' => [
                    'seat_total' => $seatTotal,
                    'showtime_total' => $showtimeTotal,
                    'service_total' => $serviceTotal,
                    'discount' => $discount,
                    'final_total' => $total
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi đặt vé: ' . $e->getMessage()
            ], 500);
        }
    }

    private function createVNPayPayment(Ticket $ticket)
    {
        $vnp_TmnCode = config('vnpay.tmn_code');
        $vnp_HashSecret = config('vnpay.hash_secret');
        $vnp_Url = config('vnpay.url');
        $vnp_Returnurl = config('vnpay.return_url');

        $vnp_TxnRef = 'TICKET_' . $ticket->id . '_' . time();
        $vnp_OrderInfo = "Thanh toán vé xem phim #" . $ticket->id;
        $vnp_OrderType = "billpayment";
        $vnp_Amount = $ticket->total_price * 100;
        $vnp_Locale = "vn";
        $vnp_BankCode = "";
        $vnp_IpAddr = request()->ip();

        $ticket->update(['vnpay_order_id' => $vnp_TxnRef]);

        $inputData = array(
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef,
        );

        if (isset($vnp_BankCode) && $vnp_BankCode != "") {
            $inputData['vnp_BankCode'] = $vnp_BankCode;
        }

        ksort($inputData);
        $query = "";
        $i = 0;
        $hashdata = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnp_Url = $vnp_Url . "?" . $query;
        if (isset($vnp_HashSecret)) {
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
            $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
        }

        return $vnp_Url;
    }

    public function vnpayCallback(Request $request)
    {
        $vnp_HashSecret = config('vnpay.hash_secret');
        $vnp_SecureHash = $request->vnp_SecureHash;

        $inputData = array();
        foreach ($request->all() as $key => $value) {
            if (substr($key, 0, 4) == "vnp_") {
                $inputData[$key] = $value;
            }
        }

        unset($inputData['vnp_SecureHash']);
        ksort($inputData);
        $hashData = "";
        $i = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        if ($secureHash == $vnp_SecureHash) {
            $vnpayOrderId = $request->vnp_TxnRef;
            $ticket = Ticket::with(['details', 'showtime.movie', 'showtime.room', 'serviceOrders.service'])
                ->where('vnpay_order_id', $vnpayOrderId)
                ->firstOrFail();

            if ($request->vnp_ResponseCode == '00') {
                // Thanh toán thành công
                DB::beginTransaction();
                try {
                    $ticket->update([
                        'status' => 'paid',
                        'vnpay_transaction_no' => $request->vnp_TransactionNo,
                        'paid_at' => now()
                    ]);

                    foreach ($ticket->details as $detail) {
                        $seat = Seat::where('room_id', $ticket->showtime->room_id)
                            ->whereRaw("CONCAT(seat_row, seat_number) = ?", [$detail->seat_number])
                            ->first();

                        if ($seat) {
                            ShowtimeSeatStatus::updateOrCreate(
                                ['showtime_id' => $ticket->showtime_id, 'seat_id' => $seat->id],
                                ['status' => 'reversed']
                            );
                        }
                    }

                    // Cập nhật điểm thành viên
                    $membership = Membership::where('customer_id', $ticket->customer_id)->first();
                    if ($membership) {
                        $membership->increment('point', 10);
                        $membership->increment('total_points', 10);
                        $this->updateMemberType($membership);
                    }

                    // Chuẩn bị dữ liệu để redirect
                    $selectedSeats = $ticket->details->pluck('seat_number')->toArray();
                    $services = $ticket->serviceOrders->map(function ($order) {
                        return [
                            'id' => $order->service_id,
                            'name' => $order->service->name,
                            'quantity' => $order->quantity
                        ];
                    })->toArray();

                    $queryParams = [
                        'ticket_id' => $ticket->id,
                        'movie_title' => $ticket->showtime->movie->title,
                        'cinema_name' => 'AbsoluteCinema', // Thay bằng tên rạp thực tế nếu có
                        'formatted_date' => $ticket->showtime->start_time->format('d/m/Y'),
                        'formatted_time' => $ticket->showtime->start_time->format('H:i'),
                        'selected_seats' => json_encode($selectedSeats),
                        'final_total' => $ticket->total_price,
                        'payment_method' => 'vnpay',
                        'payment_status' => 'completed',
                        'services' => json_encode($services),
                        'vnp_TxnRef' => $vnpayOrderId,
                        'vnp_ResponseCode' => $request->vnp_ResponseCode,
                        'vnp_TransactionStatus' => $request->vnp_TransactionStatus,
                    ];

                    if ($ticket->promotion_id) {
                        $queryParams['voucher'] = $ticket->promotion_id;
                    }

                    DB::commit();

                    // Redirect đến trang order-success với query parameters
                    $redirectUrl = config('app.frontend_url') . '/order-success?' . http_build_query($queryParams);
                    return redirect($redirectUrl);

                } catch (\Exception $e) {
                    DB::rollBack();
                    // Redirect với lỗi
                    $redirectUrl = config('app.frontend_url') . '/order-success?error=' . urlencode('Lỗi khi cập nhật thanh toán: ' . $e->getMessage());
                    return redirect($redirectUrl);
                }
            } else {
                // Thanh toán thất bại
                $this->cancelUnpaidTicket($ticket);
                $redirectUrl = config('app.frontend_url') . '/order-success?error=' . urlencode('Thanh toán thất bại! Vé đã được hủy.') . '&ticket_id=' . $ticket->id . '&payment_status=cancelled';
                return redirect($redirectUrl);
            }
        } else {
            // Chữ ký không hợp lệ
            $redirectUrl = config('app.frontend_url') . '/order-success?error=' . urlencode('Chữ ký không hợp lệ');
            return redirect($redirectUrl);
        }
    }

    private function cancelUnpaidTicket(Ticket $ticket)
    {
        DB::beginTransaction();
        try {
            // ✅ FIXED: Chỉ cập nhật ShowtimeSeatStatus về 'available'
            foreach ($ticket->details as $detail) {
                $seat = Seat::where('room_id', $ticket->showtime->room_id)
                    ->whereRaw("CONCAT(seat_row, seat_number) = ?", [$detail->seat_number])
                    ->first();

                if ($seat) {
                    ShowtimeSeatStatus::where('showtime_id', $ticket->showtime_id)
                        ->where('seat_id', $seat->id)
                        ->update(['status' => 'available']);
                    // ✅ REMOVED: Không cập nhật bảng seats
                }
            }

            $ticket->update(['status' => 'cancelled']);

            $ticket->customer->notify(new \App\Notifications\TicketCancelled($ticket));

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function checkPaymentStatus($ticketId, Request $request)
    {
        $ticket = Ticket::where('id', $ticketId)
            ->where('customer_id', $request->user()->id)
            ->firstOrFail();

        $timeRemaining = null;
        if ($ticket->status === 'pending') {
            $createdAt = $ticket->created_at;
            $expiresAt = $createdAt->addMinutes(15);
            $timeRemaining = max(0, $expiresAt->diffInSeconds(now()));
        }

        return response()->json([
            'ticket_id' => $ticket->id,
            'status' => $ticket->status,
            'total_price' => $ticket->total_price,
            'payment_method' => $ticket->payment_method,
            'vnpay_order_id' => $ticket->vnpay_order_id,
            'vnpay_transaction_no' => $ticket->vnpay_transaction_no,
            'paid_at' => $ticket->paid_at,
            'time_remaining' => $timeRemaining,
            'created_at' => $ticket->created_at,
        ]);
    }

    public function cancelExpiredTickets()
    {
        $expiredTickets = Ticket::where('status', 'pending')
            ->where('created_at', '<', now()->subMinutes(15))
            ->get();

        foreach ($expiredTickets as $ticket) {
            $this->cancelUnpaidTicket($ticket);
        }

        return response()->json([
            'message' => 'Đã hủy ' . $expiredTickets->count() . ' vé quá hạn thanh toán'
        ]);
    }

    public function cancel($id, Request $request)
    {
        $ticket = Ticket::with(['showtime', 'details', 'serviceOrders'])->where('id', $id)
            ->where('customer_id', $request->user()->id)
            ->firstOrFail();

        if ($ticket->showtime->start_time <= now()) {
            return response()->json(['message' => 'Không thể huỷ vé đã quá thời gian suất chiếu'], 400);
        }

        if ($ticket->status === 'pending') {
            return response()->json(['message' => 'Không thể hủy vé đang chờ thanh toán'], 400);
        }

        DB::beginTransaction();
        try {
            if ($ticket->status === 'paid') {
                $membership = Membership::where('customer_id', $ticket->customer_id)->first();
                if ($membership && $membership->point >= 10) {
                    $membership->decrement('point', 10);
                }
            }

            // ✅ Xoá các service orders liên quan
            $ticket->serviceOrders()->delete();

            // ✅ Xoá trạng thái ghế (ShowtimeSeatStatus)
            foreach ($ticket->details as $detail) {
                $seat = Seat::where('room_id', $ticket->showtime->room_id)
                    ->whereRaw("CONCAT(seat_row, seat_number) = ?", [$detail->seat_number])
                    ->first();

                if ($seat) {
                    ShowtimeSeatStatus::where('showtime_id', $ticket->showtime_id)
                        ->where('seat_id', $seat->id)
                        ->update(['status' => 'available']);
                }
            }

            // ✅ Xoá chi tiết vé
            $ticket->details()->delete();

            // ✅ Xoá vé
            $ticket->delete();
            // Gửi thông báo hủy vé
            $ticket->customer->notify(new \App\Notifications\TicketCancelled($ticket)); // 👈 THÊM DÒNG NÀY
            DB::commit();
            return response()->json(['message' => 'Huỷ vé thành công']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi khi huỷ vé: ' . $e->getMessage()], 500);
        }
    }

    public function filter(Request $request)
    {
        $request->validate([
            'from_date' => [
                'nullable',
                'date_format:Y-m-d',
                'date',
                'before_or_equal:to_date'
            ],
            'to_date' => [
                'nullable',
                'date_format:Y-m-d',
                'date',
                'after_or_equal:from_date',
                'before_or_equal:today'
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

    public function getSeatsByShowtime($showtime_id)
    {
        $showtime = Showtime::with('room.seats')->findOrFail($showtime_id);
        $seats = $showtime->room->seats;

        $statuses = ShowtimeSeatStatus::where('showtime_id', $showtime_id)
            ->pluck('status', 'seat_id');

        $result = $seats->map(function ($seat) use ($statuses) {
            return [
                'id' => $seat->id,
                'row' => $seat->seat_row,
                'number' => $seat->seat_number,
                'price' => $seat->price,
                'seat_type' => $seat->seat_type,
                'status' => $statuses[$seat->id] ?? 'available'
            ];
        });

        return response()->json($result);
    }
}