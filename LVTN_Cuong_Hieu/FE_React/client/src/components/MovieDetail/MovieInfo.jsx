// components/MovieInfo.jsx
import React from 'react';

const MovieInfo = ({ movie }) => {
  return (
    <div className="flex-1 flex flex-col justify-between h-full">
      {/* Tiêu đề và thông tin cơ bản */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          {movie.title}
          {movie.age && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">{movie.age}</span>
          )}
        </h1>

        <div className="flex items-center text-sm text-gray-600 gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="text-orange-500">⏱</span>
            {movie.duration || 126} Phút
          </span>
          <span className="flex items-center gap-1">
            <span className="text-orange-500">📅</span>
            {movie.release_date || "12/06/2025"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-orange-500 text-lg">⭐</span>
          <span className="text-lg font-semibold">{movie.rating || "9.4"}</span>
          <span className="text-gray-500 text-sm">
            ({movie.votes || 97} votes)
          </span>
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div className="space-y-3 mt-6">
        <div className="flex items-start gap-3">
          <span className="text-gray-600 font-medium min-w-[100px]">Quốc gia:</span>
          <span className="text-gray-800">{movie.country || "Mỹ"}</span>
        </div>
        
        <div className="flex items-start gap-3">
          <span className="text-gray-600 font-medium min-w-[100px]">Nhà sản xuất:</span>
          <span className="text-gray-800">{movie.producers || "DreamWorks"}</span>
        </div>
        
        <div className="flex items-start gap-3">
          <span className="text-gray-600 font-medium min-w-[100px]">Thể loại:</span>
          <div className="flex gap-2 flex-wrap">
            {(movie.genre || "Phiêu Lưu,Hành Động,Hài").split(',').map((genre, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                {genre.trim()}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <span className="text-gray-600 font-medium min-w-[100px]">Đạo diễn:</span>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
            {movie.director || "Dean DeBlois"}
          </span>
        </div>
        
        <div className="flex items-start gap-3">
          <span className="text-gray-600 font-medium min-w-[100px]">Diễn viên:</span>
          <div className="flex gap-2 flex-wrap">
            {(movie.cast || "Mason Thames,Nico Parker,Gerard Butler").split(',').map((actor, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                {actor.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;