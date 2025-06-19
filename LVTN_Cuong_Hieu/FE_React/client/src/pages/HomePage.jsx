// HomePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Banner from '../components/MovieHomepage/Banner';
import MovieTabs from '../components/MovieMoviePage/MovieTabs';
import NewsSection from '../components/MovieHomepage/NewsSection';
import useMoviesUser from '../hooks/useMovieUser';

export default function HomePage() {
  
  const navigate = useNavigate();
  const { nowShowing, comingSoon, loading, error } = useMoviesUser();
  const [currentTab, setCurrentTab] = useState('now'); // 'now' hoặc 'coming'
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Banner />

        <section className="max-w-7xl mx-auto px-4 py-8">
          {loading && <p className="text-center">Đang tải phim...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <>
              <MovieTabs
                nowShowing={nowShowing}
                comingSoon={comingSoon}
                defaultTab={currentTab}
                onTabChange={setCurrentTab}
              />

              {/* Nút Xem thêm */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => navigate('/movies', { state: { tab: currentTab } })}
                  className="border border-yellow-400 text-yellow-500 bg-white hover:bg-yellow-400 hover:text-white font-semibold px-6 py-2 rounded shadow-md transition duration-300"
                >
                  Xem thêm
                </button>
              </div>
            </>
          )}
        </section>

        <NewsSection />
      </main>
    </div>
  );
}
