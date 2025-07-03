<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\VNPayService;
use App\Models\Ticket;
use App\Models\Showtime;
use App\Models\Customer;
use App\Models\Membership;
use App\Models\Seat;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    protected $vnpayService;

    public function __construct(VNPayService $vnpayService)
    {
        $this->vnpayService = $vnpayService;
    }

    public function createPayment(Request $request)
    {
        $request->validate([
            'ticket_id' => 'required|exists:tickets,id',
        ]);

        $ticket = Ticket::with(['showtime.movie', 'details'])->find($request->ticket_id);

        if (!$ticket || $ticket->status !== 'pending') {
            return redirect()->back()->with('error', 'Vé không hợp lệ hoặc đã được thanh toán!');
        }

        $orderId = 'TICKET_' . $ticket->id . '_' . time();
        $amount = $ticket->total_price;
        $movieTitle = $ticket->showtime->movie->title ?? 'Vé xem phim';
        $seatNumbers = $ticket->details->pluck('seat_number')->implode(', ');
        $orderInfo = "Thanh toan ve xem phim: {$movieTitle} - Ghe: {$seatNumbers}";
        $ipAddr = $request->ip();

        // Lưu order_id vào ticket để tracking
        $ticket->update(['vnpay_order_id' => $orderId]);

        // Tạo URL thanh toán
        $paymentUrl = $this->vnpayService->createPaymentUrl($orderId, $amount, $orderInfo, $ipAddr);

        return redirect($paymentUrl);
    }

    public function vnpayReturn(Request $request)
    {
        $inputData = $request->all();

        // Validate response từ VNPay
        if ($this->vnpayService->validateResponse($inputData)) {
            $orderId = $inputData['vnp_TxnRef'];
            $amount = $inputData['vnp_Amount'] / 100;
            $responseCode = $inputData['vnp_ResponseCode'];
            $transactionNo = $inputData['vnp_TransactionNo'] ?? null;

            // Tìm ticket theo vnpay_order_id
            $ticket = Ticket::with(['showtime', 'details', 'customer'])->where('vnpay_order_id', $orderId)->first();

            if (!$ticket) {
                return redirect()->route('payment.failed')->with('error', 'Không tìm thấy vé!');
            }

            if ($responseCode == '00') {
                // Thanh toán thành công
                DB::transaction(function () use ($ticket, $transactionNo) {
                    $ticket->update([
                        'status' => 'paid',
                        'vnpay_transaction_no' => $transactionNo,
                        'paid_at' => now()
                    ]);

                    // Cập nhật trạng thái ghế từ reserved thành booked
                    $this->updateSeatStatus($ticket);

                    // Cập nhật điểm membership
                    $membership = Membership::where('customer_id', $ticket->customer_id)->first();
                    if ($membership) {
                        $membership->increment('point', 10);
                        $membership->increment('total_points', 10);
                        $this->updateMemberType($membership);
                    }

                    // Gửi notification
                    $ticket->customer->notify(new \App\Notifications\TicketBooked($ticket));
                });

                return redirect()->route('payment.success', ['ticket' => $ticket->id])
                    ->with('message', 'Thanh toán vé xem phim thành công!');
            } else {
                // Thanh toán thất bại - trả lại ghế về available
                DB::transaction(function () use ($ticket) {
                    $ticket->update(['status' => 'failed']);
                    $this->releaseSeatStatus($ticket);
                });

                return redirect()->route('payment.failed')
                    ->with('error', 'Thanh toán thất bại! Mã lỗi: ' . $responseCode);
            }
        } else {
            // Dữ liệu không hợp lệ
            return redirect()->route('payment.failed')->with('error', 'Dữ liệu không hợp lệ!');
        }
    }

    public function showTicketPayment($ticketId)
    {
        $ticket = Ticket::with(['showtime.movie', 'customer', 'details'])->find($ticketId);

        if (!$ticket || $ticket->status !== 'pending') {
            return redirect()->back()->with('error', 'Vé không hợp lệ hoặc đã được thanh toán!');
        }

        return view('payment.ticket-form', compact('ticket'));
    }

    public function paymentSuccess(Request $request)
    {
        $ticket = null;
        if ($request->has('ticket')) {
            $ticket = Ticket::with(['showtime.movie', 'customer', 'details'])->find($request->ticket);
        }

        return view('payment.success', compact('ticket'));
    }

    public function paymentFailed()
    {
        return view('payment.failed');
    }

    // Helper method để cập nhật trạng thái ghế thành booked
    private function updateSeatStatus($ticket)
    {
        foreach ($ticket->details as $detail) {
            $seat = Seat::where('room_id', $ticket->showtime->room_id)
                ->whereRaw("CONCAT(seat_row, seat_number) = ?", [$detail->seat_number])
                ->first();

            if ($seat) {
                $seat->status = 'booked';
                $seat->save();
            }
        }
    }

    // Helper method để trả lại ghế về available khi thanh toán thất bại
    private function releaseSeatStatus($ticket)
    {
        foreach ($ticket->details as $detail) {
            $seat = Seat::where('room_id', $ticket->showtime->room_id)
                ->whereRaw("CONCAT(seat_row, seat_number) = ?", [$detail->seat_number])
                ->first();

            if ($seat) {
                $seat->status = 'available';
                $seat->save();
            }
        }
    }

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
}