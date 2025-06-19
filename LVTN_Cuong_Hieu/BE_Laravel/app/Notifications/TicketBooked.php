<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketBooked extends Notification
{
    use Queueable;
    protected $ticket;
    /**
     * Create a new notification instance.
     */
    public function __construct($ticket)
    {
        $this->ticket = $ticket;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Xác nhận đặt vé thành công 🎉')
            ->greeting('Xin chào ' . $notifiable->name . '!')
            ->line('Bạn đã đặt vé thành công cho suất chiếu: ' . $this->ticket->showtime->movie->title)
            ->line('Thời gian chiếu: ' . \Carbon\Carbon::parse($this->ticket->showtime->start_time)->format('d/m/Y H:i'))
            ->line('Tổng tiền: ' . number_format($this->ticket->total_price) . ' VNĐ')
            ->line('Mã vé: #' . $this->ticket->id)
            ->action('Xem chi tiết vé', url('/tickets/' . $this->ticket->id))
            ->line('Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}