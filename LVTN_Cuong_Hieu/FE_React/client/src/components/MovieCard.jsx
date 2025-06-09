import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaTicketAlt } from 'react-icons/fa';

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);

  const handleCardClick = () => {
    navigate(`/movies/${movie.id}`);
  };

  const handleBookingClick = (e) => {
    e.stopPropagation();
    navigate(`/booking/${movie.id}`);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setShowTrailer(true);
  };

  const closeTrailer = () => setShowTrailer(false);

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.includes('youtu.be/')
      ? url.split('youtu.be/')[1]
      : url.includes('v=')
      ? url.split('v=')[1].split('&')[0]
      : '';
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white  overflow-hidden  transition duration-300 cursor-pointer">
        <div className="relative w-full h-[400px]">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          {/* Overlay Buttons */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center gap-3 p-4 opacity-0 hover:opacity-100 transition">
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
         {/* Movie Info góc dưới bên phải */}
 
          <div className="absolute bottom-0 right-0 flex flex-col items-end gap-1 p-2">
            {/* Rating nằm trên */}
            <div
              className="bg-black bg-opacity-60 text-white px-2 py-1 rounded-tl-lg cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/movies/${movie.id}`);
              }}
            >
              <span className="text-yellow-400 font-semibold text-lg">⭐ {movie.rating || '9.0'}</span>
            </div>

            {/* T18 nằm dưới riêng biệt */}
            <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded cursor-pointer">
              {movie.age || 'T18'}
            </div>
          </div>

            
            
        </div>

        {/* Movie Info */}
          
          <h3 className="text-sm my-4 font-semibold hover:underline">{movie.title}</h3>


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
              <iframe
                width="100%"
                height="100%"
                src={getEmbedUrl(movie.trailer_url)}
                title={movie.title}
                style={{ border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
