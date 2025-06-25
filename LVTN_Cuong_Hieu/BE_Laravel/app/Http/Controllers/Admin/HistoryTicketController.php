<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
use Illuminate\Support\Facades\Validator;
class HistoryTicketController extends Controller
{
    public function all()
    {
        $tickets = Ticket::with([
            'customer:id,name,email',
            'showtime.movie:id,title',
            'showtime.room:id,name,type',
            'details',
            'serviceOrders.service'
        ])
            ->orderByDesc('created_at')
            ->paginate(10); // Phân trang 10 vé mỗi lần

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
            'from_date' => 'nullable|date|before_or_equal:to_date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
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

        return response()->json($query->orderByDesc('created_at')->get());
    }
}