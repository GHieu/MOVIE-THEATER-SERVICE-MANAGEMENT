import React from 'react';

const TrailerModal = ({ show, onClose, movie }) => {
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
          <video
            width="100%"
            height="100%"
            src={movie.trailer_url}
            controls
            autoPlay
            title={movie.title}
            style={{ border: 'none' }}
          >
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;