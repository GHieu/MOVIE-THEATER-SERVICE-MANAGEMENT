import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaTicketAlt } from 'react-icons/fa';

export default function MovieCard({ movie, reviews = [] }) {
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);

  const handleCardClick = () => {
    navigate(`/movies/${movie.id}`);
  };

  const handleBookingClick = (e) => {
    e.stopPropagation();
    navigate(`/movies/${movie.id}`);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setShowTrailer(true);
  };

  const closeTrailer = () => setShowTrailer(false);

  // Calculate average rating from reviews
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return '0';
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-white overflow-hidden transition duration-300 cursor-pointer"
      >
        <div className="relative w-full aspect-[2/3]">
          <img
            src={movie.poster || '/fallback.jpg'}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-fill rounded-lg"
          />

          {/* Overlay Buttons */}
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex flex-col justify-center items-center gap-3 p-4 opacity-0 hover:opacity-100 transition">
            <button
              onClick={handleBookingClick}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
            >
              <FaTicketAlt />
              Mua vé
            </button>
            <button
              onClick={handleImageClick}
              className="bg-white bg-opacity-20 hover:bg-opacity-40 text-white border border-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FaPlay />
              Trailer
            </button>
          </div>

          {/* Bottom-right corner */}
          <div className="absolute bottom-0 right-0 flex flex-col items-end gap-1 p-2 z-10">
            <div
              className="bg-black bg-opacity-60 text-white px-2 py-1 rounded-tl-lg cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/movies/${movie.id}`);
              }}
            >
              <span className="text-yellow-400 font-semibold text-lg inline-block w-20 text-center">
                ⭐ {averageRating}
              </span>
            </div>
            <div
              className="bg-orange-500 text-white text-base w-12 h-7 flex items-center justify-center rounded cursor-pointer"
            >
              {movie.age || 'T18'}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm my-4 font-body hover:underline">
          {movie.title}
        </h3>
      </div>

      {/* Trailer Modal */}
      {showTrailer && movie.trailer_url && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeTrailer}
        >
          <div
            className="bg-black rounded-lg w-full max-w-5xl p-0 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video">
              <video
                width="100%"
                height="100%"
                src={movie.trailer_url}
                controls
                autoPlay
                title={movie.title}
                style={{ border: 'none' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
}