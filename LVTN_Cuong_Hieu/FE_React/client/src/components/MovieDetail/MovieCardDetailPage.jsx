import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 👈 thêm useLocation
import { FaTicketAlt } from "react-icons/fa";

const MovieCardDetailPage = ({ movie, reviews = [] }) => {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 lấy location hiện tại
  const [hovered, setHovered] = useState(false);

  if (!movie) return null;

  const handleNavigate = () => {
  const currentPath = `/movies/${movie.id}`;
  if (location.pathname === currentPath) {
    // Reload toàn bộ trang
    window.location.href = window.location.href;
  } else {
    navigate(currentPath);
  }
};


  const handleBookingClick = (e) => {
    e.stopPropagation();
    handleNavigate(); // dùng lại logic check
  };

  // Tính trung bình đánh giá
  let averageRating = "?";
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    averageRating = (sum / reviews.length).toFixed(1);
  }

  return (
    <div
      onClick={handleNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded overflow-hidden cursor-pointer transition"
    >
      <div className="relative w-full h-45 md:h-55">
        <img
          src={movie.banner}
          alt={movie.title}
          className="w-full h-full object-contain"
        />

        {hovered && (
          <div className="absolute inset-0 flex items-center bg-black/30 justify-center transition">
            <button
              onClick={handleBookingClick}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
            >
              <FaTicketAlt />
              Đặt vé
            </button>
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 text-white text-sm font-semibold">
          <span className="bg-black/70 px-2 py-1 rounded-tl-lg">
            ⭐ {averageRating}
          </span>
          {movie.age && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              {movie.age}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          {movie.title}
        </h2>
      </div>
    </div>
  );
};

export default MovieCardDetailPage;
