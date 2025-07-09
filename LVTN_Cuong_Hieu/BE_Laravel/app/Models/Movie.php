<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
    use HasFactory;
    protected $fillable = [
        'title',
        'description',
        'duration',
        'genre',
        'director',
        'cast',
        'nation',
        'studio',
        'poster',
        'banner',
        'age',
        'trailer_url',
        'release_date',
        'end_date',
        'status',
        'type'
    ];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function showtimes()
    {
        return $this->hasMany(Showtime::class);
    }

    // Sửa lại accessor - dùng $attributes thay vì $this->trailer_url
    public function getTrailerUrlAttribute()
    {
        return $this->attributes['trailer_url'] ? asset('storage/' . $this->attributes['trailer_url']) : null;
    }
}