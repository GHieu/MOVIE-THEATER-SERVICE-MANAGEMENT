<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
class Showtime extends Model
{
    protected $fillable = [
        'movie_id',
        'room_id',
        'promotion_id',
        'start_time',
        'end_time',
        'price'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'price' => 'decimal:2'
    ];

    /**
     * Relationship với Movie
     */
    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class);
    }

    /**
     * Relationship với Room
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }


    /**
     * Relationship với Promotion
     */
    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    /**
     * Relationship với Tickets - Đây là phần bạn đang thiếu
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    /**
     * Scope để lọc suất chiếu theo trạng thái
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_time', '>', now());
    }

    // Thêm vào trong class Showtime
    public function serializeDate(\DateTimeInterface $date)
    {
        return Carbon::instance($date)
            ->setTimezone('Asia/Ho_Chi_Minh')
            ->format('Y-m-d H:i:s');
    }

    public function scopeOngoing($query)
    {
        return $query->where('start_time', '<=', now())
            ->where('end_time', '>=', now());
    }

    public function scopeFinished($query)
    {
        return $query->where('end_time', '<', now());
    }

    /**
     * Accessor để kiểm tra trạng thái suất chiếu
     */
    public function getStatusAttribute()
    {
        $now = now();

        if ($this->start_time > $now) {
            return 'upcoming';
        } elseif ($this->start_time <= $now && $this->end_time >= $now) {
            return 'ongoing';
        } else {
            return 'finished';
        }
    }

    /**
     * Accessor để kiểm tra có thể chỉnh sửa không
     */
    public function getCanEditAttribute()
    {
        return $this->start_time > now()->addMinutes(30);
    }

    /**
     * Accessor để kiểm tra có thể xóa không
     */
    public function getCanDeleteAttribute()
    {
        return $this->start_time > now() && !$this->tickets()->exists();
    }
    
    public function seatStatuses(): HasMany
    {
        return $this->hasMany(ShowtimeSeatStatus::class);
    }
}