import React from 'react';
import { useParams } from 'react-router-dom';

export default function MovieDetailPage() {
  const { id } = useParams();

  // Dữ liệu mẫu tạm thời
  const movieList = [
    { id: '1', title: 'Lật Mặt 7', description: 'Một bộ phim hành động hấp dẫn.', poster: '/assets/movie1.jpg' },
    { id: '2', title: 'Đào Phở và Piano', description: 'Bộ phim tình cảm nhẹ nhàng.', poster: '/assets/movie2.jpg' },
    { id: '3', title: 'Tarot', description: 'Phim kinh dị đầy bí ẩn.', poster: '/assets/movie3.jpg' },
    { id: '4', title: 'Quỷ Cẩu', description: 'Phim kinh dị Việt Nam mới.', poster: '/assets/movie4.jpg' },
  ];

  // Tìm phim theo id
  const movie = movieList.find(m => m.id === id);

  // Nếu không tìm thấy
  if (!movie) {
    return <div className="text-center text-white py-10">Không tìm thấy phim.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <img src={movie.poster} alt={movie.title} className="w-full md:w-1/3 rounded-lg" />
        <div>
          <h2 className="text-3xl font-bold text-yellow-400 mb-4">{movie.title}</h2>
          <p className="text-white mb-6">{movie.description}</p>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
            Đặt vé ngay
          </button>
        </div>
      </div>
    </div>
  );
}
