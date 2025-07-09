<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'showtime_id',
        'promotion_id',
        'total_price',
        'status',
        'payment_method',
        'vnpay_order_id',
        'vnpay_transaction_no',
        'paid_at'
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function showtime()
    {
        return $this->belongsTo(Showtime::class);
    }

    public function seat()
    {
        return $this->belongsTo(Seat::class);
    }

    public function promotion()
    {
        return $this->belongsTo(Promotion::class);
    }

    public function details()
    {
        return $this->hasMany(Ticket_details::class, 'ticket_id'); // Đảm bảo dùng đúng tên khoá
    }

    public function serviceOrders()
    {
        return $this->hasMany(ServiceOrder::class);
    }
}