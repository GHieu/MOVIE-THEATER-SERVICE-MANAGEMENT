// components/SeatMap.js
import React from 'react';
import SeatButton from './SeatButton';

const SeatMap = ({ 
  seatRows, 
  seatCols, 
  seatMap, 
  selectedSeats, 
  onToggleSeat 
}) => {
  return (
    <div className="bg-white p-4 rounded border">
      {/* Màn hình */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-8 rounded-lg inline-block shadow-lg">
          <div className="text-lg font-bold">MÀN HÌNH</div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {seatRows.map((row) => (
          <div key={row} className="flex items-center mb-2">
            <div className="w-6 mr-2 text-right font-semibold">{row}</div>
            {seatCols.map((col) => {
              const seatId = `${row}${col}`;
              const seatInfo = seatMap[seatId];
              const isSelected = selectedSeats.includes(seatId);
              
              return (
                <SeatButton
                  key={seatId}
                  seatId={seatId}
                  col={col}
                  seatInfo={seatInfo}
                  isSelected={isSelected}
                  onToggle={onToggleSeat}
                />
              );
            })}
            <div className="w-6 ml-2 text-left font-semibold">{row}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatMap;