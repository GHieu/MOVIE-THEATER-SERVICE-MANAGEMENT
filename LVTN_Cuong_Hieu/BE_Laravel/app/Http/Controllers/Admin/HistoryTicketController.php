<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
class HistoryTicketController extends Controller
{
    public function all()
    {
        $tickets = Ticket::with(['customer', 'showtime.movie', 'showtime.room', 'ticketDetails', 'serviceOrders.service'])
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
            'ticketDetails',
            'serviceOrders.service'
        ])->findOrFail($id);

        return response()->json($ticket);
    }

    //Lọc vé theo thời gian
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