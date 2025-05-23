import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
const mockCombos = [
  {
    id: 1,
    name: "ATVNCG - KHIÊN LỬA Lightstick Set",
    description: "Lưu giữ những khoảnh khắc bùng cháy của các anh với chiếc lightstick phiên bản đặc biệt, biểu tượng của những sân khấu rực lửa.",
    price: 600000,
    image: "https://link-to-img-1",
  },
  {
    id: 2,
    name: "Blindbox Kakadoll Ver.2",
    description: "Với thiết kế dễ thương mang đậm nét riêng của từng anh.",
    price: 300000,
    image: "https://link-to-img-2",
  },
  {
    id: 3,
    name: "Blindbox Kakachain",
    description: "Món quà ý nghĩa cho fan các anh trai, dễ dàng gắn vào điện thoại, túi xách.",
    price: 150000,
    image: "https://link-to-img-3",
  },
];

const FoodPage = () => {
  const navigate = useNavigate();
  const [selectedCombos, setSelectedCombos] = useState({});

  const handleChange = (id, delta) => {
    setSelectedCombos((prev) => {
      const newCount = (prev[id] || 0) + delta;
      if (newCount <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newCount };
    });
  };

  const total = Object.entries(selectedCombos).reduce((sum, [id, count]) => {
    const combo = mockCombos.find((c) => c.id === parseInt(id));
    return sum + (combo ? combo.price * count : 0);
  }, 0);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      {/* Combo list */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4">Chọn Combo / Sản phẩm</h2>
        {mockCombos.map((combo) => (
          <div key={combo.id} className="flex items-start gap-4 mb-6">
            <img
              src={combo.image}
              alt={combo.name}
              className="w-28 h-28 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{combo.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{combo.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">
                  Giá: {combo.price.toLocaleString("vi-VN")} ₫
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleChange(combo.id, -1)}
                    className="w-8 h-8 border rounded text-lg"
                  >
                    –
                  </button>
                  <span>{selectedCombos[combo.id] || 0}</span>
                  <button
                    onClick={() => handleChange(combo.id, 1)}
                    className="w-8 h-8 border rounded text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-[300px] bg-white rounded border p-4">
        <div className="text-sm text-orange-600 font-semibold mb-2">
          Thời gian giữ ghế: 06:23
        </div>
        <div className="flex gap-4 mb-4">
          <img
            src="https://media.galaxycine.vn/media/2024/5/14/tham-tu-kien-ky-an-khong-dau_1715677279652.jpg"
            alt="poster"
            className="w-20 h-28 object-cover rounded"
          />
          <div>
            <h3 className="font-semibold">Thám Tử Kiên: Kỳ Án Không Đầu</h3>
            <p className="text-sm">
              2D Phụ Đề -{" "}
              <span className="bg-orange-400 text-white px-2 py-0.5 rounded ml-1">
                T16
              </span>
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-700">Galaxy Nguyễn Du - RAP 4</p>
        <p className="text-sm">Suất: 10:45 - Thứ Sáu, 23/05/2025</p>

        <hr className="my-4" />

        <div className="text-sm text-gray-800 mb-2">
          2x Ghế đơn<br />
          Ghế: E4, E5
        </div>

        <div className="flex justify-between font-semibold text-sm">
          <span>Tổng cộng</span>
          <span>{total.toLocaleString("vi-VN")} ₫</span>
        </div>

        <div className="flex justify-between mt-6">
            <Link to = "/booking/:movieId">
                <button className="text-orange-500 font-semibold">Quay lại</button>
            </Link>
          
          <button
            onClick={() => navigate("/payment")}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodPage;
