<?php

namespace App\Jobs;

use App\Models\Ticket;
use App\Models\Seat;
use App\Models\ShowtimeSeatStatus;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CancelExpiredTickets implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct()
    {
        //
    }

    public function handle()
    {
        $expiredTickets = Ticket::where('status', 'pending')
            ->where('created_at', '<', now()->subMinutes(6))
            ->with(['details', 'showtime'])
            ->get();

        foreach ($expiredTickets as $ticket) {
            DB::beginTransaction();
            try {
                // Trả ghế về available
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

                $ticket->update(['status' => 'cancelled']);

                DB::commit();

                Log::info("Cancelled expired ticket: {$ticket->id}");
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error cancelling expired ticket {$ticket->id}: " . $e->getMessage());
            }
        }

        Log::info("Cancelled {$expiredTickets->count()} expired tickets");
    }
}