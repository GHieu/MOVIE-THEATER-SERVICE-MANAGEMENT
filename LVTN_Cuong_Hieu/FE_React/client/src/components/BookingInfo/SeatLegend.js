// components/SeatLegend.js
import React from 'react';

// components/SeatLegend.js
const SeatLegend = () => {
  return (
    <div className="flex flex-wrap  gap-4 mb-6 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
        <span>Standard</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
        <span>VIP</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-4 bg-pink-100 border-2 border-pink-400 rounded flex items-center justify-center text-xs">💕</div>
        <span>Couple</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-orange-500 rounded"></div>
        <span>Ghế đang chọn</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded opacity-50"></div>
        <span>Đã đặt</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded opacity-30"></div>
        <span>Hỏng</span>
      </div>
    </div>
  );
};

export default SeatLegend;