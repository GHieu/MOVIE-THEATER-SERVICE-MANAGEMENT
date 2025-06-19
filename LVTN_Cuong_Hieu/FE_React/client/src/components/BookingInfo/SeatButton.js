// components/SeatButton.js
import React from 'react';

// components/SeatButton.js
const SeatButton = ({ 
  seatId, 
  col, 
  seatInfo, 
  isSelected, 
  onToggle 
}) => {
  if (!seatInfo) {
    return <div key={seatId} className="w-8 h-8 m-1" />;
  }

  const isUnavailable = seatInfo.status !== 'available';
  const isVip = seatInfo.type === 'vip';
  const isCouple = seatInfo.type === 'couple';
  const isBroken = seatInfo.status === 'broken';
  
  // Ghế couple có width gấp đôi
  const widthClass = isCouple ? 'w-16' : 'w-8';
  
  return (
    <button
      key={seatId}
      onClick={() => onToggle(seatId)}
      className={`${widthClass} h-8 m-1 rounded border text-sm font-semibold transition-all flex items-center justify-center ${
        isBroken
          ? "bg-gray-200 border-gray-400 cursor-not-allowed text-gray-500 opacity-30"
          : isUnavailable
          ? "bg-red-200 border-red-400 cursor-not-allowed opacity-50"
          : isSelected
          ? "bg-orange-500 text-white shadow-md"
          : isCouple
          ? "bg-pink-100 border-pink-400 hover:bg-pink-200"
          : isVip
          ? "bg-yellow-100 border-yellow-400 hover:bg-yellow-200"
          : "bg-blue-100 border-blue-400 hover:bg-blue-200"
      }`}
      disabled={isUnavailable}
      title={`Ghế ${seatId} - ${seatInfo.price.toLocaleString('vi-VN')}đ${isVip ? ' (VIP)' : isCouple ? ' (Couple)' : ''} + Giá suất chiếu`}
    >
      {isCouple ? '💕' : col}
    </button>
  );
};

export default SeatButton;