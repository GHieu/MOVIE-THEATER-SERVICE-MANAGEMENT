import React, { useState } from 'react';

export default function BookingPage() {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const rows = ['G','F','E', 'D', 'C', 'B', 'A'];
  const cols = Array.from({ length: 11 }, (_, i) => i + 1); // 10 ghế mỗi hàng

  // Danh sách ghế VIP (có thể lấy từ API sau)
  const vipSeats = ['D5', 'D6', 'E5', 'E6'];

  const handleSelectSeat = (seat) => {
    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  const isVip = (seat) => vipSeats.includes(seat);
  const isSelected = (seat) => selectedSeats.includes(seat);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold mb-6">Đặt vé</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột chọn rạp, ngày, giờ */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Chọn rạp</label>
            <select className="w-full border rounded p-2">
              <option>Galaxy Nguyễn Du</option>
              <option>Galaxy Tân Bình</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Chọn ngày</label>
            <select className="w-full border rounded p-2">
              <option>17/05/2025</option>
              <option>18/05/2025</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Chọn giờ chiếu</label>
            <select className="w-full border rounded p-2">
              <option>10:00</option>
              <option>14:00</option>
              <option>18:00</option>
            </select>
          </div>

          <div>
            <h3 className="font-semibold mt-4">Ghế đã chọn:</h3>
            <ul className="text-sm text-gray-600">
              {selectedSeats.map((s) => (
                <li key={s}>{s} {vipSeats.includes(s) && '(VIP)'}</li>
              ))}
            </ul>
            <p className="mt-2 font-semibold">
              Tổng tiền: {selectedSeats.reduce((sum, seat) => (
                sum + (vipSeats.includes(seat) ? 100000 : 75000)
              ), 0).toLocaleString()} đ
            </p>
            <button className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Thanh toán
            </button>
          </div>
        </div>

        {/* Cột chọn ghế */}
        <div className="bg-gray-100 p-4 rounded-lg inline-block">
 

  {/* Sơ đồ ghế theo hàng */}
  <div className="space-y-2">
    {rows.map((row) => (
      <div key={row} className="flex items-center gap-2">
        <span className="w-6 text-right font-semibold">{row}</span>
        {cols.map((col) => {
          const seat = `${row}${col}`;
          const vip = isVip(seat);
          const selected = isSelected(seat);

          const baseStyle = 'w-10 h-10 text-xs font-medium rounded flex items-center justify-center border transition';
          const colorStyle = selected
            ? 'bg-green-500 text-white'
            : vip
              ? 'bg-yellow-400 text-white hover:bg-yellow-500'
              : 'bg-white text-gray-800 hover:bg-gray-200';

          return (
            <button
              key={seat}
              onClick={() => handleSelectSeat(seat)}
              className={`${baseStyle} ${colorStyle}`}
            >
              {seat}
            </button>
          );
        })}
      </div>
    ))}
  </div>

 {/* Màn hình chiếu */}
  <div className="text-center mt-4">
    <div className="bg-gray-400 h-8 rounded-md flex items-center justify-center text-white font-semibold">
      MÀN HÌNH
    </div>
  </div>
  {/* Ghi chú màu */}
  <div className="mt-4 space-x-4 text-sm">
    <span className="inline-flex items-center">
      <div className="w-4 h-4 bg-white border mr-1" /> Ghế thường
    </span>
    <span className="inline-flex items-center">
      <div className="w-4 h-4 bg-yellow-400 border mr-1" /> Ghế VIP
    </span>
    <span className="inline-flex items-center">
      <div className="w-4 h-4 bg-green-500 border mr-1" /> Đang chọn
    </span>
  </div>
</div>

      </div>
    </div>
  );
}




// import React, { useState } from 'react';

// export default function BookingPage() {
//   const [selectedSeats, setSelectedSeats] = useState([]);

//   const rows = ['A', 'B', 'C', 'D', 'E']; // 5 hàng ghế
//   const cols = Array.from({ length: 10 }, (_, i) => i + 1); // 10 ghế mỗi hàng

//   const handleSelectSeat = (seat) => {
//     setSelectedSeats((prev) =>
//       prev.includes(seat)
//         ? prev.filter((s) => s !== seat)
//         : [...prev, seat]
//     );
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-6">
//       <h2 className="text-3xl font-bold mb-6">Đặt vé</h2>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Cột chọn rạp/ngày/giờ */}
//         <div className="space-y-4">
//           <div>
//             <label className="block font-semibold mb-1">Chọn rạp</label>
//             <select className="w-full border rounded p-2">
//               <option>Galaxy Nguyễn Du</option>
//               <option>Galaxy Kinh Dương Vương</option>
//               <option>Galaxy Tân Bình</option>
//             </select>
//           </div>

//           <div>
//             <label className="block font-semibold mb-1">Chọn ngày</label>
//             <select className="w-full border rounded p-2">
//               <option>17/05/2025</option>
//               <option>18/05/2025</option>
//             </select>
//           </div>

//           <div>
//             <label className="block font-semibold mb-1">Chọn giờ chiếu</label>
//             <select className="w-full border rounded p-2">
//               <option>10:00</option>
//               <option>14:00</option>
//               <option>18:00</option>
//             </select>
//           </div>

//           <div>
//             <h3 className="font-semibold mt-4">Tổng số ghế đã chọn:</h3>
//             <ul className="text-sm text-gray-600">
//               {selectedSeats.map((s) => (
//                 <li key={s}>{s}</li>
//               ))}
//             </ul>
//             <p className="mt-2 font-semibold">
//               Tổng tiền: {selectedSeats.length * 75000} đ
//             </p>
//             <button className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
//               Thanh toán
//             </button>
//           </div>
//         </div>

//         {/* Cột chọn ghế */}
//         <div>
//           <h3 className="font-semibold mb-2">Chọn ghế</h3>
//           <div className="grid grid-cols-10 gap-2">
//             {rows.map((row) =>
//               cols.map((col) => {
//                 const seat = `${row}${col}`;
//                 const isSelected = selectedSeats.includes(seat);

//                 return (
//                   <button
//                     key={seat}
//                     onClick={() => handleSelectSeat(seat)}
//                     className={`w-12 h-12 text-sm rounded flex items-center justify-center ${
//                       isSelected
//                         ? 'bg-green-500 text-white'
//                         : 'bg-white border hover:bg-gray-200'
//                     }`}
//                   >
//                     {seat}
//                   </button>
//                 );
//               })
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




