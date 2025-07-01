<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiftHistory extends Model
{
    use HasFactory;
    protected $table = 'gift_history'; // ← THÊM DÒNG NÀY

    public $timestamps = false;

    protected $fillable = [
        'customer_id',
        'gift_id',
        'exchanged_at',
        'image'
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