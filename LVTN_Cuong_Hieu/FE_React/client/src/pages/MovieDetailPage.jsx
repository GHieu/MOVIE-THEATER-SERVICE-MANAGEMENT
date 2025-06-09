import React from "react";
import { useParams } from "react-router-dom";
import useMovieDetail from '../hooks/useMovieDetail';
import ShowTimeTabs from "../components/ShowTimeTabs";

const MovieDetailPage = () => {
  const { id } = useParams(); // lấy id từ URL
  const { movie, loading, error } = useMovieDetail(id); // gọi API

  if (loading) return <div className="text-center p-8">Đang tải thông tin phim...</div>;
  if (error || !movie) return <div className="text-center text-red-500 p-8">Không tìm thấy phim.</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Poster */}
        <div className="w-full md:w-1/4 flex-shrink-0">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full rounded-md shadow-md object-cover"
          />
        </div>

        {/* Thông tin phim */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{movie.title}</h1>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">{movie.description}</p>

          <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm text-gray-700">
            <div className="font-medium">ĐẠO DIỄN:</div>
            <div>{movie.director}</div>

            <div className="font-medium">DIỄN VIÊN:</div>
            <div>{movie.cast}</div>

            <div className="font-medium">THỂ LOẠI:</div>
            <div>{movie.genre}</div>

            <div className="font-medium">THỜI LƯỢNG:</div>
            <div>{movie.duration} phút</div>

            <div className="font-medium">KHỞI CHIẾU:</div>
            <div>{movie.release_date}</div>
          </div>
        </div>
      </div>

      {/* Tab suất chiếu */}
      <div className="container mx-auto px-4 py-6">
        <ShowTimeTabs movieId={movie.id} />
      </div>
    </div>
  );
};

export default MovieDetailPage;
