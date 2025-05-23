import React, { useState } from "react";
import { Link } from "react-router-dom";
const paymentMethods = [
  {
    id: "onepay",
    label: "OnePay - Visa, Master, JCB,… / ATM / QR Ngân hàng / Apple Pay",
    logo: "https://www.onepay.vn/themes/onepay/images/logo.png",
  },
  {
    id: "shopeepay",
    label: "Ví ShopeePay – Giảm 5K mỗi đơn khi thanh toán",
    logo: "https://upload.wikimedia.org/wikipedia/vi/f/f8/ShopeePay_Logo.png",
  },
  {
    id: "momo",
    label: "Ví điện tử MoMo",
    logo: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png",
  },
  {
    id: "zalo",
    label: "ZaloPay – Giảm 50% tối đa 40K",
    logo: "https://upload.wikimedia.org/wikipedia/vi/e/e5/ZaloPay-logo.png",
  },
];

const PaymentPage = () => {
  const [voucher, setVoucher] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("onepay");

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      {/* LEFT: Form thanh toán */}
      <div className="flex-1">
        {/* Khuyến mãi */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Khuyến mãi</h2>
          <div className="flex gap-2 mb-1">
            <input
              type="text"
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              placeholder="Mã khuyến mãi"
              className="border p-2 rounded w-full"
            />
            <button className="bg-orange-500 text-white px-4 rounded">
              Áp Dụng
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Lưu ý: Có thể áp dụng nhiều vouchers vào 1 lần thanh toán
          </p>
        </div>

        {/* Phương thức thanh toán */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Phương thức thanh toán</h2>
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className="flex items-center gap-3 p-3 border rounded mb-3 cursor-pointer"
            >
              <input
                type="radio"
                name="payment"
                checked={selectedMethod === method.id}
                onChange={() => setSelectedMethod(method.id)}
              />
              <img
                src={method.logo}
                alt={method.label}
                className="w-8 h-8 object-contain"
              />
              <span className="text-sm">{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* RIGHT: Thông tin đơn hàng */}
      <div className="w-full lg:w-[350px] border rounded p-4 bg-white">
        <div className="text-sm text-orange-600 font-semibold mb-2">
          Thời gian giữ ghế: 06:32
        </div>

        <div className="flex gap-4 mb-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/vi/7/7e/Lilo_%26_Stitch_poster.jpg"
            alt="poster"
            className="w-20 h-28 object-cover rounded"
          />
          <div>
            <h3 className="font-semibold">Lilo & Stitch</h3>
            <p className="text-sm">2D Lồng Tiếng</p>
          </div>
        </div>

        <p className="text-sm text-gray-700">Galaxy Long Xuyên - RAP 1</p>
        <p className="text-sm">Suất: <strong>13:00</strong> - Thứ Sáu, 23/05/2025</p>

        <hr className="my-4" />

        <div className="text-sm text-gray-800 mb-1">
          <strong>2x</strong> Người lớn - Member<br />
          Ghế: <strong>E5, E6</strong>
        </div>
        <div className="text-sm text-gray-800 mb-1">
          <strong>1x</strong> iCapybara Set
        </div>

        <div className="flex justify-between font-semibold mt-4 text-base">
          <span>Tổng cộng</span>
          <span className="text-orange-500">490.000 ₫</span>
        </div>
          <Link to= "/order-success">
                <button className="mt-6 w-full bg-orange-500 text-white py-2 rounded">
                     Thanh toán
                </button>
          </Link> 
        
      </div>
    </div>
  );
};

export default PaymentPage;
