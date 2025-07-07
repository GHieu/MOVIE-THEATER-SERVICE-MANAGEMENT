<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ShowtimeSeatStatus extends Model
{
    use HasFactory;

    protected $fillable = [
        'showtime_id',
        'seat_id',
        'status'
    ];

    protected $casts = [
        'status' => 'string'
    ];

    /**
     * Relationship với Showtime
     */
    public function showtime(): BelongsTo
    {
        return $this->belongsTo(Showtime::class);
    }

    /**
     * Relationship với Seat
     */
    public function seat(): BelongsTo
    {
        return $this->belongsTo(Seat::class);
    }

    /**
     * Scope để lọc theo trạng thái
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeReversed($query)
    {
        return $query->where('status', 'reversed');
    }

    /**
     * Scope để lọc theo showtime
     */
    public function scopeForShowtime($query, $showtimeId)
    {
        return $query->where('showtime_id', $showtimeId);
    }

    /**
     * Scope để lọc theo seat
     */
    public function scopeForSeat($query, $seatId)
    {
        return $query->where('seat_id', $seatId);
    }

    /**
     * Kiểm tra ghế có available không
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    /**
     * Kiểm tra ghế có bị đặt không
     */
    public function isReversed(): bool
    {
        return $this->status === 'reversed';
    }

    /**
     * Đánh dấu ghế là available
     */
    public function markAsAvailable(): void
    {
        $this->update(['status' => 'available']);
    }

    /**
     * Đánh dấu ghế là reversed (đã đặt)
     */
    public function markAsReversed(): void
    {
        $this->update(['status' => 'reversed']);
    }

    /**
     * Tạo hoặc cập nhật trạng thái ghế
     */
    public static function updateOrCreateStatus($showtimeId, $seatId, $status = 'available')
    {
        return static::updateOrCreate(
            [
                'showtime_id' => $showtimeId,
                'seat_id' => $seatId
            ],
            [
                'status' => $status
            ]
        );
    }

    /**
     * Lấy trạng thái ghế theo showtime và seat
     */
    public static function getStatus($showtimeId, $seatId)
    {
        $record = static::where('showtime_id', $showtimeId)
            ->where('seat_id', $seatId)
            ->first();

        return $record ? $record->status : 'available';
    }

    /**
     * Lấy tất cả ghế available cho một showtime
     */
    public static function getAvailableSeatsForShowtime($showtimeId)
    {
        return static::with('seat')
            ->where('showtime_id', $showtimeId)
            ->where('status', 'available')
            ->get();
    }

    /**
     * Lấy tất cả ghế đã đặt cho một showtime
     */
    public static function getReversedSeatsForShowtime($showtimeId)
    {
        return static::with('seat')
            ->where('showtime_id', $showtimeId)
            ->where('status', 'reversed')
            ->get();
    }

    /**
     * Đếm số ghế available
     */
    public static function countAvailableSeats($showtimeId)
    {
        return static::where('showtime_id', $showtimeId)
            ->where('status', 'available')
            ->count();
    }

    /**
     * Đếm số ghế đã đặt
     */
    public static function countReversedSeats($showtimeId)
    {
        return static::where('showtime_id', $showtimeId)
            ->where('status', 'reversed')
            ->count();
    }
}