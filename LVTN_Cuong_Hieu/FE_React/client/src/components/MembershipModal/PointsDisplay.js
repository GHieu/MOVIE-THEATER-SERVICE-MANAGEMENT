import React from 'react';

const PointsDisplay = React.memo(({ points, isUpdating = false }) => {
  return (
    <span className={`hidden md:inline text-xs leading-none transition-opacity ${
      isUpdating ? 'opacity-50' : ''
    }`}>
      ({points} điểm)
      {isUpdating && (
        <span className="ml-1 animate-spin">⟳</span>
      )}
    </span>
  );
});

PointsDisplay.displayName = 'PointsDisplay';

export default PointsDisplay;