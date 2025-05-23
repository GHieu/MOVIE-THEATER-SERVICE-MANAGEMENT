<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiftHistory extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'customer_id',
        'gift_id',
        'exchanged_at'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function gift()
    {
        return $this->belongsTo(Gift::class);
    }
}