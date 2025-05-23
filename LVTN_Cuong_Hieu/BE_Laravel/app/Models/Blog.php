<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $fillable = [
        'admin_id',
        'title',
        'content',
        'image',
        'created_at'
    ];
    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}