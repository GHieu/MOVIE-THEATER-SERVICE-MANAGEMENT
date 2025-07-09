<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketCancelled extends Notification
{
    use Queueable;
    protected $ticket;

    public function __construct($ticket)
    {
        $this->ticket = $ticket;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Vé đã được hủy 🗑')
            ->greeting('Xin chào ' . $notifiable->name . '!')
            ->line('Vé của bạn cho suất chiếu: ' . $this->ticket->showtime->movie->title . ' đã được hủy.')
            ->line('Thời gian chiếu: ' . \Carbon\Carbon::parse($this->ticket->showtime->start_time)->format('d/m/Y H:i'))
            ->line('Mã vé: #' . $this->ticket->id)
            ->line('Nếu đây là sự nhầm lẫn, bạn có thể đặt vé lại.')
            ->action('Đặt lại vé', url('/movies'))
            ->line('Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!');
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}