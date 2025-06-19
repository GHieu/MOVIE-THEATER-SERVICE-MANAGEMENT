// components/TrailerModal.jsx
import React from 'react';

const TrailerModal = ({ show, onClose, movie }) => {
  const getEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.includes('youtu.be/')
      ? url.split('youtu.be/')[1]
      : url.includes('v=')
      ? url.split('v=')[1].split('&')[0]
      : '';
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (!show || !movie.trailer_url) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={onClose}
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
  );
};

export default TrailerModal;