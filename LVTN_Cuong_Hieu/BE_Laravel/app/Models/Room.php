<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'type',
        'seat_count',
        'status'
    ];

    protected $appends = ['status_text'];

    /**
     * Accessor để lấy text trạng thái
     */
    public function getStatusTextAttribute()
    {
        return match ($this->status) {
            0 => 'available',
            1 => 'unavailable',
            2 => 'under_maintenance',
            default => 'unknown',
        };
    }

    /**
     * Relationship với Seats
     */
    public function seats()
    {
        return $this->hasMany(Seat::class);
    }

    /**
     * Relationship với Showtimes
     */
    public function showtimes()
    {
        return $this->hasMany(Showtime::class);
    }

    /**
     * Kiểm tra phòng có suất chiếu đang hoạt động không
     */
    public function hasActiveShowtimes(): bool
    {
        return $this->showtimes()
            ->where('end_time', '>=', now())
            ->exists();
    }

    /**
     * Kiểm tra phòng có suất chiếu đã có vé đặt không
     */
    public function hasTicketedShowtimes(): bool
    {
        return $this->showtimes()
            ->whereHas('tickets')
            ->exists();
    }

    /**
     * Lấy danh sách suất chiếu sắp tới
     */
    public function getUpcomingShowtimes()
    {
        return $this->showtimes()
            ->where('start_time', '>', now())
            ->with('movie:id,title')
            ->orderBy('start_time', 'asc')
            ->get();
    }

    /**
     * Accessor để kiểm tra có thể xóa không
     */
    public function getCanDeleteAttribute(): bool
    {
        return !$this->hasActiveShowtimes() && !$this->hasTicketedShowtimes();
    }

    /**
     * Accessor để kiểm tra có thể cập nhật thông tin quan trọng không
     */
    public function getCanUpdateCriticalAttribute(): bool
    {
        return !$this->hasActiveShowtimes();
    }

    /**
     * Scope để lọc phòng theo trạng thái
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 0);
    }

    public function scopeUnavailable($query)
    {
        return $query->where('status', 1);
    }

    public function scopeUnderMaintenance($query)
    {
        return $query->where('status', 2);
    }

    /**
     * Scope để lọc phòng có thể xóa
     */
    public function scopeCanDelete($query)
    {
        return $query->whereDoesntHave('showtimes', function ($q) {
            $q->where('end_time', '>=', now());
        })->whereDoesntHave('showtimes', function ($q) {
            $q->whereHas('tickets');
        });
    }
}