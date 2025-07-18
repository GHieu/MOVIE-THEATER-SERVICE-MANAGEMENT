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
            'from_date' => [
                'nullable',
                'date', // Ngày hợp lệ
                'date_format:Y-m-d', // Định dạng ngày
                'before_or_equal:to_date', // Start Date <= End Date
                'before_or_equal:today', // Không được là ngày trong tương lai
            ],
            'to_date' => [
                'nullable',
                'date',
                'date_format:Y-m-d',
                'after_or_equal:from_date',
                'before_or_equal:today',
            ],
            // Ví dụ nếu có lọc theo số vé:
            // 'min_ticket' => [
            //     'nullable',
            //     'numeric', // Là số
            //     'integer', // Số nguyên
            //     'min:1',   // Số dương
            //     'max:100'  // Khoảng giá trị
            // ],
            // 'max_ticket' => [
            //     'nullable',
            //     'numeric',
            //     'integer',
            //     'min:1',
            //     'max:100'
            // ],
            // Ví dụ nếu có lọc theo tên khách hàng:
            // 'customer' => [
            //     'nullable',
            //     'string',
            //     'min:2',
            //     'max:100',
            //     'regex:/^[\pL\s\-\.]+$/u'
            // ],
        ]);

        //Giúp ngăn trường hợp ngày bắt đầu > ngày kết thúc, hoặc ngày không hợp lệ gây lỗi truy vấn.
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $query = Ticket::with(['showtime.movie', 'showtime.room', 'customer:id,name,email']);

        

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }
}