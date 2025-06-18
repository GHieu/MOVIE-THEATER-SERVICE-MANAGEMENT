<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Membership extends Model
{
    use HasFactory;
    public $timestamps = false;

    protected $fillable = [
        'customer_id',
        'member_type',
        'point',
        'total_points' // mới thêm để lưu điểm tích lũy
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}