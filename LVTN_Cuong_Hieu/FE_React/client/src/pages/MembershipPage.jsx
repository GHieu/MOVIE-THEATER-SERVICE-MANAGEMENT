import React from 'react';

export default function MembershipPage() {
  // Dữ liệu membership types
  const membershipTypes = [
    {
      type: 'Silver',
      name: 'Thẻ Bạc',
      color: 'bg-gray-400',
      textColor: 'text-gray-800',
      benefits: ['Tích điểm cơ bản', 'Giảm giá 5%', 'Ưu tiên đặt vé'],
      requirement: 'Mặc định cho thành viên mới'
    },
    {
      type: 'Gold',
      name: 'Thẻ Vàng',
      color: 'bg-yellow-400',
      textColor: 'text-yellow-800',
      benefits: ['Tích điểm x2', 'Giảm giá 10%', 'Ưu tiên cao', 'Combo miễn phí'],
      requirement: 'Đạt 300 điểm tích lũy để nâng cấp'
    },
    {
      type: 'Diamond',
      name: 'Thẻ Kim Cương',
      color: 'bg-blue-400',
      textColor: 'text-blue-800',
      benefits: ['Tích điểm x3', 'Giảm giá 15%', 'VIP lounge', 'Vé miễn phí hàng tháng'],
      requirement: 'Đạt 1000 điểm tích lũy để nâng cấp'
    }
  ];

  // User mặc định là Silver (nếu muốn thay đổi, sửa ở đây)
  const currentUser = {
    membershipType: 'Silver'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Các loại thành viên */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Các loại thành viên</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {membershipTypes.map((membership) => (
              <div 
                key={membership.type} 
                className={`relative border-2 rounded-xl p-6 ${
                  membership.type === currentUser.membershipType 
                    ? 'border-gray-200 ' 
                    : 'border-gray-200 hover:border-gray-300'
                } transition-all duration-300`}
              >
                <div className={`${membership.color} ${membership.textColor} w-full py-3 rounded-lg text-center font-bold text-lg mb-4`}>
                  {membership.name}
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Quyền lợi:</h4>
                    <ul className="space-y-1">
                      {membership.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                      {membership.requirement}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cách tích điểm */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Cách tích điểm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Mua vé xem phim</span>
                <span className="font-semibold text-green-600">+10 điểm/vé</span>
              </div>
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
