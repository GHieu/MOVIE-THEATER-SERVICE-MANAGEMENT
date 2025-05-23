import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Link } from 'react-router-dom';
const seatRows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const seatCols = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const SeatPage = () => {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get("date") || "22/05";
  const selectedTime = searchParams.get("time") || "20:15";

  const [selectedSeats, setSelectedSeats] = useState([]);
  const soldSeats = ["E5", "F5", "G5", "G4", "G3", "F4", "F3"];

  const toggleSeat = (seatId) => {
    if (soldSeats.includes(seatId)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const seatPrice = 75000;
  const totalPrice = selectedSeats.length * seatPrice;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      {/* Left content */}
      <div className="flex-1">
        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-2">Đổi suất chiếu</h2>
          <div className="flex gap-2">
            {[selectedTime, "22:00"].map((time) => (
              <button
                key={time}
                className={`px-4 py-2 rounded border font-semibold ${
                  selectedTime === time
                    ? "bg-blue-600 text-white"
                    : "border-blue-600 text-blue-600"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Seat map */}
<div className="bg-white p-4 rounded border">
  <div className="flex justify-center mb-6">
    <div className="bg-gray-300 text-gray-700 text-center py-1 px-6 rounded-md shadow-sm text-sm">
      Màn hình
    </div>
  </div>

  <div className="flex flex-col items-center">
    {seatRows.map((row) => (
      <div key={row} className="flex items-center mb-2">
        <div className="w-6 mr-2 text-right">{row}</div>
        {seatCols.map((col) => {
          const seatId = `${row}${col}`;
          const isSold = soldSeats.includes(seatId);
          const isSelected = selectedSeats.includes(seatId);
          return (
            <button
              key={seatId}
              onClick={() => toggleSeat(seatId)}
              className={`w-8 h-8 m-1 rounded border text-sm ${
                isSold
                  ? "bg-gray-300 cursor-not-allowed"
                  : isSelected
                  ? "bg-orange-500 text-white"
                  : "hover:bg-blue-100"
              }`}
              disabled={isSold}
            >
              {col}
            </button>
          );
        })}
      </div>
    ))}
  </div>
</div>


        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded" /> Ghế đã bán
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded" /> Ghế đang chọn
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border rounded" /> Ghế đơn
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-full lg:w-[300px] bg-white rounded border p-4">
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
        <div className="text-sm text-gray-700">
          <p>Galaxy Nguyễn Du - RAP 4</p>
          <p>
            Suất:{" "}
            <span className="font-semibold">{selectedTime}</span> -{" "}
            Thứ Năm, {selectedDate}/2025
          </p>
        </div>
        <hr className="my-4" />
        <div className="text-sm mb-2">
        <span className="font-semibold">{selectedSeats.length} Ghế đơn</span>{" "} 
        <div>
            Ghế: {selectedSeats.join(", ")}
        </div>
        </div>
            <div className="flex justify-between text-sm">
            <span>Tổng cộng</span>
                <span className="text-orange-600 font-semibold">
                {totalPrice.toLocaleString("vi-VN")} ₫
            </span>
        </div>

        <div className="flex justify-between mt-6">
          <button className="text-orange-500 font-semibold">Quay lại</button>
          <Link to="/food">
             <button className="bg-orange-500 text-white px-4 py-2 rounded">
                Tiếp tục
             </button>
          </Link>
         
        </div>
      </div>
    </div>
  );
};

export default SeatPage;
