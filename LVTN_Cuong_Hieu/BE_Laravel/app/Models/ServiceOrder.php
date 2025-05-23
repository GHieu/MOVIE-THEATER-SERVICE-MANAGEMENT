<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceOrder extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'ticket_id',
        'service_id',
        'promotion_id',
        'quantity'
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}