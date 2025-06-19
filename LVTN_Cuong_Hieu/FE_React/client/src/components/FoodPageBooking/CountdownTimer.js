import React from 'react';

const CountdownTimer = ({ timeLeft }) => {
  // Hàm format thời gian countdown
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 60) return 'text-red-600 animate-pulse'; // Dưới 1 phút: đỏ và nhấp nháy
    if (timeLeft <= 120) return 'text-orange-600'; // Dưới 2 phút: cam
    return 'text-orange-600'; // Bình thường: cam
  };

  const getTimerBg = () => {
    if (timeLeft <= 60) return 'bg-red-50 border-red-200';
    if (timeLeft <= 120) return 'bg-orange-50 border-orange-200';
    return 'bg-orange-50 border-orange-200';
  };

  return (
    <>
      <div className={`text-sm font-semibold mb-2 p-2 rounded border ${getTimerBg()}`}>
        <div className={`${getTimerColor()} flex items-center justify-between`}>
          <span>⏰ Thời gian giữ ghế:</span>
          <span className="text-lg font-mono">{formatTime(timeLeft)}</span>
        </div>
        {timeLeft <= 60 && (
          <div className="text-xs text-red-500 mt-1 text-center">
            Sắp hết thời gian! Vui lòng hoàn tất đặt vé.
          </div>
        )}
      </div>
      
      
    </>
  );
};

export default CountdownTimer;