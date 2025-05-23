<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $fillable = [
        'customer_id',
        'movie_id',
        'rating',
        'created_at'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }
}