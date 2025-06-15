<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Ticket;
use App\Models\Ticket_details;
use App\Models\ServiceOrder;

class TicketController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'showtime_id' => 'required|exists:showtimes,id',
            'seats' => 'required|array|min:1',
            'seats.*.id' => 'required|exists:seats,id',
            'services' => 'nullable|array',
            'services.*.id' => 'required|exists:services,id',
            'services.*.quantity' => 'required|integer|min:1',
            'promotion_id' => 'nullable|exists:promotions,id'
        ]);

        DB::beginTransaction();
        try {
            $ticket = Ticket::create([
                'customer_id' => auth()->id(),
                'showtime_id' => $request->showtime_id,
                'promotion_id' => $request->promotion_id,
                'payment_status' => 1
            ]);

            foreach ($request->seats as $seat) {
                Ticket_details::create([
                    'ticket_id' => $ticket->id,
                    'seat_id' => $seat['id'],
                    'showtime_id' => $request->showtime_id
                ]);
            }

            if ($request->has('services')) {
                foreach ($request->services as $svc) {
                    ServiceOrder::create([
                        'ticket_id' => $ticket->id,
                        'service_id' => $svc['id'],
                        'quantity' => $svc['quantity'],
                    ]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Đặt vé thành công', 'ticket' => $ticket]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Lỗi đặt vé'], 500);
        }
    }
}