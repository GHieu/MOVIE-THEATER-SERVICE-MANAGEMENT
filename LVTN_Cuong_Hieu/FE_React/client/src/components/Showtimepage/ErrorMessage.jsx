import React from 'react';

export default function ErrorMessage({ error, onRetry }) {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="text-center py-8">
        <div className="text-red-500 text-lg mb-4">
          {error}
        </div>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
}