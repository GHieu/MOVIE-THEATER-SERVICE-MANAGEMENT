<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    use HasFactory;
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