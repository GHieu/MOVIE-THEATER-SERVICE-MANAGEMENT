// src/components/Banner.jsx
import React, { useEffect, useState } from 'react';
import useMovies from '../../hooks/useMovieUser';
import { useNavigate } from 'react-router-dom';

export default function Banner() {
  const { nowShowing: banner, loading } = useMovies(); // lấy danh sách phim đang chiếu
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const navigate = useNavigate();

  // Tự động chuyển ảnh mỗi 5s
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, banner]);

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % banner.length);
      setFade(true);
    }, 300);
  };

  const handlePrev = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        prev === 0 ? banner.length - 1 : prev - 1
      );
      setFade(true);
    }, 300);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    setFade(true);
  };

  if (loading || banner.length === 0) return null;

  return (
    <div className="relative h-[400px] bg-black overflow-hidden shadow-lg">
      {/* Poster hàng chính */}
      <div className="absolute inset-0 flex items-center justify-center gap-6 transition-opacity duration-500 overflow-hidden">
        {/* Poster trước */}
        <img
          src={banner[(currentIndex - 1 + banner.length) % banner.length].banner}
          alt="Previous"
          className="w-[240px] h-[360px] object-contain opacity-60 transform scale-90 rounded-lg shadow-md transition-all duration-300 bg-black"
        />

        {/* Poster hiện tại */}
        <div
          onClick={() => navigate(`/movies/${banner[currentIndex].id}`)}
          className="cursor-pointer"
        >
          <img
            src={banner[currentIndex].banner}
            alt="Current"
            className={`w-[1000px] h-[400px] object-contain rounded-xl shadow-xl bg-black transition-all duration-500 ${
              fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        </div>


        {/* Poster tiếp theo */}
        <img
          src={banner[(currentIndex + 1) % banner.length].banner}
          alt="Next"
          className="w-[240px] h-[360px] object-contain opacity-60 transform scale-90 rounded-lg shadow-md transition-all duration-300 bg-black"
        />
      </div>

      {/* Nút điều hướng */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-70 text-white p-2 rounded-full z-10"
      >
        ❮
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-70 text-white p-2 rounded-full z-10"
      >
        ❯
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {banner.map((_, index) => (
          <div
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              index === currentIndex ? 'bg-white' : 'bg-gray-400'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
