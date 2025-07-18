import React from 'react';

const AboutPage = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 min-h-screen">
      {/* Hero Section with Parallax Effect */}
      <div
        className="relative h-screen bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%), url('/AbsoluteCinema.png')",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Trải nghiệm điện ảnh 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                đỉnh cao cùng AbsoluteCinema
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
              Nơi mọi câu chuyện trở nên sống động, mọi cảm xúc được thăng hoa
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
                🎬 50+ Cụm rạp
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
                🌟 300+ Màn hình
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
                ❤️ 15 Năm kinh nghiệm
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Animation Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-orange-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-20 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 right-10 w-5 h-5 bg-purple-400 rounded-full animate-pulse"></div>
      </div>

      {/* About Content */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Main Introduction */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Về AbsoluteCinema
          </h2>
          <div className="max-w-5xl mx-auto">
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              AbsoluteCinema là hệ thống rạp chiếu phim hiện đại hàng đầu tại Việt Nam, tiên phong trong việc mang đến trải nghiệm giải trí toàn diện và đẳng cấp. 
              Với hơn 50 cụm rạp tại 20 tỉnh thành, từ Hà Nội, TP.HCM, Đà Nẵng đến các thành phố như Cần Thơ, Hải Phòng và Nha Trang, chúng tôi tự hào phục vụ hàng triệu khán giả mỗi năm.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold mb-3 text-blue-800">Chất Lượng Hàng Đầu</h3>
                <p className="text-gray-700">Công nghệ chiếu phim 4K Laser, âm thanh Dolby Atmos và không gian sang trọng</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-2xl font-bold mb-3 text-purple-800">Trải Nghiệm Đẳng Cấp</h3>
                <p className="text-gray-700">Từ ghế VIP cao cấp đến dịch vụ ẩm thực đa dạng và tiện ích hiện đại</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl shadow-lg">
                <div className="text-4xl mb-4">💫</div>
                <h3 className="text-2xl font-bold mb-3 text-orange-800">Cộng Đồng Yêu Phim</h3>
                <p className="text-gray-700">Kết nối hàng triệu khán giả qua những câu chuyện điện ảnh đầy cảm xúc</p>
              </div>
            </div>
          </div>
        </div>

        {/* Journey Section with Timeline */}
        <div className="bg-gradient-to-r from-white to-gray-50 p-12 rounded-3xl shadow-2xl mb-20">
          <h3 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
            📜 Hành Trình 15 Năm Phát Triển
          </h3>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
            <div className="space-y-12">
              {[
                { year: '2010', title: 'Khởi Đầu Tại TP.HCM', desc: 'Rạp chiếu phim đầu tiên với tầm nhìn đưa điện ảnh thế giới đến gần hơn với khán giả Việt Nam' },
                { year: '2015', title: 'Mở Rộng Toàn Quốc', desc: 'Phát triển lên 15 cụm rạp tại các thành phố lớn với công nghệ 3D và IMAX' },
                { year: '2020', title: 'Công Nghệ Tiên Tiến', desc: 'Đầu tư hệ thống chiếu 4K Laser, ghế VIP cao cấp và khu vui chơi tích hợp' },
                { year: '2025', title: 'Đỉnh Cao Trải Nghiệm', desc: 'Hơn 50 cụm rạp, 300+ màn hình chiếu, phục vụ hàng triệu khán giả mỗi năm' }
              ].map((milestone, index) => (
                <div key={milestone.year} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-yellow-400">
                      <div className="text-2xl font-bold text-yellow-600 mb-2">{milestone.year}</div>
                      <h4 className="text-xl font-semibold mb-2 text-gray-800">{milestone.title}</h4>
                      <p className="text-gray-600">{milestone.desc}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission + Vision with Visual Enhancement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-10 rounded-3xl shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="text-5xl mb-6">🎯</div>
              <h3 className="text-3xl font-bold mb-4">Sứ Mệnh</h3>
              <p className="text-lg leading-relaxed">
                AbsoluteCinema không chỉ là nơi chiếu phim – chúng tôi truyền cảm hứng và kết nối cộng đồng thông qua những câu chuyện điện ảnh. 
                Mỗi bộ phim tại AbsoluteCinema là một hành trình cảm xúc, nơi khán giả được sống trọn vẹn trong từng khung hình, từ những giây phút hồi hộp đến những khoảnh khắc lắng đọng.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-pink-600 p-10 rounded-3xl shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-28 h-28 bg-white/10 rounded-full -translate-y-14 -translate-x-14"></div>
            <div className="absolute bottom-0 right-0 w-36 h-36 bg-white/10 rounded-full translate-y-18 translate-x-18"></div>
            <div className="relative z-10">
              <div className="text-5xl mb-6">🌟</div>
              <h3 className="text-3xl font-bold mb-4">Tầm Nhìn</h3>
              <p className="text-lg leading-relaxed">
                Chúng tôi hướng đến trở thành thương hiệu rạp chiếu phim được yêu thích nhất tại Việt Nam, nơi mọi khán giả đều tìm thấy niềm vui và sự kết nối qua điện ảnh. 
                AbsoluteCinema cam kết mang đến không gian giải trí hiện đại, sáng tạo và thân thiện, đồng thời không ngừng đổi mới để đáp ứng nhu cầu ngày càng cao của khán giả.
              </p>
            </div>
          </div>
        </div>

        {/* Locations Section with Enhanced Visual */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-12 rounded-3xl shadow-2xl mb-20 text-white">
          <h3 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            📍 Hệ Thống Rạp Toàn Quốc
          </h3>
          <p className="text-lg text-gray-300 mb-8 text-center max-w-4xl mx-auto">
            AbsoluteCinema hiện diện tại các thành phố lớn và khu vực trọng điểm khắp Việt Nam, mang đến sự tiện lợi cho khán giả ở mọi nơi.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { 
                name: 'AbsoluteCinema Vincom Mega Mall', 
                location: 'TP.HCM', 
                features: 'Rạp flagship với 12 phòng chiếu, bao gồm phòng IMAX và ghế VIP cao cấp',
                icon: '🏢',
                color: 'from-blue-400 to-blue-600'
              },
              { 
                name: 'AbsoluteCinema Landmark 81', 
                location: 'Hà Nội', 
                features: 'Không gian sang trọng với phòng chiếu 4DX độc quyền và tầm nhìn toàn cảnh',
                icon: '🏙️',
                color: 'from-purple-400 to-purple-600'
              },
              { 
                name: 'AbsoluteCinema Đà Nẵng', 
                location: 'Đà Nẵng', 
                features: 'Thiết kế hiện đại, tích hợp khu vui chơi và ẩm thực ven biển',
                icon: '🌊',
                color: 'from-cyan-400 to-cyan-600'
              },
              { 
                name: 'AbsoluteCinema Cần Thơ', 
                location: 'Cần Thơ', 
                features: 'Điểm đến lý tưởng cho khán giả miền Tây với các chương trình ưu đãi đặc biệt',
                icon: '🌾',
                color: 'from-green-400 to-green-600'
              }
            ].map((cinema, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-yellow-400 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cinema.color} flex items-center justify-center text-2xl`}>
                    {cinema.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-2">{cinema.name}</h4>
                    <p className="text-yellow-400 font-semibold mb-2">{cinema.location}</p>
                    <p className="text-gray-300 text-sm">{cinema.features}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section with Enhanced Layout */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Tại Sao Chọn AbsoluteCinema?
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Những trải nghiệm độc đáo chỉ có tại AbsoluteCinema</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🎥',
                title: 'Công nghệ trình chiếu tiên tiến',
                desc: 'Hệ thống chiếu phim 4K Laser sắc nét, màn hình cong khổng lồ và âm thanh vòm Dolby Atmos mang đến trải nghiệm điện ảnh sống động như thật. Mỗi khung hình đều được tái hiện với độ chi tiết hoàn hảo.',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '🍿',
                title: 'Ẩm thực rạp phim đa dạng',
                desc: 'Thực đơn phong phú từ bắp rang bơ truyền thống, combo snack cao cấp đến các món ăn nhanh như pizza, gà rán, và đồ uống đặc biệt. Tất cả được chế biến tươi ngon ngay tại rạp.',
                gradient: 'from-orange-500 to-red-500'
              },
              {
                icon: '💺',
                title: 'Không gian sang trọng & thoải mái',
                desc: 'Ghế đôi Couple, ghế VIP da cao cấp với chức năng ngả lưng và sạc USB, đảm bảo sự thư giãn tối đa trong suốt bộ phim. Không gian được thiết kế theo tiêu chuẩn quốc tế.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: '🕹️',
                title: 'Khu giải trí tích hợp',
                desc: 'Khu vực game hiện đại với hơn 50 trò chơi điện tử, góc check-in với poster phim độc quyền và không gian tương tác dành riêng cho giới trẻ và gia đình. Trải nghiệm giải trí trọn vẹn.',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: '🎫',
                title: 'Ưu đãi & thẻ thành viên',
                desc: 'Chương trình Absolute Membership cho phép tích điểm, nâng hạng thẻ, nhận vé miễn phí và ưu đãi độc quyền mỗi lần xem phim. Càng xem nhiều, càng được nhiều ưu đãi hấp dẫn.',
                gradient: 'from-yellow-500 to-orange-500'
              },
              {
                icon: '🧑‍💼',
                title: 'Dịch vụ tận tâm',
                desc: 'Đội ngũ nhân viên được đào tạo chuyên nghiệp, luôn sẵn sàng hỗ trợ từ đặt vé, chọn ghế đến giải đáp mọi thắc mắc của khán giả. Dịch vụ khách hàng 24/7 qua hotline và app.',
                gradient: 'from-indigo-500 to-blue-500'
              },
            ].map(({ icon, title, desc, gradient }) => (
              <div
                key={title}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-yellow-400"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600">
                  {title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Community Initiatives with Enhanced Design */}
        <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-12 rounded-3xl shadow-2xl border border-green-200">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
              Cam Kết Cộng Đồng
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-teal-400 mx-auto rounded-full mb-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
              <h4 className="text-xl font-bold text-green-700 mb-4">🎬 Hỗ Trợ Điện Ảnh Việt</h4>
              <p className="text-gray-700 leading-relaxed">
                Chúng tôi tổ chức các liên hoan phim ngắn, hỗ trợ các nhà làm phim trẻ Việt Nam thông qua quỹ tài trợ sản xuất phim và chương trình mentor từ các chuyên gia hàng đầu.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
              <h4 className="text-xl font-bold text-green-700 mb-4">💚 Trách Nhiệm Môi Trường</h4>
              <p className="text-gray-700 leading-relaxed">
                Cam kết sử dụng 100% vật liệu thân thiện môi trường, giảm thiểu rác thải nhựa và triển khai chương trình tái chế tại tất cả các cụm rạp.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
              <h4 className="text-xl font-bold text-green-700 mb-4">🎓 Giáo Dục Cộng Đồng</h4>
              <p className="text-gray-700 leading-relaxed">
                Cung cấp các chương trình chiếu phim miễn phí cho học sinh, sinh viên và tổ chức các buổi hội thảo về nghệ thuật điện ảnh tại các trường học.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
              <h4 className="text-xl font-bold text-green-700 mb-4">🌟 Hoạt Động Từ Thiện</h4>
              <p className="text-gray-700 leading-relaxed">
                Tổ chức các sự kiện chiếu phim từ thiện, quyên góp cho các tổ chức xã hội và mang điện ảnh đến với trẻ em tại các vùng khó khăn.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20 bg-gradient-to-r from-blue-600 to-purple-700 p-12 rounded-3xl shadow-2xl text-white">
          <h3 className="text-3xl font-bold mb-4">Sẵn sàng trải nghiệm điện ảnh đẳng cấp?</h3>
          <p className="text-xl mb-8 text-blue-100">Tham gia cùng hàng triệu khán giả đã chọn AbsoluteCinema</p>
          <div className="flex justify-center space-x-6">
            <a 
              href="/movies" 
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
            >
              Đặt Vé Ngay
            </a>
            <button className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
              Tìm Rạp Gần Nhất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;