// components/SpendingMeter.js
import React from 'react';
import { Star, Award, Gem } from 'lucide-react';

const SpendingMeter = ({ 
  currentAmount = 0, // total_points từ useMembership
  maxAmount = 1000, // Mốc tối đa để đạt Diamond
  title = "Tiến độ tích ⭐ thành viên",
  unit = "điểm"
}) => {
  // Tính toán percentage với trọng số nhấn mạnh mốc 300
  const calculatePercentage = () => {
    if (currentAmount <= 300) {
      return (currentAmount / 300) * 50; // 0-300 chiếm 50% thanh
    } else {
      return 50 + ((currentAmount - 300) / (1000 - 300)) * 50; // 300-1000 chiếm 50% còn lại
    }
  };

  const percentage = Math.min(calculatePercentage(), 100);

  const formatNumber = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatUnit = (amount) => {
    return `${formatNumber(amount)} ${unit}`;
  };

  // Tạo các mốc milestone dựa trên logic membership
  const milestones = [
    { value: 0, label: formatUnit(0), tier: 'Silver' },
    { value: 300, label: formatUnit(300), tier: 'Gold' },
    { value: 1000, label: formatUnit(1000), tier: 'Diamond' }
  ];

  // Xác định hạng thành viên hiện tại
  const getCurrentTier = () => {
    if (currentAmount >= 1000) return 'Diamond';
    if (currentAmount >= 300) return 'Gold';
    return 'Silver';
  };

  const currentTier = getCurrentTier();

  return (
    <div className="bg-white border-t border-b border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {title}
        </h3>
        <div className="flex items-center text-2xl font-bold text-yellow-600">
          {formatUnit(currentAmount)} 
          <span className={`ml-1 px-2 py-0.5 rounded-full text-sm font-semibold ${
            currentTier === 'Diamond' ? 'bg-purple-100 text-purple-800' :
            currentTier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {currentTier === 'Diamond' ? 'Kim Cương' :
             currentTier === 'Gold' ? 'Vàng' : 'Bạc'}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Icons and labels container */}
        <div className="space-y-2">
          {/* Icon row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex justify-center items-center w-full max-w-[80px] mx-auto">
              <Star className={`w-5 h-5 text-gray-300 fill-gray-200 ${currentAmount >= 0 ? 'scale-110' : ''}`} />
            </div>
            <div className="flex justify-center items-center w-full max-w-[80px] mx-auto">
              <Award className={`w-5 h-5 text-yellow-600 fill-red-700  ${currentAmount >= 300 ? 'scale-110' : ''}`} />
            </div>
            <div className="flex justify-center items-center w-full max-w-[80px] mx-auto">
              <Gem className={`w-5 h-5 text-purple-600 fill-blue-300 ${currentAmount >= 1000 ? 'scale-110' : ''}`} />
            </div>
          </div>
          
          {/* Milestone labels */}
          <div className="grid grid-cols-3 gap-2">
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className={`text-center text-xs w-full max-w-[80px] mx-auto ${
                  currentAmount >= milestone.value 
                    ? 'text-yellow-600 font-semibold' 
                    : 'text-gray-400'
                }`}
              >
                {milestone.label}
                <div className="text-xs mt-1">
                  {milestone.tier === 'Diamond' ? 'Kim Cương' :
                   milestone.tier === 'Gold' ? 'Vàng' : 'Bạc'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Progress bar container */}
        <div className="relative mt-4">
          {/* Background bar */}
          <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
            {/* Progress bar with gradient */}
            <div 
              className={`h-full transition-all duration-700 ease-out relative overflow-hidden ${
                currentTier === 'Diamond' ? 'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600' :
                currentTier === 'Gold' ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600' :
                'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600'
              }`}
              style={{ width: `${percentage}%` }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse"></div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-75 blur-sm"></div>
            </div>
          </div>
          
          {/* Progress indicator dot */}
          {percentage > 0 && (
            <div
              className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-white rounded-full shadow-lg transition-all duration-700 ease-out ${
                currentTier === 'Diamond' ? 'bg-purple-500' :
                currentTier === 'Gold' ? 'bg-yellow-500' : 'bg-gray-500'
              }`}
              style={{ left: `calc(${percentage}% - 8px)` }}
            >
              <div className={`w-full h-full rounded-full animate-ping opacity-75 ${
                currentTier === 'Diamond' ? 'bg-purple-400' :
                currentTier === 'Gold' ? 'bg-yellow-400' : 'bg-gray-400'
              }`}></div>
            </div>
          )}
        </div>
        
        {/* Progress percentage */}
        <div className="text-center mt-2">
          <span className="text-sm text-gray-600">
            Tiến độ: {percentage.toFixed(1)}%
          </span>
        </div>
        
        {/* Milestone notifications */}
        {currentAmount >= 300 && currentAmount < 1000 && (
          <div className="text-sm text-green-600 mt-2 text-center">
            Chúc mừng! Bạn đã đạt hạng Vàng. Tích lũy thêm {1000 - currentAmount} điểm để lên hạng Kim Cương!
          </div>
        )}
        {currentAmount >= 1000 && (
          <div className="text-sm text-purple-600 mt-2 text-center">
            Chúc mừng! Bạn đã đạt hạng Kim Cương - hạng cao nhất!
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingMeter;