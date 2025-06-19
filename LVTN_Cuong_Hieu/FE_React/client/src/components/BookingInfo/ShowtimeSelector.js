// components/ShowtimeSelector.js
import React from 'react';

const ShowtimeSelector = ({ 
  otherShowtimes, 
  selectedTime, 
  formatTime, 
  onChangeShowtime 
}) => {
  if (otherShowtimes.length === 0) return null;

  // Tạo danh sách tất cả suất chiếu, bao gồm suất hiện tại
  const allShowtimes = [
    ...otherShowtimes,
    { id: 'current', start_time: selectedTime, show_time: selectedTime }
  ].sort((a, b) => {
    const timeA = a.start_time || a.show_time;
    const timeB = b.start_time || b.show_time;
    return new Date(timeA) - new Date(timeB); // Sắp xếp theo thời gian tăng dần
  });

  return (
    <div className="mb-4">
      <h2 className="font-semibold text-lg mb-2">Đổi suất chiếu</h2>
      <div className="flex gap-2 flex-wrap">
        {allShowtimes.slice(0, 10).map((showtime) => {
          const time = showtime.start_time || showtime.show_time;
          const isSelected = time === selectedTime;

          return (
            <button
              key={showtime.id}
              onClick={() => onChangeShowtime(time)}
              className={`px-4 py-2 rounded border font-semibold ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'border-blue-600 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {formatTime(time)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ShowtimeSelector;