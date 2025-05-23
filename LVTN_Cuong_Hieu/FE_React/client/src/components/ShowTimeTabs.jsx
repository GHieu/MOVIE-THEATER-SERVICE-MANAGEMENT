import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const days = [
  { date: "22/05", day: "T5" },
  { date: "23/05", day: "T6" },
  { date: "24/05", day: "T7" },
  { date: "25/05", day: "CN" },
  { date: "26/05", day: "T2" },
  { date: "27/05", day: "T3" },
];

const mockShowTimes = {
  "22/05": [
    { time: "20:45", seats: 78 },
    { time: "23:00", seats: 80 },
  ],
  "23/05": [
    { time: "19:00", seats: 50 },
    { time: "21:30", seats: 60 },
  ],
};

const ShowTimeTabs = ({ movieId }) => {
  const [selectedDate, setSelectedDate] = useState("22/05");
  const navigate = useNavigate();

  const handleShowtimeClick = (time) => {
    navigate(`/booking/${movieId}?date=${selectedDate}&time=${time}`);
  };

  return (
    <div>
      {/* Tabs ngày */}
      <div className="flex gap-4 border-b pb-2">
        {days.map(({ date, day }) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`text-center px-3 py-2 font-bold border-b-2 ${
              selectedDate === date
                ? "text-blue-600 border-blue-600"
                : "border-transparent"
            }`}
          >
            <div>{date}</div>
            <div className="text-sm">{day}</div>
          </button>
        ))}
      </div>

      {/* Suất chiếu */}
      <div className="mt-4">
        <div className="font-semibold text-xl mb-2">2D Phụ đề</div>
        <div className="flex gap-4 flex-wrap">
          {(mockShowTimes[selectedDate] || []).map(({ time, seats }) => (
            <div
              key={time}
              onClick={() => handleShowtimeClick(time)}
              className="border px-4 py-2 rounded-md shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="text-lg font-bold">{time}</div>
              <div className="text-sm text-gray-500">{seats} ghế trống</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowTimeTabs;
