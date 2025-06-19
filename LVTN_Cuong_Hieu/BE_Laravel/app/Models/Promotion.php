<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $fillable = [
        'title',
        'description',
        'discount_percent',
        'discount_amount',
        'apply_to',
        'start_date',
        'end_date',
        'status'
    ];
}