import React, { useState, useMemo } from 'react';
import { FaPlay } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function MovieShowtimeCard({ movie, reviews = [] }) {
  const [showTrailer, setShowTrailer] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/movies/${movie.id}`);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setShowTrailer(true);
  };

  const closeTrailer = () => setShowTrailer(false);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return movie.rating;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews, movie.rating]);

  // Fix: Ensure poster URL is properly formatted
  const posterUrl = movie.poster || '/placeholder-movie.jpg';

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-white overflow-hidden transition duration-300 cursor-pointer w-48"
      >
        <div className="relative w-full aspect-[2/3]">
          <img
            src={posterUrl}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            onError={(e) => {
              console.error('Failed to load poster:', posterUrl);
              e.target.src = '/placeholder-movie.jpg'; // Fallback image
            }}
          />

          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-lg flex justify-center items-center transition">
            <button
              onClick={handleImageClick}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 w-12 h-12 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition"
            >
              <FaPlay className="ml-1" />
            </button>
          </div>

          {/* Rating and Age in bottom right */}
          <div className="absolute bottom-0 right-0 flex flex-col items-end gap-1 p-2">
            <div
              className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/movies/${movie.id}`);
              }}
            >
              <span className="text-yellow-400 font-semibold">
                ⭐ {averageRating}
              </span>
            </div>
            <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold">
              {movie.age}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (movie.trailer_url || movie.trailer) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeTrailer}
        >
          <div
            className="bg-black rounded-lg w-full max-w-4xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeTrailer}
              className="absolute top-4 right-4 text-white text-2xl z-10 hover:text-gray-300"
            >
              ×
            </button>
            <div className="aspect-video">
              <video
                width="100%"
                height="100%"
                src={movie.trailer_url || movie.trailer}
                controls
                autoPlay
                preload="metadata"
                title={movie.title}
                className="rounded-lg"
                onError={(e) => console.error('Failed to load video:', movie.trailer_url || movie.trailer)}
              >
                Trình duyệt của bạn không hỗ trợ thẻ video hoặc định dạng video này.
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
}