<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gift extends Model
{
    use HasFactory;

    protected $fillable = [
        'promotion_id',
        'name',
        'description',
        'point_required',
        'stock',
        'image'
    ];

    public function giftHistories()
    {
        return $this->hasMany(GiftHistory::class);
    }
}