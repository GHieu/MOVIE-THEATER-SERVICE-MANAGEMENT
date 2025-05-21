import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white px-6 py-10 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Cột 1 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">GIỚI THIỆU</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#">Về Chúng Tôi</a></li>
            <li><a href="#">Thoả Thuận Sử Dụng</a></li>
            <li><a href="#">Quy Chế Hoạt Động</a></li>
            <li><a href="#">Chính Sách Bảo Mật</a></li>
          </ul>
        </div>

        {/* Cột 2 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">GÓC ĐIỆN ẢNH</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#">Thể Loại Phim</a></li>
            <li><a href="#">Bình Luận Phim</a></li>
            <li><a href="#">Blog Điện Ảnh</a></li>
            <li><a href="#">Phim Hay Tháng</a></li>
            <li><a href="#">Phim IMAX</a></li>
          </ul>
        </div>

        {/* Cột 3 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">HỖ TRỢ</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#">Góp Ý</a></li>
            <li><a href="#">Sale & Services</a></li>
            <li><a href="#">Rạp / Giá Vé</a></li>
            <li><a href="#">Tuyển Dụng</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>

        {/* Cột 4 - Thông tin công ty */}
        <div>
          <h3 className="text-lg font-semibold mb-4">CÔNG TY CỔ PHẦN PHIM THIÊN NGÂN</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            3/9 Võ Văn Tần, Phường Võ Thị Sáu,<br />
            Quận 3, Tp. Hồ Chí Minh, Việt Nam<br />
            ☎ 028.39.333.303 - 📞 19002224 (9:00 - 22:00)<br />
            ✉ hotro@galaxystudio.vn
          </p>
        </div>
      </div>

      <div className="mt-10 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Galaxy Cinema. All rights reserved.
      </div>
    </footer>
  );
}
