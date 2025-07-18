import React, { useMemo } from 'react';

export default function DateTabs({ selectedDate, onDateChange }) {
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    
    // Fix: Đảm bảo sử dụng múi giờ địa phương nhất quán
    const todayDateString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    console.log('Today date string:', todayDateString);
    
    for (let i = 0; i < 7; i++) {
      // Tạo ngày bằng cách thêm ngày trực tiếp thay vì dùng setDate
      const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      
      // Tạo date string theo format YYYY-MM-DD
      const dateStr = currentDate.getFullYear() + '-' + 
        String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(currentDate.getDate()).padStart(2, '0');
      
      // Lấy tên ngày và ngày/tháng
      const dayName = currentDate.toLocaleDateString('vi-VN', { weekday: 'long' });
      const dayMonth = currentDate.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: 'numeric' 
      });
      
      console.log(`Date ${i}:`, {
        dateStr,
        dayName,
        dayMonth,
        isToday: i === 0
      });
      
      dates.push({
        key: dateStr,
        label: i === 0 ? 'Hôm Nay' : dayName,
        dayMonth: dayMonth,
        isToday: i === 0
      });
    }
    
    return dates;
  }, []);

  // Debug: Log để kiểm tra
  console.log('Available dates:', availableDates);
  console.log('Selected date:', selectedDate);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
      {availableDates.map(({ key, label, dayMonth, isToday }) => {
        const isActive = selectedDate === key;
        
        console.log(`Tab ${key}: selected=${selectedDate}, active=${isActive}`);
        
        return (
          <button
            key={key}
            onClick={() => onDateChange(key)}
            className={`w-28 px-4 py-3 rounded-xl transition-all whitespace-nowrap font-semibold text-sm border-2 ${
                isActive
                ? "bg-amber-300 text-white border-amber-400"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            >
            <div className="text-lg">{label}</div>
            <div className="text-xs opacity-80">{dayMonth}</div>
            </button>

        );
      })}
    </div>
  );
}