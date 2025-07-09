<?php

// app/Console/Kernel.php
namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Jobs\CancelExpiredTickets;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Chạy job hủy vé quá hạn mỗi 5 phút
        $schedule->job(new CancelExpiredTickets)->everyFiveMinutes();
    }

    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}