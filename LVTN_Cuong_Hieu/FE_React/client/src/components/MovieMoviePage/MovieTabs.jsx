import React, { useState, useEffect } from 'react';
import MovieCard from '../MovieHomepage/MovieCard';

export default function MovieTabs({ 
  nowShowing = [], 
  comingSoon = [], 
  defaultTab = 'now', 
  onTabChange,
  reviews = [] // <-- Nhận reviews từ props thay vì hook
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  
  return (
    <div>
      {/* Tabs Header */}
      <div className="flex items-center space-x-6 mb-1">
        <h2 className="px-5 py-1 font-semibold">
          <span className="text-yellow-400 border-l-4 border-yellow-400 pl-2 text-2xl">PHIM</span>
        </h2>
        <button
          onClick={() => handleTabClick('now')}
          className={`px-5 py-1 border-b-2 font-semibold transition ${
            activeTab === 'now'
              ? 'border-yellow-500 text-yellow-500'
              : 'border-transparent text-black hover:text-yellow-500'
          }`}
        >
          Đang chiếu
        </button>
        <button
          onClick={() => handleTabClick('coming')}
          className={`px-5 py-1 border-b-2 font-semibold transition ${
            activeTab === 'coming'
              ? 'border-yellow-500 text-yellow-500'
              : 'border-transparent text-black hover:text-yellow-500'
          }`}
        >
          Sắp chiếu
        </button>
      </div>

      {/* Movie Grid */}
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-6">
          {(activeTab === 'now' ? nowShowing : comingSoon).map((movie) => {
            const reviewsForMovie = reviews.filter((r) => r.movie_id === movie.id);
            console.log('All reviews:', reviews);
            console.log('Movie:', movie.title, 'Movie ID:', movie.id, 'Filtered:', reviewsForMovie);

            return <MovieCard key={movie.id} movie={movie} reviews={reviewsForMovie} />;
          })}
        </div>
      </div>
      
    </div>
  );
}