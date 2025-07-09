<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Ticket;
use App\Models\Seat;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class HandleTicketTimeout extends Command
{
    protected $signature = 'tickets:handle-timeout';
    protected $description = 'Handle timeout for unpaid tickets and release seats';

    public function handle()
    {
        $timeoutMinutes = config('vnpay.timeout_express', 6);
        $timeoutTime = Carbon::now()->subMinutes($timeoutMinutes);

        DB::transaction(function () use ($timeoutTime) {
            $expiredTickets = Ticket::with(['details', 'showtime'])
                ->where('status', 'pending')
                ->where('payment_method', 'vnpay')
                ->where('created_at', '<=', $timeoutTime)
                ->get();

            foreach ($expiredTickets as $ticket) {
                // Cập nhật status ticket thành expired
                $ticket->update(['status' => 'expired']);

                // Trả lại ghế về available
                foreach ($ticket->details as $detail) {
                    $seat = Seat::where('room_id', $ticket->showtime->room_id)
                        ->whereRaw("CONCAT(seat_row, seat_number) = ?", [$detail->seat_number])
                        ->first();

                    if ($seat && $seat->status === 'reserved') {
                        $seat->status = 'available';
                        $seat->save();
                    }
                }

                $this->info("Expired ticket ID: {$ticket->id}");
            }
        });

        $this->info('Ticket timeout handling completed.');
    }
}