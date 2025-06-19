import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTicketAlt } from "react-icons/fa";

const MovieCardDetailPage = ({ movie }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  if (!movie) return null;

  const handleNavigate = () => {
    navigate(`/movies/${movie.id}`);
  };

  const handleBookingClick = (e) => {
    e.stopPropagation(); // tránh click lan ra thẻ cha
    navigate(`/movies/${movie.id}`);
  };

  return (
    <div
      onClick={handleNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded overflow-hidden  cursor-pointer  transition"
    >
      {/* Banner */}
      <div className="relative w-full h-45 md:h-55">
        <img
          src={movie.banner}
          alt={movie.title}
          className="w-full h-full object-contain"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t  to-transparent"></div>

        {/* Hover: Nút Đặt vé */}
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

        {/* Rating + Age ở góc dưới bên phải */}
        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 text-white text-sm font-semibold">
          <span className="bg-black/70 px-2 py-1 rounded-tl-lg">
            ⭐ {movie.rating || "9.1"}
          </span>
          {movie.age && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              {movie.age}
            </span>
          )}
        </div>
      </div>

      {/* Tiêu đề bên dưới */}
      <div className="mt-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 ">
          {movie.title}
        </h2>
      </div>
    </div>
  );
};

export default MovieCardDetailPage;
