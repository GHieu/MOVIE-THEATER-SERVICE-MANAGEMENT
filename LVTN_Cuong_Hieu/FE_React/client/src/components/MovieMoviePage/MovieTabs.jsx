// MovieTabs.jsx
import React, { useState, useEffect } from 'react';
import MovieCard from '../MovieHomepage/MovieCard';

export default function MovieTabs({ nowShowing = [], comingSoon = [], defaultTab = 'now', onTabChange }) {
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
      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => handleTabClick('now')}
          className={`px-6 py-2 border-b-2 font-semibold transition ${
            activeTab === 'now'
              ? 'border-yellow-500 text-yellow-500'
              : 'border-transparent text-gray-500 hover:text-yellow-500'
          }`}
        >
          Đang chiếu
        </button>
        <button
          onClick={() => handleTabClick('coming')}
          className={`px-6 py-2 border-b-2 font-semibold transition ${
            activeTab === 'coming'
              ? 'border-yellow-500 text-yellow-500'
              : 'border-transparent text-gray-500 hover:text-yellow-500'
          }`}
        >
          Sắp chiếu
        </button>
      </div>

      {/* Nội dung phim */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(activeTab === 'now' ? nowShowing : comingSoon).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
