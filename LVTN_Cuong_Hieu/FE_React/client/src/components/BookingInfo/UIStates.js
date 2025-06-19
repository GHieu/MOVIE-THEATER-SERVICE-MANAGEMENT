// components/UIStates.js
import React from 'react';

// Loading State Component
const LoadingState = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">Đang tải thông tin đặt vé...</div>
    </div>
  );
};

// Error State Component
const ErrorState = ({ error, onGoBack }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-red-600 text-lg">
        Lỗi: {error}
        <br />
        <button 
          onClick={onGoBack}
          className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

// No Data State Component
const NoDataState = ({ message, onGoBack }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="text-gray-600 text-lg mb-4">
          {message}
        </div>
        <button 
          onClick={onGoBack}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export { LoadingState, ErrorState, NoDataState };