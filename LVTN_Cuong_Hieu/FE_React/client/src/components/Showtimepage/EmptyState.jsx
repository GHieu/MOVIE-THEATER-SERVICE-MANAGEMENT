import React from 'react';

export default function EmptyState() {
  return (
    <div className="text-center py-20 text-gray-500">
      <div className="text-lg mb-2">Không có suất chiếu nào</div>
      <div className="text-sm">Vui lòng chọn ngày khác</div>
    </div>
  );
}