import React from 'react';
import { FaSpinner } from 'react-icons/fa';

export default function LoadingSpinner({ message = "Đang tải..." }) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="animate-spin text-2xl text-orange-500 mr-2" />
        <span className="text-lg">{message}</span>
      </div>
      
    </div>
  );
}