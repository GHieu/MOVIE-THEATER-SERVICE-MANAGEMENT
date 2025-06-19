import React from 'react';

const ServiceItem = ({ service, selectedQuantity, onQuantityChange, isExpired }) => {
  const handleDecrease = () => {
    onQuantityChange(service.id, -1);
  };

  const handleIncrease = () => {
    onQuantityChange(service.id, 1);
  };

  return (
    <div className="flex items-start gap-4 mb-6 border-b pb-4">
      <img
        src={service.image || "https://via.placeholder.com/120x120?text=Service"}
        alt={service.name}
        className="w-28 h-28 object-cover rounded"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/120x120?text=Service";
        }}
      />
      <div className="flex-1">
        <h3 className="font-semibold">{service.name}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {service.description || "Không có mô tả"}
        </p>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-800">
            Giá: {service.price?.toLocaleString("vi-VN") || 0} ₫
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              className={`w-8 h-8 border rounded text-lg hover:bg-gray-100 disabled:opacity-50 ${
                isExpired ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={!selectedQuantity || isExpired}
            >
              –
            </button>
            <span className="w-8 text-center">
              {selectedQuantity || 0}
            </span>
            <button
              onClick={handleIncrease}
              className={`w-8 h-8 border rounded text-lg hover:bg-gray-100 ${
                isExpired ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={isExpired}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceItem;