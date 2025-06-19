const SpendingMeter = ({ currentAmount = 0, maxAmount = 4000000 }) => {
  const percentage = Math.min((currentAmount / maxAmount) * 100, 100);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-700 font-medium">Tổng chi tiêu 2025</span>
        <span className="text-orange-500 font-semibold">{formatCurrency(currentAmount)}</span>
      </div>
      
      <div className="relative">
        <div className="flex justify-between items-center mb-2">
          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs font-bold">★</div>
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-xs">$</div>
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-xs">✕</div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0 đ</span>
          <span>2.000.000 đ</span>
          <span>4.000.000 đ</span>
        </div>
      </div>
    </div>
  );
};
export default SpendingMeter;