<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Ticket;
use App\Models\Seat;

class AutoCancelUnpaidTickets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:auto-cancel-unpaid-tickets';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expired = now()->subMinutes(6);

        $tickets = Ticket::where('status', 'unpaid')
            ->where('created_at', '<=', $expired)
            ->get();

        foreach ($tickets as $ticket) {
            // Cập nhật ghế về trạng thái 'available'
            foreach ($ticket->ticket_details as $detail) {
                $row = substr($detail->seat_number, 0, 1);
                $number = substr($detail->seat_number, 1);
                $seat = Seat::where('seat_row', $row)
                    ->where('seat_number', $number)
                    ->whereHas('room.showtimes', function ($q) use ($ticket) {
                        $q->where('id', $ticket->showtime_id);
                    })->first();

                if ($seat) {
                    $seat->status = 'available';
                    $seat->save();
                }
            }

            // Xoá vé & chi tiết vé
            $ticket->ticket_details()->delete();
            $ticket->service_orders()->delete();
            $ticket->delete();
        }
    }
}