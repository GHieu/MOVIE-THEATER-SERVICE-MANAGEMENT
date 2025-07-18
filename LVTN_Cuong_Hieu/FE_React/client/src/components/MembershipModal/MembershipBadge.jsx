import React from 'react';
import PointsDisplay from './PointsDisplay';
import { Star } from "lucide-react";
const MembershipBadge = ({ memberType, points, onClick, showPoints = true, isUpdating = false }) => {
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'Silver':
        return {
          bg: 'bg-gray-400',
          text: 'text-white',
          icon: <Star  color="#C0C0C0" fill="#C0C0C0" />,
        };
      case 'Gold':
        return {
          bg: 'bg-yellow-400',
          text: 'text-yellow-900',
          icon: '🏅',
        };
      case 'Diamond':
        return {
          bg: 'bg-blue-400',
          text: 'text-blue-900',
          icon: '💎',
        };
      default:
        return {
          bg: 'bg-gray-300',
          text: 'text-gray-700',
          icon: '🎫',
        };
    }
  };

  const style = getBadgeStyle(memberType);

  return (
    <div
      className={`${style.bg} ${style.text} px-3 py-1 rounded-full text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity flex items-center space-x-1 ${
        isUpdating ? 'opacity-60' : ''
      }`}
      onClick={onClick}
      title={`Thẻ ${memberType}${showPoints ? ` - ${points} điểm` : ''}`}
    >
      <span className="text-base leading-none ">{style.icon}  </span>
      <span className="hidden sm:inline leading-none">{memberType}</span>
      {showPoints && (
        <PointsDisplay 
          points={points} 
          isUpdating={isUpdating} 
        />
      )}
    </div>
  );
};

export default React.memo(MembershipBadge);