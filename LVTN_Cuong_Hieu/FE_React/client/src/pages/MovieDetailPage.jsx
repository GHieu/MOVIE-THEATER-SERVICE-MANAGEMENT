import React from "react";
import ShowTimeTabs from "../components/ShowTimeTabs";
const MovieDetailPage = () => {
  const movie = {
    title: "Yadang: Ba Mặt Lật Kèo",
    description:
      "Trong giới tội phạm ma túy, những người cung cấp thông tin 'Ya-Dang' bán thông tin của tội phạm. Tội phạm sử dụng thông tin này để giảm án, trong khi cơ quan thực thi pháp luật sử dụng thông tin này để bắt giữ. Ya-Dang, cảnh sát và công tố viên tạo thành một tam giác quan trọng.",
    director: "Hwang Byeng-Gug",
    actors: "Kang Ha Neul, Yoo Hae Jin, Park Hae Joon",
    genre: "Hành động",
    duration: "122 phút",
    language: "Tiếng Hàn",
    releaseDate: "16/05/2025",
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/vi/3/35/Ba_M%E1%BA%B7t_L%E1%BA%ADt_K%C3%A8o_poster.jpg",
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Poster */}
        <div className="w-full md:w-1/4 flex-shrink-0">
          <img
            src={movie.posterUrl}
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
            <div>{movie.actors}</div>

            <div className="font-medium">THỂ LOẠI:</div>
            <div>{movie.genre}</div>

            <div className="font-medium">THỜI LƯỢNG:</div>
            <div>{movie.duration}</div>

            <div className="font-medium">NGÔN NGỮ:</div>
            <div>{movie.language}</div>

            <div className="font-medium">KHỞI CHIẾU:</div>
            <div>{movie.releaseDate}</div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        <ShowTimeTabs movieId="abc123" />
      </div>
    </div>
  );
};

export default MovieDetailPage;
