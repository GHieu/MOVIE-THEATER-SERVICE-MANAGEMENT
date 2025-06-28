<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
class Customer extends Authenticatable
{
    use HasFactory, HasApiTokens, Notifiable;
    protected $fillable = [
        'name',
        'birthdate',
        'gender',
        'phone',
        'address',
        'email',
        'password'
    ];

    protected $hidden = [
        'password',
        'rememeber_token',
    ];
    public function membership()
    {
        return $this->hasOne(Membership::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function giftHistories()
    {
        return $this->hasMany(GiftHistory::class);
    }
}