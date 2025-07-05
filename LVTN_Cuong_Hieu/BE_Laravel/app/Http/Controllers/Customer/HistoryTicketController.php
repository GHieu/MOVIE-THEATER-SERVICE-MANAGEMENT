<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
use Illuminate\Support\Facades\Validator;
use App\Models\Membership;
class HistoryTicketController extends Controller
{
    public function history(Request $request)
    {
        $tickets = Ticket::with(['showtime.movie', 'showtime.room', 'details', 'serviceOrders.service'])
            ->where('customer_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($tickets);
    }

    public function show($id)
    {
        $ticket = Ticket::with([
            'customer:id,name,email',
            'showtime.movie:id,title,duration',
            'showtime.room:id,name,type',
            'details',
            'serviceOrders.service'
        ])->findOrFail($id);

        return response()->json($ticket);
    }


    //Lọc vé theo thời gian
    public function filter(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'from_date' => [
                'nullable',
                'date_format:Y-m-d', // Kiểm tra định dạng ngày tháng hợp lệ
                'date',              // Kiểm tra ngày hợp lệ
                'before_or_equal:to_date' // Kiểm tra khoảng thời gian, start <= end
            ],
            'to_date' => [
                'nullable',
                'date_format:Y-m-d',
                'date',
                'after_or_equal:from_date',
                'before_or_equal:today' // Ngày không vượt quá hôm nay (quá khứ/hiện tại)
            ],
            // Nếu có lọc theo tổng tiền hoặc tuổi, bổ sung như sau:
            'total_min' => [
                'nullable',
                'numeric',      // is numeric
                'min:0',        // positive
                'max:100000000' // range check
            ],
            'total_max' => [
                'nullable',
                'numeric',
                'min:0',
                'max:100000000',
                'gte:total_min' // range check, max >= min
            ],
            'age' => [
                'nullable',
                'integer',      // integer check
                'min:10',       // min age
                'max:120'       // max age
            ]
        ]);

        //Giúp ngăn trường hợp ngày bắt đầu > ngày kết thúc, hoặc ngày không hợp lệ gây lỗi truy vấn.
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

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

        if ($request->has('total_min')) {
            $query->where('total_price', '>=', $request->total_min);
        }
        if ($request->has('total_max')) {
            $query->where('total_price', '<=', $request->total_max);
        }
        if ($request->has('age')) {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('age', $request->age);
            });
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }
}