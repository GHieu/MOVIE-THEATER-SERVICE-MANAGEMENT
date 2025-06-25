<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;

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
}