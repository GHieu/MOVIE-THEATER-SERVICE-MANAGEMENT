<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
class Admin extends Model
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

    public function blogs()
    {
        return $this->hasMany(Blog::class);
    }
}